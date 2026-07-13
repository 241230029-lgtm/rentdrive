<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use Inertia\Inertia;
use Inertia\Response;

class KatalogController extends Controller
{
    /**
     * Menampilkan kendaraan yang tersedia.
     */
    public function index(): Response
    {
        $kendaraans = Kendaraan::query()
            ->where(
                'status',
                'tersedia'
            )
            ->where(
                'jumlah_unit',
                '>',
                0
            )
            ->select([
                'id',
                'nama_kendaraan',
                'merek',
                'warna',
                'tahun_pembuatan',
                'transmisi',
                'kapasitas_penumpang',
                'harga_per_hari',
                'foto_kendaraan',
                'fasilitas',
                'deskripsi_kendaraan',
            ])
            ->latest()
            ->get();

        return Inertia::render(
            'Pelanggan/Katalog',
            [
                'kendaraans' =>
                    $kendaraans,
            ]
        );
    }
}
