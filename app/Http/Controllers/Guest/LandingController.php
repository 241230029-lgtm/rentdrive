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
            'HalamanUtama',
            [
                'canLogin' =>
                    Route::has('login'),

                'canRegister' =>
                    Route::has('register'),

                'kendaraans' =>
                    $kendaraans,
            ]
        );
    }
}
