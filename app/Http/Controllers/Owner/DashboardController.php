<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Menampilkan ringkasan bisnis kepada owner.
     */
    public function index(): Response
    {
        /*
         * Transaksi yang sudah sah secara operasional
         * dapat diperhitungkan sebagai pendapatan.
         */
        $statusPendapatan = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
            'selesai',
        ];

        /*
         * Transaksi yang masih berjalan dan belum selesai.
         */
        $statusAktif = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
        ];

        $totalTransaksi = Sewa::query()
            ->count();

        $transaksiAktif = Sewa::query()
            ->whereIn(
                'status',
                $statusAktif
            )
            ->count();

        $transaksiSelesai = Sewa::query()
            ->where(
                'status',
                'selesai'
            )
            ->count();

        $totalPendapatanSewa = (int) Sewa::query()
            ->whereIn(
                'status',
                $statusPendapatan
            )
            ->sum('total_harga');

        /*
         * Denda baru menjadi pendapatan setelah
         * proses pengembalian selesai.
         */
        $totalPendapatanDenda = (int) Sewa::query()
            ->where(
                'status',
                'selesai'
            )
            ->sum('total_denda');

        $totalPendapatan =
            $totalPendapatanSewa
            + $totalPendapatanDenda;

        $totalPelanggan = User::query()
            ->where(
                'role',
                'pelanggan'
            )
            ->count();

        $totalKendaraan = Kendaraan::query()
            ->count();

        $kendaraanTersedia = Kendaraan::query()
            ->where(
                'status',
                'tersedia'
            )
            ->count();

        $kendaraanPerbaikan = Kendaraan::query()
            ->where(
                'status',
                'perbaikan'
            )
            ->count();

        $kendaraanDisewa = Sewa::query()
            ->whereIn(
                'status',
                $statusAktif
            )
            ->whereNotNull(
                'kendaraan_id'
            )
            ->distinct()
            ->count('kendaraan_id');

        /*
         * Menyusun tren pendapatan enam bulan terakhir.
         * Pengelompokan dilakukan di PHP agar struktur
         * hasil konsisten untuk frontend.
         */
        $awalPeriode = now()
            ->startOfMonth()
            ->subMonths(5);

        $transaksiPendapatan = Sewa::query()
            ->whereIn(
                'status',
                $statusPendapatan
            )
            ->whereDate(
                'tanggal_mulai',
                '>=',
                $awalPeriode->toDateString()
            )
            ->orderBy('tanggal_mulai')
            ->get([
                'id',
                'kendaraan_id',
                'tanggal_mulai',
                'total_harga',
                'total_denda',
                'status',
            ]);

        $pendapatanPerBulan =
            $transaksiPendapatan
                ->groupBy(
                    fn (Sewa $sewa): string =>
                        Carbon::parse(
                            $sewa->tanggal_mulai
                        )->format('Y-m')
                );

        $trenPendapatan = collect();

        for ($i = 0; $i < 6; $i++) {
            $bulan = $awalPeriode
                ->copy()
                ->addMonths($i);

            $periode = $bulan->format('Y-m');

            /** @var Collection<int, Sewa> $transaksiBulan */
            $transaksiBulan =
                $pendapatanPerBulan->get(
                    $periode,
                    collect()
                );

            $totalSewa = (int) $transaksiBulan
                ->sum('total_harga');

            $totalDenda = (int) $transaksiBulan
                ->where(
                    'status',
                    'selesai'
                )
                ->sum('total_denda');

            $trenPendapatan->push([
                'bulan' =>
                    $periode,

                'label' =>
                    $bulan->translatedFormat(
                        'M Y'
                    ),

                'total' =>
                    $totalSewa + $totalDenda,

                'pendapatan' =>
                    $totalSewa + $totalDenda,

                'jumlah_transaksi' =>
                    $transaksiBulan->count(),
            ]);
        }

        /*
         * Kendaraan dengan jumlah transaksi terbanyak.
         */
        $kendaraanTerlaris = Sewa::query()
            ->with([
                'kendaraan:id,nama_kendaraan,merek,plat_nomor',
            ])
            ->whereIn(
                'status',
                $statusPendapatan
            )
            ->whereNotNull(
                'kendaraan_id'
            )
            ->get([
                'id',
                'kendaraan_id',
                'total_harga',
                'total_denda',
                'status',
            ])
            ->filter(
                fn (Sewa $sewa): bool =>
                    $sewa->kendaraan !== null
            )
            ->groupBy('kendaraan_id')
            ->map(function (
                Collection $transaksi
            ): array {
                /** @var Sewa $transaksiPertama */
                $transaksiPertama =
                    $transaksi->first();

                $pendapatanSewa =
                    (int) $transaksi
                        ->sum('total_harga');

                $pendapatanDenda =
                    (int) $transaksi
                        ->where(
                            'status',
                            'selesai'
                        )
                        ->sum('total_denda');

                return [
                    'id' =>
                        $transaksiPertama
                            ->kendaraan
                            ->id,

                    'nama_kendaraan' =>
                        $transaksiPertama
                            ->kendaraan
                            ->nama_kendaraan,

                    'nama' =>
                        $transaksiPertama
                            ->kendaraan
                            ->nama_kendaraan,

                    'merek' =>
                        $transaksiPertama
                            ->kendaraan
                            ->merek,

                    'plat_nomor' =>
                        $transaksiPertama
                            ->kendaraan
                            ->plat_nomor,

                    'total_sewa' =>
                        $transaksi->count(),

                    'jumlah_sewa' =>
                        $transaksi->count(),

                    'total_disewa' =>
                        $transaksi->count(),

                    'pendapatan' =>
                        $pendapatanSewa
                        + $pendapatanDenda,
                ];
            })
            ->sortByDesc('total_sewa')
            ->take(10)
            ->values();

        /*
         * Aktivitas admin tetap dikirim untuk menjaga
         * kompatibilitas apabila digunakan kembali.
         */
        $aktivitasAdmin = LogAktivitas::query()
            ->with([
                'user:id,name,email',
            ])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function (
                LogAktivitas $aktivitas
            ): array {
                return [
                    'id' =>
                        $aktivitas->id,

                    'jenis_aktivitas' =>
                        $aktivitas
                            ->jenis_aktivitas,

                    'jenis' =>
                        $aktivitas
                            ->jenis_aktivitas,

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
                                    $aktivitas
                                        ->user
                                        ->id,

                                'name' =>
                                    $aktivitas
                                        ->user
                                        ->name,

                                'email' =>
                                    $aktivitas
                                        ->user
                                        ->email,
                            ]
                            : null,
                ];
            })
            ->values();

        return Inertia::render(
            'Owner/Dashboard',
            [
                'statistik' => [
                    'total_pendapatan' =>
                        $totalPendapatan,

                    'pendapatan' =>
                        $totalPendapatan,

                    'pendapatan_sewa' =>
                        $totalPendapatanSewa,

                    'pendapatan_denda' =>
                        $totalPendapatanDenda,

                    'total_transaksi' =>
                        $totalTransaksi,

                    'transaksi_aktif' =>
                        $transaksiAktif,

                    'transaksi_selesai' =>
                        $transaksiSelesai,

                    'total_pelanggan' =>
                        $totalPelanggan,

                    'total_kendaraan' =>
                        $totalKendaraan,

                    'total_armada' =>
                        $totalKendaraan,

                    'status_kendaraan' => [
                        'tersedia' =>
                            $kendaraanTersedia,

                        'disewa' =>
                            $kendaraanDisewa,

                        'perbaikan' =>
                            $kendaraanPerbaikan,
                    ],
                ],

                'tren_pendapatan' =>
                    $trenPendapatan,

                'kendaraan_terlaris' =>
                    $kendaraanTerlaris,

                'aktivitas_admin' =>
                    $aktivitasAdmin,
            ]
        );
    }
}
