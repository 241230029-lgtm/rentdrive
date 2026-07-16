<?php

namespace App\Models;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Passwords\CanResetPassword as CanResetPasswordTrait;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements CanResetPasswordContract
{
    use HasFactory;
    use Notifiable;
    use CanResetPasswordTrait;

    /**
     * Kolom yang boleh diisi melalui model.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'no_telepon',
        'alamat',
        'foto_profil',
        'dokumen_ktp',
        'dokumen_sim',
        'status_identitas',
        'identitas_dikirim_pada',
        'identitas_diperiksa_pada',
        'identitas_diperiksa_oleh',
        'alasan_penolakan_identitas',
    ];

    /**
     * Kolom sensitif yang tidak boleh otomatis dikirim
     * ke frontend ketika model diubah menjadi array atau JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
        'dokumen_ktp',
        'dokumen_sim',
    ];

    /**
     * Konversi tipe data kolom.
     *
     * Password otomatis di-hash ketika disimpan.
     * Waktu pengiriman dan pemeriksaan identitas
     * otomatis diubah menjadi objek tanggal.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'identitas_dikirim_pada' => 'datetime',
            'identitas_diperiksa_pada' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Seluruh transaksi penyewaan milik pengguna.
     */
    public function sewas(): HasMany
    {
        return $this->hasMany(Sewa::class);
    }

    /**
     * Admin terakhir yang memeriksa identitas pelanggan.
     */
    public function pemeriksaIdentitas(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'identitas_diperiksa_oleh'
        );
    }

    /**
     * Memeriksa apakah pengguna memiliki role tertentu.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Memeriksa apakah pengguna merupakan pelanggan.
     */
    public function isPelanggan(): bool
    {
        return $this->role === 'pelanggan';
    }

    /**
     * Memeriksa apakah pengguna merupakan admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Memeriksa apakah pengguna merupakan owner.
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Menentukan apakah identitas pelanggan telah lengkap.
     */
    public function identitasLengkap(): bool
    {
        return filled($this->no_telepon)
            && filled($this->alamat)
            && filled($this->dokumen_ktp)
            && filled($this->dokumen_sim);
    }

    /**
     * Menentukan apakah identitas pelanggan telah diverifikasi.
     */
    public function identitasTerverifikasi(): bool
    {
        return $this->status_identitas === 'terverifikasi';
    }

    /**
     * Menentukan apakah identitas sedang menunggu pemeriksaan admin.
     */
    public function identitasMenungguVerifikasi(): bool
    {
        return $this->status_identitas === 'menunggu_verifikasi';
    }

    /**
     * Menentukan apakah identitas ditolak dan perlu diperbaiki.
     */
    public function identitasDitolak(): bool
    {
        return $this->status_identitas === 'ditolak';
    }

    /**
     * Mengirim notifikasi reset password.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(
            new ResetPassword($token)
        );
    }
}
