<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Password standar untuk kebutuhan testing.
     */
    protected static ?string $password;

    /**
     * Mendefinisikan data pengguna bawaan.
     *
     * Factory secara default menghasilkan akun pelanggan
     * agar sesuai dengan middleware dan alur RentDrive.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' =>
                fake()->name(),

            'email' =>
                fake()
                    ->unique()
                    ->safeEmail(),

            'email_verified_at' =>
                now(),

            'password' =>
                static::$password ??=
                    Hash::make('password'),

            'role' =>
                'pelanggan',

            'remember_token' =>
                Str::random(10),
        ];
    }

    /**
     * Menghasilkan pengguna dengan email belum diverifikasi.
     */
    public function unverified(): static
    {
        return $this->state(
            fn (array $attributes) => [
                'email_verified_at' =>
                    null,
            ]
        );
    }

    /**
     * Menghasilkan akun admin.
     */
    public function admin(): static
    {
        return $this->state(
            fn (array $attributes) => [
                'role' =>
                    'admin',
            ]
        );
    }

    /**
     * Menghasilkan akun owner.
     */
    public function owner(): static
    {
        return $this->state(
            fn (array $attributes) => [
                'role' =>
                    'owner',
            ]
        );
    }
}
