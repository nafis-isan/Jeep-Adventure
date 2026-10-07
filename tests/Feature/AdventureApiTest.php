<?php

namespace Tests\Feature;

use App\Models\AdventureRoute;
use App\Models\CheckIn;
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
            ->assertSee($score->photo_url)
            ->assertSee('Bukti skor '.$team->name)
            ->assertSee('Check-in tersimpan');
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
