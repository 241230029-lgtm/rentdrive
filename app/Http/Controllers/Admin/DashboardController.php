<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Menampilkan ringkasan operasional administrator.
     */
    public function index(): Response
    {
        /*
         * Status transaksi yang sudah menghasilkan
         * pendapatan untuk perusahaan.
         */
        $statusPendapatan = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
            'selesai',
        ];

        /*
         * Status transaksi yang masih aktif
         * dalam operasional rental.
         */
        $statusTransaksiAktif = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
        ];

        /*
         * Statistik utama dashboard.
         *
         * Nama properti disesuaikan dengan yang dibaca
         * oleh resources/js/Pages/Admin/Dashboard.jsx.
         */
        $statistik = [
            'total_kendaraan' =>
                Kendaraan::query()
                    ->count(),

            'total_unit' =>
                (int) Kendaraan::query()
                    ->sum('jumlah_unit'),

            'total_pelanggan' =>
                User::query()
                    ->where(
                        'role',
                        'pelanggan'
                    )
                    ->count(),

            'total_booking' =>
                Sewa::query()
                    ->count(),

            'booking_menunggu' =>
                Sewa::query()
                    ->where(
                        'status',
                        'menunggu_konfirmasi_admin'
                    )
                    ->count(),

            'transaksi_aktif' =>
                Sewa::query()
                    ->whereIn(
                        'status',
                        $statusTransaksiAktif
                    )
                    ->count(),

            'pendapatan' =>
                (int) Sewa::query()
                    ->whereIn(
                        'status',
                        $statusPendapatan
                    )
                    ->sum('total_harga'),

            'transaksi_selesai' =>
                Sewa::query()
                    ->where(
                        'status',
                        'selesai'
                    )
                    ->count(),

            'menunggu_identitas' =>
                Sewa::query()
                    ->whereIn(
                        'status',
                        [
                            'menunggu_identitas',
                            'menunggu_verifikasi_identitas',
                            'identitas_ditolak',
                        ]
                    )
                    ->count(),

            'menunggu_pembayaran' =>
                Sewa::query()
                    ->whereIn(
                        'status',
                        [
                            'menunggu_pembayaran',
                            'menunggu_verifikasi_pembayaran',
                            'ditolak_pembayaran',
                        ]
                    )
                    ->count(),
        ];

        /*
         * Delapan transaksi terbaru untuk tabel dashboard.
         */
        $bookingTerbaru = Sewa::query()
            ->with([
                'user:id,name,email,no_telepon',
                'kendaraan:id,nama_kendaraan,merek',
            ])
            ->latest('id')
            ->limit(8)
            ->get([
                'id',
                'nomor_booking',
                'user_id',
                'kendaraan_id',
                'jenis_booking',
                'tanggal_mulai',
                'tanggal_selesai',
                'total_harga',
                'metode_pembayaran',
                'status',
                'created_at',
            ])
            ->map(function (Sewa $sewa): array {
                return [
                    'id' =>
                        $sewa->id,

                    'nomor_booking' =>
                        $sewa->nomor_booking,

                    'jenis_booking' =>
                        $sewa->jenis_booking,

                    'tanggal_mulai' =>
                        $sewa->tanggal_mulai
                            ?->format('Y-m-d'),

                    'tanggal_selesai' =>
                        $sewa->tanggal_selesai
                            ?->format('Y-m-d'),

                    'total_harga' =>
                        (int) ($sewa->total_harga ?? 0),

                    'metode_pembayaran' =>
                        $sewa->metode_pembayaran,

                    'status' =>
                        $sewa->status,

                    'created_at' =>
                        $sewa->created_at
                            ?->toIso8601String(),

                    'user' =>
                        $sewa->user
                            ? [
                                'id' =>
                                    $sewa->user->id,

                                'name' =>
                                    $sewa->user->name,

                                'email' =>
                                    $sewa->user->email,

                                'no_telepon' =>
                                    $sewa->user->no_telepon,
                            ]
                            : null,

                    /*
                     * Alias pelanggan dipertahankan agar
                     * tetap kompatibel dengan komponen lama.
                     */
                    'pelanggan' =>
                        $sewa->user
                            ? [
                                'id' =>
                                    $sewa->user->id,

                                'name' =>
                                    $sewa->user->name,

                                'email' =>
                                    $sewa->user->email,
                            ]
                            : null,

                    'kendaraan' =>
                        $sewa->kendaraan
                            ? [
                                'id' =>
                                    $sewa->kendaraan->id,

                                'nama_kendaraan' =>
                                    $sewa->kendaraan
                                        ->nama_kendaraan,

                                'merek' =>
                                    $sewa->kendaraan->merek,
                            ]
                            : null,
                ];
            })
            ->values();

        /*
         * Sepuluh aktivitas admin terbaru.
         */
        $aktivitasTerbaru = LogAktivitas::query()
            ->with([
                'user:id,name,email',
            ])
            ->latest('id')
            ->limit(10)
            ->get([
                'id',
                'user_id',
                'jenis_aktivitas',
                'deskripsi',
                'alamat_ip',
                'created_at',
            ])
            ->map(function (LogAktivitas $aktivitas): array {
                return [
                    'id' =>
                        $aktivitas->id,

                    'jenis_aktivitas' =>
                        $aktivitas->jenis_aktivitas,

                    'deskripsi' =>
                        $aktivitas->deskripsi,

                    'alamat_ip' =>
                        $aktivitas->alamat_ip,

                    'created_at' =>
                        $aktivitas->created_at
                            ?->toIso8601String(),

                    'user' =>
                        $aktivitas->user
                            ? [
                                'id' =>
                                    $aktivitas->user->id,

                                'name' =>
                                    $aktivitas->user->name,

                                'email' =>
                                    $aktivitas->user->email,
                            ]
                            : null,
                ];
            })
            ->values();

        return Inertia::render(
            'Admin/Dashboard',
            [
                'statistik' =>
                    $statistik,

                'bookingTerbaru' =>
                    $bookingTerbaru,

                'aktivitasTerbaru' =>
                    $aktivitasTerbaru,
            ]
        );
    }
}
