<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\FilterLaporanBisnisRequest;
use App\Models\Kendaraan;
use App\Models\Sewa;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaporanBisnisController extends Controller
{
    /**
     * Menampilkan laporan bisnis berdasarkan periode
     * dan kategori yang dipilih owner.
     */
    public function index(
        FilterLaporanBisnisRequest $request
    ): Response {
        $dataFilter = $request->validated();

        $tanggalMulai =
            $dataFilter['tanggal_mulai'] ??
            Carbon::now()
                ->startOfMonth()
                ->toDateString();

        $tanggalSelesai =
            $dataFilter['tanggal_selesai'] ??
            Carbon::now()
                ->endOfMonth()
                ->toDateString();

        $kategori =
            $dataFilter['kategori_laporan'];

        $awalPeriode =
            $tanggalMulai . ' 00:00:00';

        $akhirPeriode =
            $tanggalSelesai . ' 23:59:59';

        $querySewa = Sewa::query()
            ->whereBetween(
                'created_at',
                [
                    $awalPeriode,
                    $akhirPeriode,
                ]
            );

        $dataLaporan = match ($kategori) {
            'pendapatan' =>
                $querySewa
                    ->where(
                        'status',
                        'selesai'
                    )
                    ->select([
                        'nomor_booking',
                        'total_harga',
                        'total_denda',
                        DB::raw(
                            '(total_harga + total_denda) as total_pemasukan'
                        ),
                        'created_at',
                    ])
                    ->get(),

            'booking' =>
                $querySewa
                    ->select([
                        'nomor_booking',
                        'jenis_booking',
                        'status',
                        'tanggal_mulai',
                        'tanggal_selesai',
                    ])
                    ->get(),

            'kendaraan' =>
                Kendaraan::query()
                    ->select([
                        'id',
                        'nama_kendaraan',
                        'plat_nomor',
                        'status',
                    ])
                    ->withCount([
                        'sewas' => function ($query) use (
                            $awalPeriode,
                            $akhirPeriode
                        ) {
                            $query->whereBetween(
                                'created_at',
                                [
                                    $awalPeriode,
                                    $akhirPeriode,
                                ]
                            );
                        },
                    ])
                    ->get(),

            'pelanggan' =>
                User::query()
                    ->where(
                        'role',
                        'pelanggan'
                    )
                    ->whereBetween(
                        'created_at',
                        [
                            $awalPeriode,
                            $akhirPeriode,
                        ]
                    )
                    ->select([
                        'name',
                        'email',
                        'no_telepon',
                        'created_at',
                    ])
                    ->get(),

            'denda' =>
                $querySewa
                    ->where(
                        'total_denda',
                        '>',
                        0
                    )
                    ->select([
                        'nomor_booking',
                        'denda_keterlambatan',
                        'denda_kerusakan',
                        'total_denda',
                        'kondisi_kendaraan_kembali',
                    ])
                    ->get(),

            'refund' =>
                $querySewa
                    ->whereIn(
                        'status',
                        [
                            'ditolak_pembayaran',
                            'dibatalkan',
                        ]
                    )
                    ->select([
                        'nomor_booking',
                        'total_harga',
                        'alasan_penolakan',
                        'status',
                        'updated_at as tanggal_batal',
                    ])
                    ->get(),
        };

        return Inertia::render(
            'Owner/LaporanBisnis',
            [
                'data_laporan' =>
                    $dataLaporan,

                'filter' => [
                    'tanggal_mulai' =>
                        $tanggalMulai,

                    'tanggal_selesai' =>
                        $tanggalSelesai,

                    'kategori' =>
                        $kategori,
                ],
            ]
        );
    }
}
