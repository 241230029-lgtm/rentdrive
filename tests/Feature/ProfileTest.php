<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()
            ->create();

        $response = $this
            ->actingAs($user)
            ->get(
                route(
                    'pelanggan.profile.edit',
                    absolute: false
                )
            );

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()
            ->create();

        $response = $this
            ->actingAs($user)
            ->patch(
                route(
                    'pelanggan.profile.update',
                    absolute: false
                ),
                [
                    'name' =>
                        'Test User',

                    'email' =>
                        'test@example.com',
                ]
            );

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(
                route(
                    'pelanggan.profile.edit',
                    absolute: false
                )
            );

        $user->refresh();

        $this->assertSame(
            'Test User',
            $user->name
        );

        $this->assertSame(
            'test@example.com',
            $user->email
        );

        $this->assertNull(
            $user->email_verified_at
        );
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()
            ->create();

        $response = $this
            ->actingAs($user)
            ->patch(
                route(
                    'pelanggan.profile.update',
                    absolute: false
                ),
                [
                    'name' =>
                        'Test User',

                    'email' =>
                        $user->email,
                ]
            );

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(
                route(
                    'pelanggan.profile.edit',
                    absolute: false
                )
            );

        $this->assertNotNull(
            $user
                ->refresh()
                ->email_verified_at
        );
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()
            ->create();

        $response = $this
            ->actingAs($user)
            ->delete(
                route(
                    'pelanggan.profile.destroy',
                    absolute: false
                ),
                [
                    'password' =>
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

        $this->assertNull(
            $user->fresh()
        );
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()
            ->create();

        $urlProfil = route(
            'pelanggan.profile.edit',
            absolute: false
        );

        $response = $this
            ->actingAs($user)
            ->from($urlProfil)
            ->delete(
                route(
                    'pelanggan.profile.destroy',
                    absolute: false
                ),
                [
                    'password' =>
                        'wrong-password',
                ]
            );

        $response
            ->assertSessionHasErrors(
                'password'
            )
            ->assertRedirect(
                $urlProfil
            );

        $this->assertNotNull(
            $user->fresh()
        );
    }
}
