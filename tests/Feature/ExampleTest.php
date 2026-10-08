<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_login_page_is_available_to_guests(): void
    {
        $response = $this->get('/login');

        $response->assertOk()
            ->assertSee('Welcome back')
            ->assertSee('Log in to your account')
            ->assertSee('name="email"', false)
            ->assertSee('name="password"', false)
            ->assertSee('Forgot password?')
            ->assertSee('action="'.route('login.store').'"', false);
    }
}
