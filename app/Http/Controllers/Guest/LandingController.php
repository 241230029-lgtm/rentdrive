<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function index(): Response
    {
        $kendaraans = Kendaraan::query()
            ->where('status', 'tersedia')
            ->where('jumlah_unit', '>', 0)
            ->orderByDesc('created_at')
            ->get([
                'id',
                'nama_kendaraan',
                'merek',
                'warna',
                'tahun_pembuatan',
                'transmisi',
                'kapasitas_penumpang',
                'harga_per_hari',
                'jumlah_unit',
                'foto_kendaraan',
                'fasilitas',
                'deskripsi_kendaraan',
            ]);

        return Inertia::render('HalamanUtama', [
            'kendaraans' => $kendaraans,
        ]);
    }
}
