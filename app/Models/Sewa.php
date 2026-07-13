<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sewa extends Model
{
    protected $fillable = [
        'nomor_booking',
        'user_id',
        'kendaraan_id',
        'jenis_booking',
        'tanggal_mulai',
        'tanggal_selesai',
        'total_harga',
        'bukti_pembayaran',
        'tanggal_kembali_aktual',
        'kondisi_kendaraan_kembali',
        'foto_kondisi_kembali',
        'kilometer_kembali',
        'denda_keterlambatan',
        'denda_kerusakan',
        'total_denda',
        'alasan_penolakan',
        'jenis_penolakan',
        'kategori_penolakan',
        'ditolak_oleh',
        'ditolak_pada',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'tanggal_kembali_aktual' => 'date',
            'ditolak_pada' => 'datetime',
            'total_harga' => 'integer',
            'kilometer_kembali' => 'integer',
            'denda_keterlambatan' => 'integer',
            'denda_kerusakan' => 'integer',
            'total_denda' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kendaraan(): BelongsTo
    {
        return $this->belongsTo(Kendaraan::class);
    }

    public function adminPenolak(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'ditolak_oleh'
        );
    }
}
