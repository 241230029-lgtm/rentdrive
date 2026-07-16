<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CekKetersediaanRequest;
use App\Models\Kendaraan;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class KetersediaanController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService
    ) {
    }

    /**
     * Menampilkan halaman khusus pemeriksaan
     * stok kendaraan berdasarkan rentang tanggal.
     */
    public function index(): Response
    {
        $kendaraans = Kendaraan::query()
            ->orderBy('nama_kendaraan')
            ->get([
                'id',
                'nama_kendaraan',
                'merek',
                'warna',
                'tahun_pembuatan',
                'transmisi',
                'harga_per_hari',
                'jumlah_unit',
                'plat_nomor',
                'status',
                'foto_kendaraan',
            ])
            ->map(function (Kendaraan $kendaraan): array {
                return [
                    'id' =>
                        $kendaraan->id,

                    'nama_kendaraan' =>
                        $kendaraan->nama_kendaraan,

                    'merek' =>
                        $kendaraan->merek,

                    'warna' =>
                        $kendaraan->warna,

                    'tahun_pembuatan' =>
                        $kendaraan->tahun_pembuatan,

                    'transmisi' =>
                        $kendaraan->transmisi,

                    'harga_per_hari' =>
                        (int) $kendaraan->harga_per_hari,

                    'jumlah_unit' =>
                        (int) $kendaraan->jumlah_unit,

                    'plat_nomor' =>
                        $kendaraan->plat_nomor,

                    'status' =>
                        $kendaraan->status,

                    'foto_kendaraan' =>
                        $kendaraan->foto_kendaraan,
                ];
            })
            ->values();

        $ringkasan = [
            'total_kendaraan' =>
                $kendaraans->count(),

            'total_unit' =>
                (int) $kendaraans->sum(
                    'jumlah_unit'
                ),

            'kendaraan_tersedia' =>
                $kendaraans
                    ->where(
                        'status',
                        'tersedia'
                    )
                    ->count(),

            'kendaraan_perbaikan' =>
                $kendaraans
                    ->where(
                        'status',
                        'perbaikan'
                    )
                    ->count(),

            'kendaraan_tidak_aktif' =>
                $kendaraans
                    ->where(
                        'status',
                        'tidak_aktif'
                    )
                    ->count(),
        ];

        return Inertia::render(
            'Admin/CekKetersediaan',
            [
                'kendaraans' =>
                    $kendaraans,

                'ringkasan' =>
                    $ringkasan,
            ]
        );
    }

    /**
     * Memeriksa stok kendaraan berdasarkan
     * kendaraan dan rentang tanggal.
     */
    public function periksa(
        CekKetersediaanRequest $request
    ): JsonResponse {
        $hasil = $this->bookingService
            ->cekKetersediaan(
                $request->validated()
            );

        return response()->json(
            $hasil
        );
    }
}
