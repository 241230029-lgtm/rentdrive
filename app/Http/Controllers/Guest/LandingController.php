<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Menampilkan landing page RentDrive.
     *
     * Data kendaraan dipetakan secara eksplisit agar informasi internal
     * operasional tidak ikut masuk ke payload halaman publik.
     */
    public function index(): Response
    {
        $kendaraans = Kendaraan::query()
            ->where('status', 'tersedia')
            ->where('jumlah_unit', '>', 0)
            ->latest()
            ->get([
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
            ->map(
                fn (Kendaraan $kendaraan): array => [
                    'id' => $kendaraan->id,
                    'nama_kendaraan' => $kendaraan->nama_kendaraan,
                    'merek' => $kendaraan->merek,
                    'warna' => $kendaraan->warna,
                    'tahun_pembuatan' => $kendaraan->tahun_pembuatan,
                    'transmisi' => $kendaraan->transmisi,
                    'kapasitas_penumpang' => $kendaraan->kapasitas_penumpang,
                    'harga_per_hari' => $kendaraan->harga_per_hari,
                    'foto_kendaraan' => $kendaraan->foto_kendaraan,
                    'fasilitas' => $kendaraan->fasilitas,
                    'deskripsi_kendaraan' => $kendaraan->deskripsi_kendaraan,
                ]
            )
            ->values();

        return Inertia::render('HalamanUtama', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'kendaraans' => $kendaraans,
        ]);
    }
}
