<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdentitasSewa extends Model
{
    public const STATUS_MENUNGGU_VERIFIKASI =
        'menunggu_verifikasi';

    public const STATUS_TERVERIFIKASI =
        'terverifikasi';

    public const STATUS_DITOLAK =
        'ditolak';

    /**
     * Kolom yang boleh diisi.
     */
    protected $fillable = [
        'sewa_id',
        'nama_pengguna',
        'nik',
        'nomor_sim',
        'no_telepon',
        'alamat',
        'dokumen_ktp',
        'dokumen_sim',
        'status_verifikasi',
        'dikirim_pada',
        'diperiksa_pada',
        'diperiksa_oleh',
        'alasan_penolakan',
    ];

    /**
     * Konversi tipe data.
     */
    protected function casts(): array
    {
        return [
            'dikirim_pada' =>
                'datetime',

            'diperiksa_pada' =>
                'datetime',
        ];
    }

    /**
     * Transaksi pemilik identitas.
     */
    public function sewa(): BelongsTo
    {
        return $this->belongsTo(
            Sewa::class
        );
    }

    /**
     * Admin yang memeriksa identitas.
     */
    public function pemeriksa(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'diperiksa_oleh'
        );
    }

    /**
     * Identitas sedang menunggu pemeriksaan.
     */
    public function menungguVerifikasi(): bool
    {
        return $this->status_verifikasi ===
            self::STATUS_MENUNGGU_VERIFIKASI;
    }

    /**
     * Identitas telah disetujui.
     */
    public function terverifikasi(): bool
    {
        return $this->status_verifikasi ===
            self::STATUS_TERVERIFIKASI;
    }

    /**
     * Identitas ditolak.
     */
    public function ditolak(): bool
    {
        return $this->status_verifikasi ===
            self::STATUS_DITOLAK;
    }

    /**
     * Memastikan seluruh data transaksi lengkap.
     */
    public function lengkap(): bool
    {
        return filled(
            $this->nama_pengguna
        )
            && filled($this->nik)
            && filled($this->nomor_sim)
            && filled($this->no_telepon)
            && filled($this->alamat)
            && filled($this->dokumen_ktp)
            && filled($this->dokumen_sim);
    }
}
