<?php

namespace Tests\Feature;

use App\Models\AdventureRoute;
use App\Models\CheckIn;
use App\Models\Experience;
use App\Models\Score;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdventureApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_facilitator_can_log_in_with_the_demo_password(): void
    {
        $this->seed();

        $this->postJson('/api/auth/login', [
            'email' => 'fasilitator@jeep-adventure.local',
            'password' => 'jeepadventurehebat',
        ])->assertOk();
    }

    public function test_customer_can_register_a_team_and_it_remains_pending(): void
    {
        $customer = $this->makeUser('CUSTOMER');
        $token = $this->login($customer);

        $this->withToken($token)
            ->postJson('/api/teams', [
                'name' => 'Garuda Offroad',
                'initials' => 'GO',
                'motto' => 'Jelajah tanpa batas',
                'color' => '#2868e8',
                'status' => 'approved',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.color', '#2868e8');
    }

    public function test_facilitator_can_choose_and_persist_a_team_identity_color(): void
    {
        $facilitator = $this->makeUser('FACILITATOR');

        $this->actingAs($facilitator)
            ->get(route('teams'))
            ->assertOk()
            ->assertSee('Daftar Tim')
            ->assertSee('data-open-team-modal', false)
            ->assertSee('Tambah Tim Peserta')
            ->assertSee('Warna identitas tim')
            ->assertSee('name="color"', false)
            ->assertSee('#9634e8');

        $this->actingAs($facilitator)
            ->post(route('teams.store'), [
                'name' => 'Ungu Penjelajah',
                'motto' => 'Jelajah tanpa batas',
                'members_text' => 'Anggota Satu',
                'color' => '#9634e8',
                'account_name' => 'Anggota Satu',
                'account_email' => 'anggota@example.test',
                'account_password' => 'password123',
                'account_role' => 'CUSTOMER',
            ])
            ->assertRedirect(route('teams'));

        $this->assertDatabaseHas('teams', [
            'name' => 'Ungu Penjelajah',
            'color' => '#9634e8',
        ]);

        $this->actingAs($facilitator)
            ->get(route('teams'))
            ->assertOk()
            ->assertSee('teams-page-badge')
            ->assertSee('teams-list-card')
            ->assertSee('Ungu Penjelajah')
            ->assertSee('1 anggota')
            ->assertSee('0/0 pos')
            ->assertSee('0 game selesai')
            ->assertSee('teams-delete-button');
    }

    public function test_customer_cannot_add_a_team_from_the_teams_page(): void
    {
        $customer = $this->makeUser('CUSTOMER');

        $this->actingAs($customer)
            ->get(route('teams'))
            ->assertOk()
            ->assertSee('Daftar Tim')
            ->assertDontSee('Daftarkan Tim')
            ->assertDontSee('class="button primary route-add-button" type="button" data-open-team-modal', false)
            ->assertDontSee('<dialog class="route-modal team-modal" data-team-modal', false);

        $this->actingAs($customer)
            ->post(route('teams.store'), [
                'name' => 'Tim Baru',
                'motto' => 'Jelajah bersama',
            ])
            ->assertForbidden();
    }

    public function test_only_facilitators_can_check_in_and_score_a_team(): void
    {
        $facilitator = $this->makeUser('FACILITATOR');
        $token = $this->login($facilitator);
        $team = Team::create([
            'name' => 'Garuda Offroad',
            'initials' => 'GO',
            'motto' => 'Jelajah tanpa batas',
            'status' => 'APPROVED',
        ]);
        $route = $this->makeRoute();

        $this->withToken($token)->postJson('/api/scores', [
            'team_id' => $team->id,
            'route_id' => $route->id,
            'points' => 80,
            'completed' => true,
        ])->assertStatus(409);

        $this->withToken($token)->postJson('/api/checkins', [
            'team_id' => $team->id,
            'route_id' => $route->id,
        ])->assertCreated();

        $this->withToken($token)->postJson('/api/scores', [
            'team_id' => $team->id,
            'route_id' => $route->id,
            'points' => 80,
            'completed' => true,
        ])->assertCreated();

        $this->withToken($token)->postJson('/api/scores', [
            'team_id' => $team->id,
            'route_id' => $route->id,
            'points' => 20,
            'completed' => true,
        ])->assertStatus(409);

        $this->withToken($token)->getJson('/api/leaderboard')
            ->assertOk()
            ->assertJsonPath('data.0.totalPoints', 80);
    }

    public function test_customer_scoreboard_shows_a_ranked_podium_and_remaining_teams(): void
    {
        $customer = $this->makeUser('CUSTOMER');
        $route = $this->makeRoute();

        foreach ([
            ['name' => 'Tim Juara', 'initials' => 'TJ', 'points' => 90, 'color' => '#e9a52b'],
            ['name' => 'Tim Kedua', 'initials' => 'TK', 'points' => 70, 'color' => '#2868e8'],
            ['name' => 'Tim Ketiga', 'initials' => 'TT', 'points' => 50, 'color' => '#e8833a'],
            ['name' => 'Tim Keempat', 'initials' => 'TE', 'points' => 30, 'color' => '#147b73'],
        ] as $teamData) {
            $team = Team::create([
                'name' => $teamData['name'],
                'initials' => $teamData['initials'],
                'motto' => 'Terus berpetualang',
                'status' => 'APPROVED',
                'color' => $teamData['color'],
            ]);
            Score::create([
                'team_id' => $team->id,
                'route_id' => $route->id,
                'points' => $teamData['points'],
                'completed' => true,
            ]);
        }

        $response = $this->actingAs($customer)->get(route('scoreboard'))->assertOk()
            ->assertSee('Peringkat Tim')
            ->assertSee('Peringkat tim')
            ->assertSee('Tim Juara')
            ->assertSee('Tim Kedua')
            ->assertSee('Tim Ketiga')
            ->assertSee('Tim Keempat')
            ->assertSee('podium-stage')
            ->assertSee('rank-first')
            ->assertSee('rank-second')
            ->assertSee('rank-third')
            ->assertSee('scoreboard-rankings')
            ->assertSee('scoreboard-ranking-progress')
            ->assertSee('1/1 pos')
            ->assertDontSee('HASIL TERBARU')
            ->assertDontSee('Skor permainan');

        $rankings = substr($response->getContent(), strpos($response->getContent(), 'scoreboard-rankings'));
        $this->assertLessThan(strpos($rankings, 'Tim Kedua'), strpos($rankings, 'Tim Juara'));
        $this->assertLessThan(strpos($rankings, 'Tim Ketiga'), strpos($rankings, 'Tim Kedua'));
        $this->assertLessThan(strpos($rankings, 'Tim Keempat'), strpos($rankings, 'Tim Ketiga'));
    }

    public function test_customer_scoreboard_keeps_empty_podium_places_until_teams_earn_scores(): void
    {
        $customer = $this->makeUser('CUSTOMER');
        $route = $this->makeRoute();
        $team = Team::create([
            'name' => 'Tim Tunggal',
            'initials' => 'TT',
            'motto' => 'Berpetualang',
            'status' => 'APPROVED',
        ]);
        Score::create([
            'team_id' => $team->id,
            'route_id' => $route->id,
            'points' => 20,
            'completed' => true,
        ]);

        $response = $this->actingAs($customer)->get(route('scoreboard'))
            ->assertOk()
            ->assertSee('Tim Tunggal')
            ->assertSee('podium-second rank-second podium-rank-2 no-team')
            ->assertSee('podium-third rank-third podium-rank-3 no-team')
            ->assertSee('Belum ada tim')
            ->assertSee('scoreboard-ranking-first');

        $this->assertSame(3, substr_count($response->getContent(), 'class="podium-card'));
    }

    public function test_dashboard_shows_the_route_timeline_and_current_leader(): void
    {
        $facilitator = $this->makeUser('FACILITATOR');
        $route = $this->makeRoute();
        $leader = Team::create([
            'name' => 'Tim Puncak',
            'initials' => 'TP',
            'motto' => 'Terus melaju',
            'status' => 'APPROVED',
        ]);
        $otherTeam = Team::create([
            'name' => 'Tim Kedua',
            'initials' => 'TK',
            'motto' => 'Tetap kompak',
            'status' => 'APPROVED',
        ]);
        Score::create([
            'team_id' => $leader->id,
            'route_id' => $route->id,
            'points' => 95,
            'completed' => true,
        ]);
        Score::create([
            'team_id' => $otherTeam->id,
            'route_id' => $route->id,
            'points' => 45,
            'completed' => true,
        ]);

        $this->actingAs($facilitator)->get(route('dashboard'))
            ->assertOk()
            ->assertSee('Petualangan Jeep')
            ->assertSee('Titik Pemberhentian')
            ->assertSee('Skor Tertinggi')
            ->assertSee('Pos Garuda')
            ->assertSee('PEMUNCAK SEMENTARA')
            ->assertSee('Tim Puncak')
            ->assertSee('95 poin')
            ->assertSee($facilitator->name)
            ->assertSee($facilitator->email)
            ->assertSee('sidebar-logout-form')
            ->assertSee('Keluar')
            ->assertSee(route('routes.show', $route), false);
    }

    public function test_routes_page_shows_colored_game_cards_and_real_team_progress(): void
    {
        $facilitator = $this->makeUser('FACILITATOR');
        $route = $this->makeRoute();
        $checkedInTeam = Team::create([
            'name' => 'Tim Check-in',
            'initials' => 'TC',
            'motto' => 'Siap bermain',
            'status' => 'APPROVED',
        ]);
        Team::create([
            'name' => 'Tim Menunggu',
            'initials' => 'TM',
            'motto' => 'Segera menyusul',
            'status' => 'APPROVED',
        ]);
        CheckIn::create(['team_id' => $checkedInTeam->id, 'route_id' => $route->id]);
        Score::create([
            'team_id' => $checkedInTeam->id,
            'route_id' => $route->id,
            'points' => 80,
            'completed' => true,
        ]);

        $this->actingAs($facilitator)->get(route('routes'))
            ->assertOk()
            ->assertSee('Titik Pemberhentian & Mini Games')
            ->assertSee('data-open-route-modal', false)
            ->assertSee('Tambah Pos & Mini Game')
            ->assertSee('name="position"', false)
            ->assertSee('<select name="difficulty" required>', false)
            ->assertSee('value="Mudah" selected', false)
            ->assertSee('value="Sedang"', false)
            ->assertSee('value="Sulit"', false)
            ->assertSee('route-icon-picker')
            ->assertSee('value="target"', false)
            ->assertSee('value="puzzle"', false)
            ->assertSee('value="water"', false)
            ->assertSee('value="team"', false)
            ->assertSee('value="camera"', false)
            ->assertSee('value="compass"', false)
            ->assertSee('name="color"', false)
            ->assertSee('#9634e8')
            ->assertSee('Target Challenge')
            ->assertSee('Bukit Pasir')
            ->assertSee('route-game-icon')
            ->assertSee('<svg class="route-icon-svg"', false)
            ->assertSee('1 check-in')
            ->assertSee('1 check-in')
            ->assertSee('1/2')
            ->assertSee('width: 50%', false)
            ->assertSee(route('routes.show', $route), false);
    }

    public function test_facilitator_can_save_a_route_from_the_add_route_modal(): void
    {
        $facilitator = $this->makeUser('FACILITATOR');

        $this->actingAs($facilitator)
            ->post(route('routes.store'), [
                'position' => 1,
                'name' => 'Pos Merapi',
                'game_type' => 'Team Puzzle',
                'description' => 'Susun puzzle bersama tim.',
                'instruction' => 'Selesaikan sebelum waktu habis.',
                'location' => 'Hutan Pinus',
                'duration' => 15,
                'max_points' => 100,
                'difficulty' => 'Mudah',
                'color' => '#9634e8',
                'icon' => 'puzzle',
            ])
            ->assertRedirect(route('routes'))
            ->assertSessionHas('status', 'Rute berhasil ditambahkan.');

        $this->assertDatabaseHas('routes', [
            'position' => 1,
            'name' => 'Pos Merapi',
            'color' => '#9634e8',
            'icon' => 'puzzle',
            'instruction' => 'Selesaikan sebelum waktu habis.',
        ]);
    }

    public function test_facilitator_can_open_and_save_route_edits_in_a_modal(): void
    {
        $facilitator = $this->makeUser('FACILITATOR');
        $route = $this->makeRoute();

        $this->actingAs($facilitator)
            ->get(route('routes.show', $route))
            ->assertOk()
            ->assertSee('data-open-route-edit-modal', false)
            ->assertSee('data-route-edit-modal', false)
            ->assertSee('Edit Pos')
            ->assertSee('data-close-route-edit-modal', false)
            ->assertSee('value="target" checked', false)
            ->assertSee('Simpan Perubahan');

        $this->patch(route('routes.update', $route), [
            'name' => 'Pos Garuda Baru',
            'game_type' => 'Puzzle Race',
            'location' => 'Hutan Bambu',
            'duration' => 20,
            'max_points' => 120,
            'difficulty' => 'Sulit',
            'color' => '#2868e8',
            'icon' => 'camera',
            'description' => 'Selesaikan puzzle bersama.',
            'instruction' => 'Susun semua kepingan.',
        ])->assertRedirect()
            ->assertSessionHas('status', 'Informasi pos berhasil diperbarui.');

        $this->assertDatabaseHas('routes', [
            'id' => $route->id,
            'name' => 'Pos Garuda Baru',
            'difficulty' => 'Sulit',
            'color' => '#2868e8',
            'icon' => 'camera',
        ]);
    }

    public function test_facilitator_score_photo_is_saved_and_shown_on_the_route_page(): void
    {
        Storage::fake('public');
        $facilitator = $this->makeUser('FACILITATOR');
        $team = Team::create([
            'name' => 'Garuda Offroad',
            'initials' => 'GO',
            'motto' => 'Jelajah tanpa batas',
            'status' => 'APPROVED',
        ]);
        $route = $this->makeRoute();
        CheckIn::create(['team_id' => $team->id, 'route_id' => $route->id]);

        $this->actingAs($facilitator)
            ->post(route('scores.store'), [
                'team_id' => $team->id,
                'route_id' => $route->id,
                'points' => 80,
                'completed' => '1',
                'note' => 'Misi selesai',
                'photo' => UploadedFile::fake()->image('bukti.jpg'),
            ])
            ->assertRedirect();

        $score = Score::firstOrFail();
        Storage::disk('public')->assertExists($score->photo_path);
        $this->assertSame(Storage::disk('public')->url($score->photo_path), $score->photo_url);

        $this->actingAs($facilitator)
            ->get(route('routes.show', $route))
            ->assertOk()
            ->assertSee('route-detail-banner')
            ->assertSee('Target Challenge')
            ->assertSee('Tentang Target Challenge')
            ->assertSee('Catat Skor Tim')
            ->assertSee('Pilih tim peserta')
            ->assertSee('Tandai sebagai selesai')
            ->assertSee($route->color)
            ->assertSee('Uji ketepatan.')
            ->assertSee($score->photo_url)
            ->assertSee('Lihat foto bukti '.$team->name)
            ->assertSee('Check-in tersimpan');

        $customer = $this->makeUser('CUSTOMER');
        $this->actingAs($customer)
            ->get(route('routes.show', $route))
            ->assertOk()
            ->assertSee('route-result-photo-image', false)
            ->assertSee('Bukti foto '.$team->name.' di '.$route->name)
            ->assertSee($score->photo_url)
            ->assertDontSee('Catat Skor Tim');

        $this->actingAs($facilitator)
            ->get(route('scoreboard'))
            ->assertOk()
            ->assertDontSee('HASIL TERBARU')
            ->assertDontSee($score->photo_url)
            ->assertDontSee('Bukti skor '.$team->name);
    }

    public function test_customers_cannot_create_accounts_or_approve_teams(): void
    {
        $customer = $this->makeUser('CUSTOMER');
        $token = $this->login($customer);
        $team = Team::create([
            'name' => 'Naga Liar',
            'initials' => 'NL',
            'motto' => 'Taklukkan medan',
            'status' => 'PENDING',
        ]);

        $this->withToken($token)->postJson('/api/auth/accounts', [
            'name' => 'New Facilitator',
            'email' => 'new@example.test',
            'password' => 'password123',
            'role' => 'FACILITATOR',
        ])->assertForbidden();

        $this->withToken($token)->patchJson("/api/teams/{$team->id}", [
            'status' => 'approved',
        ])->assertForbidden();
    }

    public function test_customer_can_submit_an_experience_with_a_photo(): void
    {
        Storage::fake('public');
        $customer = $this->makeUser('CUSTOMER');
        $token = $this->login($customer);
        $team = Team::create([
            'name' => 'Elang Penjelajah',
            'initials' => 'EP',
            'motto' => 'Terbang tinggi',
            'status' => 'APPROVED',
        ]);
        $route = $this->makeRoute();

        $this->withToken($token)->post('/api/experiences', [
            'team_id' => $team->id,
            'route_id' => $route->id,
            'story' => 'Petualangan yang menyenangkan!',
            'rating' => 5,
            'photo' => UploadedFile::fake()->image('momen.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.team.name', $team->name);

        $this->assertDatabaseCount('experiences', 1);
        $this->assertCount(1, Storage::disk('public')->allFiles('experiences'));
    }

    public function test_customer_can_submit_a_base64_photo_from_the_mobile_app(): void
    {
        Storage::fake('public');
        $customer = $this->makeUser('CUSTOMER');
        $token = $this->login($customer);
        $team = Team::create([
            'name' => 'Elang Penjelajah',
            'initials' => 'EP',
            'motto' => 'Terbang tinggi',
            'status' => 'APPROVED',
        ]);
        $route = $this->makeRoute();
        $photo = UploadedFile::fake()->image('momen.jpg');

        $this->withToken($token)->postJson('/api/experiences', [
            'team_id' => $team->id,
            'route_id' => $route->id,
            'story' => 'Foto dari aplikasi mobile!',
            'rating' => 4,
            'photo_data' => base64_encode(file_get_contents($photo->getPathname())),
            'photo_type' => 'image/jpeg',
        ])->assertCreated()
            ->assertJsonPath('data.media_type', 'image/jpeg');

        $this->assertCount(1, Storage::disk('public')->allFiles('experiences'));
    }

    public function test_experiences_page_shows_share_form_gallery_stats_and_latest_story(): void
    {
        $customer = $this->makeUser('CUSTOMER');
        $team = Team::create([
            'name' => 'Elang Penjelajah',
            'initials' => 'EP',
            'motto' => 'Terbang tinggi',
            'status' => 'APPROVED',
        ]);
        $route = $this->makeRoute();
        Experience::create([
            'user_id' => $customer->id,
            'team_id' => $team->id,
            'route_id' => $route->id,
            'story' => 'Petualangan yang sangat seru!',
            'rating' => 5,
        ]);

        $this->actingAs($customer)
            ->get(route('experiences'))
            ->assertOk()
            ->assertSee('Petualangan Lebih Seru Jika Dibagikan.')
            ->assertSee('Galeri Pengalaman Tim')
            ->assertSee('name="route_id"', false)
            ->assertSee('name="team_id"', false)
            ->assertSee('name="rating"', false)
            ->assertSee('value="5" checked', false)
            ->assertSee('Titik Pemberhentian')
            ->assertSee('Tim Peserta')
            ->assertSee('Cerita Tersimpan')
            ->assertSee('Rating Terbaru')
            ->assertSee('CERITA TERBARU')
            ->assertSee('Petualangan yang sangat seru!')
            ->assertSee('Bagikan ke Instagram');
    }

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'email' => strtolower($role).'@example.test',
            'password' => Hash::make('password123'),
            'role' => $role,
        ]);
    }

    private function login(User $user): string
    {
        return $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertOk()->json('token');
    }

    private function makeRoute(): AdventureRoute
    {
        return AdventureRoute::create([
            'position' => 1,
            'name' => 'Pos Garuda',
            'game_type' => 'Target Challenge',
            'description' => 'Uji ketepatan.',
            'instruction' => 'Lempar bola ke sasaran.',
            'location' => 'Bukit Pasir',
            'duration' => 10,
            'max_points' => 100,
            'difficulty' => 'Mudah',
            'color' => '#e56a00',
        ]);
    }
}
