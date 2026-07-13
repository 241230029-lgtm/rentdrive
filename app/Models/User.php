<?php

namespace App\Models;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Passwords\CanResetPassword as CanResetPasswordTrait;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements CanResetPasswordContract
{
    use HasFactory;
    use Notifiable;
    use CanResetPasswordTrait;

    /**
     * Kolom yang dapat diisi.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * Kolom yang disembunyikan.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Konversi tipe data kolom.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' =>
                'datetime',

            'password' =>
                'hashed',
        ];
    }

    /**
     * Memeriksa role pengguna.
     */
    public function hasRole(
        string $role
    ): bool {
        return $this->role === $role;
    }

    /**
     * Mengirim pemberitahuan reset password.
     */
    public function sendPasswordResetNotification(
        $token
    ): void {
        $this->notify(
            new ResetPassword($token)
        );
    }
}
