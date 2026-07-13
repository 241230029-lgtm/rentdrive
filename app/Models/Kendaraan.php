<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kendaraan extends Model
{
    use HasFactory;

    /**
     * Kolom yang dapat diisi secara massal.
     */
    protected $fillable = [
        'nama_kendaraan',
        'merek',
        'warna',
        'tahun_pembuatan',
        'transmisi',
        'kapasitas_penumpang',
        'harga_per_hari',
        'jumlah_unit',
        'plat_nomor',
        'status',
        'foto_kendaraan',
        'fasilitas',
        'deskripsi_kendaraan',
    ];

    /**
     * Konversi tipe data atribut kendaraan.
     */
    protected function casts(): array
    {
        return [
            'tahun_pembuatan' =>
                'integer',

            'kapasitas_penumpang' =>
                'integer',

            'harga_per_hari' =>
                'integer',

            'jumlah_unit' =>
                'integer',
        ];
    }

    /**
     * Seluruh transaksi penyewaan kendaraan.
     */
    public function sewas(): HasMany
    {
        return $this->hasMany(
            Sewa::class,
            'kendaraan_id'
        );
    }
}
