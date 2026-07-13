<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard owner sebagai pusat
     * monitoring kondisi bisnis secara keseluruhan.
     */
    public function index(): Response
    {
        $totalPendapatan =
            Sewa::query()
                ->where('status', 'selesai')
                ->sum('total_harga') +
            Sewa::query()
                ->where('status', 'selesai')
                ->sum('total_denda');

        $totalTransaksi = Sewa::query()
            ->count();

        $totalPelanggan = User::query()
            ->where('role', 'pelanggan')
            ->count();

        $totalKendaraan = Kendaraan::query()
            ->count();

        $kendaraanTersedia = Kendaraan::query()
            ->where('status', 'tersedia')
            ->count();

        $kendaraanDisewa = Sewa::query()
            ->where('status', 'sedang_berlangsung')
            ->count();

        $kendaraanPerbaikan = Kendaraan::query()
            ->where('status', 'perbaikan')
            ->count();

        /*
         * Grafik tren pendapatan enam bulan terakhir.
         */
        $trenPendapatan = Sewa::query()
            ->select([
                DB::raw(
                    "DATE_FORMAT(created_at, '%Y-%m') as bulan"
                ),
                DB::raw(
                    'SUM(total_harga + total_denda) as total'
                ),
            ])
            ->where('status', 'selesai')
            ->where(
                'created_at',
                '>=',
                Carbon::now()->subMonths(6)
            )
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get();

        /*
         * Lima kendaraan yang paling sering disewa.
         */
        $kendaraanTerlaris = Sewa::query()
            ->select([
                'kendaraan_id',
                DB::raw(
                    'COUNT(id) as total_disewa'
                ),
            ])
            ->with([
                'kendaraan:id,nama_kendaraan,merek,plat_nomor',
            ])
            ->groupBy('kendaraan_id')
            ->orderByDesc('total_disewa')
            ->limit(5)
            ->get();

        /*
         * Lima aktivitas admin terbaru.
         */
        $ringkasanAktivitasAdmin = LogAktivitas::query()
            ->with([
                'user:id,name',
            ])
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render(
            'Owner/Dashboard',
            [
                'statistik' => [
                    'total_pendapatan' =>
                        $totalPendapatan,

                    'total_transaksi' =>
                        $totalTransaksi,

                    'total_pelanggan' =>
                        $totalPelanggan,

                    'total_kendaraan' =>
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
                    $ringkasanAktivitasAdmin,
            ]
        );
    }
}
