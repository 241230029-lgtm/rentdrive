<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get(
            route(
                'register',
                absolute: false
            )
        );

        $response->assertOk();
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post(
            route(
                'register',
                absolute: false
            ),
            [
                'name' =>
                    'Test User',

                'email' =>
                    'test@example.com',

                'password' =>
                    'password',

                'password_confirmation' =>
                    'password',
            ]
        );

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(
                route(
                    'landing_page',
                    absolute: false
                )
            );

        $this->assertGuest();

        $this->assertDatabaseHas(
            'users',
            [
                'name' =>
                    'Test User',

                'email' =>
                    'test@example.com',

                'role' =>
                    'pelanggan',
            ]
        );
    }
}
