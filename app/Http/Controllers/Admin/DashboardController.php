<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use App\Models\Sewa;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard administrator RentDrive.
     *
     * Data dan halaman React tetap sama seperti sebelumnya.
     * Perubahan ini hanya memindahkan query dari routes/admin.php
     * ke controller agar struktur route lebih rapi.
     */
    public function index(): Response
    {
        return Inertia::render(
            'Admin/Dashboard',
            [
                'ringkasan' => [
                    'jumlahKendaraan' =>
                        Kendaraan::query()
                            ->count(),

                    'jumlahUnit' =>
                        Kendaraan::query()
                            ->sum('jumlah_unit'),

                    'menungguKonfirmasi' =>
                        Sewa::query()
                            ->where(
                                'status',
                                'menunggu_konfirmasi_admin'
                            )
                            ->count(),

                    'menungguPembayaran' =>
                        Sewa::query()
                            ->where(
                                'status',
                                'menunggu_pembayaran'
                            )
                            ->count(),

                    'menungguVerifikasi' =>
                        Sewa::query()
                            ->where(
                                'status',
                                'menunggu_verifikasi_pembayaran'
                            )
                            ->count(),

                    'rentalAktif' =>
                        Sewa::query()
                            ->whereIn(
                                'status',
                                [
                                    'disetujui_operasional',
                                    'sedang_berlangsung',
                                    'menunggu_verifikasi_pengembalian',
                                ]
                            )
                            ->count(),

                    'transaksiSelesai' =>
                        Sewa::query()
                            ->where(
                                'status',
                                'selesai'
                            )
                            ->count(),
                ],

                'transaksiTerbaru' =>
                    Sewa::query()
                        ->with([
                            'user:id,name,email',
                            'kendaraan:id,nama_kendaraan,merek',
                        ])
                        ->latest()
                        ->limit(6)
                        ->get([
                            'id',
                            'nomor_booking',
                            'user_id',
                            'kendaraan_id',
                            'jenis_booking',
                            'tanggal_mulai',
                            'tanggal_selesai',
                            'total_harga',
                            'status',
                            'created_at',
                        ]),
            ]
        );
    }
}
