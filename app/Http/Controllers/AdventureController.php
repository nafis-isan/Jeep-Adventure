<?php

namespace App\Http\Controllers;

use App\Models\AdventureRoute;
use App\Models\CheckIn;
use App\Models\Experience;
use App\Models\Score;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\BinaryFileResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use Laravel\Sanctum\PersonalAccessToken;

class AdventureController extends Controller
{
    public function mobileApp(): BinaryFileResponse
    {
        $entry = public_path('mobile/index.html');
        abort_unless(is_file($entry), 503, 'React Native Web belum dibangun. Jalankan npm run build:web dari mobile/.');

        return response()->file($entry);
    }

    public function showLogin(): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if ($request->expectsJson()) {
            $user = User::where('email', $credentials['email'])->first();
            if (! $user || ! Hash::check($credentials['password'], $user->password)) {
                return response()->json(['success' => false, 'message' => 'Email atau password salah.'], 401);
            }

            return response()->json([
                'success' => true,
                'token' => $user->createToken('jeep-adventure-mobile')->plainTextToken,
                'user' => $this->userData($user),
            ]);
        }

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        $request->session()->regenerate();
        $user = $request->user();

        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request): RedirectResponse|JsonResponse
    {
        $currentToken = $request->user()?->currentAccessToken();
        if ($currentToken instanceof PersonalAccessToken) {
            $currentToken->delete();
        } else {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Logged out']);
        }

        return redirect()->route('login');
    }

    public function me(Request $request)
    {
        return response()->json([
            'authenticated' => true,
            'user' => $this->userData($request->user()),
        ]);
    }

    public function createAccount(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['CUSTOMER', 'FACILITATOR'])],
        ]);
        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
        ]);

        return response()->json(['success' => true, 'user' => $this->userData($user)], 201);
    }

    public function dashboard(): View
    {
        $teams = Team::with(['members', 'scores'])->orderBy('created_at')->get();
        $scores = Score::with(['team', 'route'])->latest()->take(8)->get();

        return view('app.dashboard', [
            'teams' => $teams,
            'routes' => AdventureRoute::orderBy('position')->get(),
            'recentScores' => $scores,
            'experiences' => Experience::with(['team', 'route', 'user'])->latest()->take(3)->get(),
            'stats' => [
                'teams' => $teams->count(),
                'routes' => AdventureRoute::count(),
                'scores' => Score::where('completed', true)->count(),
                'points' => Score::sum('points'),
            ],
        ]);
    }

    public function teams(Request $request)
    {
        $teams = Team::with(['members', 'scores', 'checkIns'])
            ->orderBy('created_at')
            ->get()
            ->map(fn (Team $team) => $this->teamData($team));

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'data' => $teams]);
        }

        return view('app.teams', [
            'teams' => $teams,
            'totalRoutes' => AdventureRoute::count(),
        ]);
    }

    public function storeTeam(Request $request)
    {
        if ($request->exists('members_text')) {
            $members = collect(preg_split('/\R/', (string) $request->input('members_text')))
                ->map(fn ($member) => trim($member))
                ->filter()
                ->values()
                ->all();
            $request->merge(['members' => $members]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'initials' => ['nullable', 'string', 'min:2', 'max:5'],
            'motto' => ['required', 'string', 'min:2', 'max:255'],
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'members' => ['sometimes', 'array'],
            'members.*' => ['string', 'min:1', 'max:255'],
            'status' => ['sometimes', Rule::in(['pending', 'approved', 'rejected', 'PENDING', 'APPROVED', 'REJECTED'])],
            'account_name' => ['required_with:account_email', 'nullable', 'string', 'min:2', 'max:255'],
            'account_email' => ['required_with:account_name,account_password', 'nullable', 'email', 'max:255', 'unique:users,email'],
            'account_password' => ['required_with:account_email', 'nullable', 'string', 'min:8'],
            'account_role' => ['nullable', Rule::in(['CUSTOMER', 'FACILITATOR'])],
        ]);

        if (! $request->expectsJson() && $request->user()->isFacilitator()) {
            $request->validate([
                'account_name' => ['required', 'string', 'min:2', 'max:255'],
                'account_email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'account_password' => ['required', 'string', 'min:8'],
            ]);
        }

        $user = $request->user();
        if (! $user->isFacilitator() && $request->filled('account_email')) {
            abort(403, 'Only facilitators can create participant accounts.');
        }

        $team = DB::transaction(function () use ($data, $user): Team {
            $team = Team::create([
                'name' => $data['name'],
                'initials' => strtoupper($data['initials'] ?? collect(preg_split('/\s+/', trim($data['name'])))->map(fn ($part) => mb_substr($part, 0, 1))->take(2)->implode('')),
                'motto' => $data['motto'],
                'color' => $data['color'] ?? '#59746b',
                'status' => $user->isFacilitator()
                    ? strtoupper($data['status'] ?? 'APPROVED')
                    : 'PENDING',
            ]);

            foreach ($data['members'] ?? [] as $member) {
                $team->members()->create(['name' => $member]);
            }

            if (! empty($data['account_email'])) {
                User::create([
                    'name' => $data['account_name'],
                    'email' => $data['account_email'],
                    'password' => Hash::make($data['account_password']),
                    'role' => $data['account_role'] ?? 'CUSTOMER',
                ]);
            }

            return $team->load(['members', 'scores', 'checkIns']);
        });

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'data' => $this->teamData($team)], 201);
        }

        return redirect()->route('teams')->with('status', 'Tim dan akun peserta berhasil dibuat.');
    }

    public function updateTeam(Request $request, Team $team)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected', 'PENDING', 'APPROVED', 'REJECTED'])],
        ]);
        $team->update(['status' => strtoupper($data['status'])]);

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $team])
            : back()->with('status', 'Status tim berhasil diperbarui.');
    }

    public function deleteTeam(Request $request, Team $team)
    {
        $team->delete();

        return $request->expectsJson()
            ? response()->json(['success' => true])
            : redirect()->route('teams')->with('status', 'Tim berhasil dihapus.');
    }

    public function routes(Request $request)
    {
        $query = AdventureRoute::withCount('scores')->orderBy('position');

        if (! $request->expectsJson()) {
            $query->withCount('checkIns')
                ->withCount(['scores as completed_scores_count' => fn ($scores) => $scores->where('completed', true)]);
        }

        $routes = $query->get();

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $routes])
            : view('app.routes', [
                'routes' => $routes,
                'totalTeams' => Team::where('status', 'APPROVED')->count(),
            ]);
    }

    public function storeRoute(Request $request)
    {
        $data = $request->validate([
            'position' => ['required', 'integer', 'min:0', 'unique:routes,position'],
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'game_type' => ['required', 'string', 'min:2', 'max:255'],
            'description' => ['required', 'string', 'min:2'],
            'instruction' => ['nullable', 'string'],
            'location' => ['required', 'string', 'min:2', 'max:255'],
            'duration' => ['required', 'integer', 'min:0'],
            'max_points' => ['required', 'integer', 'min:0'],
            'difficulty' => ['required', 'string', 'min:2', 'max:100'],
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'icon' => ['nullable', Rule::in(array_keys(AdventureRoute::ICONS))],
        ]);
        $data['instruction'] = $data['instruction'] ?? '';
        $data['color'] = $data['color'] ?? '#147b73';
        $data['icon'] = $data['icon'] ?? AdventureRoute::iconForPosition((int) $data['position']);
        $route = AdventureRoute::create($data);

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $route], 201)
            : redirect()->route('routes')->with('status', 'Rute berhasil ditambahkan.');
    }

    public function updateRoute(Request $request, AdventureRoute $route)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:255'],
            'game_type' => ['sometimes', 'required', 'string', 'min:2', 'max:255'],
            'description' => ['sometimes', 'required', 'string', 'min:2'],
            'instruction' => ['sometimes', 'nullable', 'string'],
            'location' => ['sometimes', 'required', 'string', 'min:2', 'max:255'],
            'duration' => ['sometimes', 'required', 'integer', 'min:1'],
            'max_points' => ['sometimes', 'required', 'integer', 'min:0'],
            'difficulty' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'color' => ['sometimes', 'required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'icon' => ['sometimes', 'required', Rule::in(array_keys(AdventureRoute::ICONS))],
        ]);
        if ($data === []) {
            throw ValidationException::withMessages([
                'route' => 'Setidaknya satu informasi rute harus diperbarui.',
            ]);
        }
        if (array_key_exists('instruction', $data) && $data['instruction'] === null) {
            $data['instruction'] = '';
        }
        $route->update($data);

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $route])
            : back()->with('status', 'Informasi pos berhasil diperbarui.');
    }

    public function deleteRoute(Request $request, AdventureRoute $route)
    {
        $route->delete();

        return $request->expectsJson()
            ? response()->json(['success' => true])
            : redirect()->route('routes')->with('status', 'Rute berhasil dihapus.');
    }

    public function routeDetail(AdventureRoute $route): View
    {
        $route->load([
            'checkIns.team.members',
            'scores' => fn ($scores) => $scores->with('team')->orderByDesc('points'),
        ]);

        return view('app.route-detail', [
            'route' => $route,
            'teams' => Team::with('members')->orderBy('name')->get(),
        ]);
    }

    public function apiRoute(AdventureRoute $route)
    {
        return response()->json([
            'success' => true,
            'data' => $route->load(['checkIns.team', 'scores.team']),
        ]);
    }

    public function checkIns(Request $request)
    {
        $items = CheckIn::with('team')->when(
            $request->query('route_id', $request->query('routeId')),
            fn ($query, $routeId) => $query->where('route_id', $routeId)
        )->orderBy('created_at')->get();

        return response()->json(['success' => true, 'data' => $items]);
    }

    public function storeCheckIn(Request $request)
    {
        $data = $request->validate([
            'team_id' => ['required', 'uuid', 'exists:teams,id'],
            'route_id' => ['required', 'uuid', 'exists:routes,id'],
        ]);
        $checkIn = CheckIn::firstOrCreate($data);

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $checkIn->load('team')], 201)
            : back()->with('status', 'Check-in tim berhasil dicatat.');
    }

    public function deleteCheckIn(Request $request)
    {
        $data = $request->validate([
            'team_id' => ['required', 'uuid', 'exists:teams,id'],
            'route_id' => ['required', 'uuid', 'exists:routes,id'],
        ]);
        CheckIn::where($data)->delete();

        return $request->expectsJson()
            ? response()->json(['success' => true])
            : back()->with('status', 'Check-in berhasil dibatalkan.');
    }

    public function scores(Request $request)
    {
        $scores = Score::with(['team', 'route'])
            ->when($request->query('route_id', $request->query('routeId')), fn ($query, $routeId) => $query->where('route_id', $routeId))
            ->latest()
            ->get();

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $scores])
            : view('app.scoreboard', [
                'leaderboard' => $this->leaderboardData(),
                'totalRoutes' => AdventureRoute::count(),
                'scores' => $scores,
            ]);
    }

    public function storeScore(Request $request)
    {
        $data = $request->validate([
            'team_id' => ['required', 'uuid', 'exists:teams,id'],
            'route_id' => ['required', 'uuid', 'exists:routes,id'],
            'points' => ['required', 'integer', 'min:0'],
            'completed' => ['required', 'boolean'],
            'note' => ['nullable', 'string', 'max:5000'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'photo_data' => ['nullable', 'string', 'max:7000000'],
            'photo_type' => ['required_with:photo_data', Rule::in(['image/jpeg', 'image/png', 'image/webp'])],
        ]);

        if (! $data['completed']) {
            throw ValidationException::withMessages([
                'completed' => 'Skor hanya dapat disimpan setelah game selesai.',
            ]);
        }

        if (! CheckIn::where('team_id', $data['team_id'])->where('route_id', $data['route_id'])->exists()) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Tim harus check-in sebelum mengisi skor.'], 409);
            }

            throw ValidationException::withMessages(['team_id' => 'Tim harus check-in sebelum mengisi skor.']);
        }
        if (Score::where('team_id', $data['team_id'])->where('route_id', $data['route_id'])->exists()) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Skor tim di pos ini sudah tersimpan.'], 409);
            }

            throw ValidationException::withMessages(['team_id' => 'Skor tim di pos ini sudah tersimpan.']);
        }

        $score = DB::transaction(function () use ($request, $data): Score {
            if ($request->hasFile('photo')) {
                $data['photo_path'] = $request->file('photo')->store('score-evidence', 'public');
            } elseif (! empty($data['photo_data'])) {
                $data['photo_path'] = $this->storeBase64Image($data['photo_data'], $data['photo_type'], 'score-evidence');
            }
            unset($data['photo'], $data['photo_data'], $data['photo_type']);

            return Score::create($data)->load(['team', 'route']);
        });

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $score], 201)
            : back()->with('status', 'Skor berhasil disimpan.');
    }

    public function leaderboard(Request $request)
    {
        $data = $this->leaderboardData();

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $data])
            : view('app.scoreboard', [
                'leaderboard' => $data,
                'totalRoutes' => AdventureRoute::count(),
                'scores' => Score::with(['team', 'route'])->latest()->take(20)->get(),
            ]);
    }

    public function experiences(Request $request)
    {
        $experiences = Experience::with([
            'team:id,name,initials',
            'route:id,name,game_type,location',
            'user:id,name',
        ])->latest()->take(50)->get();

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $experiences])
            : view('app.experiences', [
                'experiences' => $experiences,
                'teams' => Team::orderBy('name')->get(),
                'routes' => AdventureRoute::orderBy('position')->get(),
                'experienceStats' => [
                    'routes' => AdventureRoute::count(),
                    'teams' => Team::where('status', 'APPROVED')->count(),
                    'stories' => Experience::count(),
                    'latestRating' => $experiences->first()?->rating ?? 0,
                ],
            ]);
    }

    public function downloadExperiencePhoto(Experience $experience)
    {
        abort_unless(
            $experience->media_path && Storage::disk('public')->exists($experience->media_path),
            404,
            'Foto pengalaman tidak ditemukan.'
        );

        $extension = pathinfo($experience->media_path, PATHINFO_EXTENSION) ?: 'jpg';

        return Storage::disk('public')->download($experience->media_path, "jeep-adventure-story.{$extension}");
    }

    public function storeExperience(Request $request)
    {
        $data = $request->validate([
            'team_id' => ['required', 'uuid', 'exists:teams,id'],
            'route_id' => ['required', 'uuid', 'exists:routes,id'],
            'story' => ['required', 'string', 'min:1', 'max:280'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'photo_data' => ['nullable', 'string', 'max:7000000'],
            'photo_type' => ['required_with:photo_data', Rule::in(['image/jpeg', 'image/png', 'image/webp'])],
        ]);

        $experience = DB::transaction(function () use ($request, $data): Experience {
            if ($request->hasFile('photo')) {
                $data['media_path'] = $request->file('photo')->store('experiences', 'public');
                $data['media_type'] = $request->file('photo')->getMimeType();
            } elseif (! empty($data['photo_data'])) {
                $data['media_path'] = $this->storeBase64Image($data['photo_data'], $data['photo_type'], 'experiences');
                $data['media_type'] = $data['photo_type'];
            }
            unset($data['photo'], $data['photo_data'], $data['photo_type']);
            $data['user_id'] = $request->user()->id;

            return Experience::create($data)->load([
                'team:id,name,initials',
                'route:id,name,game_type',
                'user:id,name',
            ]);
        });

        return $request->expectsJson()
            ? response()->json(['success' => true, 'data' => $experience], 201)
            : redirect()->route('experiences')->with('status', 'Pengalaman berhasil disimpan.');
    }

    private function userData(User $user): array
    {
        return $user->only(['id', 'name', 'email', 'role']);
    }

    private function teamData(Team $team): array
    {
        return [
            ...$team->toArray(),
            'completedRoutes' => $team->checkIns->count(),
            'completedGames' => $team->scores->where('completed', true)->count(),
            'totalPoints' => $team->scores->sum('points'),
        ];
    }

    private function leaderboardData()
    {
        return Team::with('scores')
            ->get()
            ->map(fn (Team $team) => [
                'teamId' => $team->id,
                'name' => $team->name,
                'initials' => $team->initials,
                'color' => $team->color,
                'totalPoints' => $team->scores->sum('points'),
                'completedGames' => $team->scores->where('completed', true)->count(),
            ])
            ->sortByDesc('totalPoints')
            ->values();
    }

    private function storeBase64Image(string $data, string $mimeType, string $directory): string
    {
        if (preg_match('/^data:(image\/(?:jpeg|png|webp));base64,(.*)$/s', $data, $matches)) {
            if ($matches[1] !== $mimeType) {
                throw ValidationException::withMessages(['photo_data' => 'Tipe foto tidak sesuai.']);
            }
            $data = $matches[2];
        }

        $contents = base64_decode($data, true);
        $image = $contents === false ? false : getimagesizefromstring($contents);
        if (
            $contents === false
            || strlen($contents) > 5 * 1024 * 1024
            || $image === false
            || $image['mime'] !== $mimeType
        ) {
            throw ValidationException::withMessages(['photo_data' => 'Foto tidak valid atau ukurannya melebihi 5 MB.']);
        }

        $extension = match ($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        };
        $path = $directory.'/'.Str::uuid().'.'.$extension;
        if (! Storage::disk('public')->put($path, $contents)) {
            throw new \RuntimeException('Foto gagal disimpan.');
        }

        return $path;
    }
}
