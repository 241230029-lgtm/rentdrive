<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sewa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanOperasionalController extends Controller
{
    /**
     * Menampilkan laporan operasional berdasarkan periode sewa.
     */
    public function index(Request $request): Response
    {
        $dataFilter = $request->validate([
            'tanggal_mulai' => [
                'nullable',
                'date',
            ],

            'tanggal_selesai' => [
                'nullable',
                'date',
                'after_or_equal:tanggal_mulai',
            ],
        ]);

        $tanggalMulai = isset(
            $dataFilter['tanggal_mulai']
        )
            ? Carbon::parse(
                $dataFilter['tanggal_mulai']
            )->startOfDay()
            : now()->startOfMonth();

        $tanggalSelesai = isset(
            $dataFilter['tanggal_selesai']
        )
            ? Carbon::parse(
                $dataFilter['tanggal_selesai']
            )->endOfDay()
            : now()->endOfMonth();

        /*
         * Laporan disaring berdasarkan tanggal mulai sewa,
         * bukan berdasarkan waktu data dibuat.
         */
        $transaksis = Sewa::query()
            ->with([
                'user:id,name,email',
                'kendaraan:id,nama_kendaraan,merek,plat_nomor,harga_per_hari',
            ])
            ->whereBetween(
                'tanggal_mulai',
                [
                    $tanggalMulai->toDateString(),
                    $tanggalSelesai->toDateString(),
                ]
            )
            ->orderByDesc('tanggal_mulai')
            ->orderByDesc('id')
            ->get();

        $statusAktif = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
        ];

        /*
         * Pendapatan hanya dihitung dari transaksi yang
         * sudah disetujui dan bukan transaksi menunggu,
         * ditolak, atau dibatalkan.
         */
        $statusPendapatan = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
            'selesai',
        ];

        $transaksiPendapatan = $transaksis
            ->filter(
                fn (Sewa $sewa): bool =>
                    in_array(
                        $sewa->status,
                        $statusPendapatan,
                        true
                    )
            );

        $transaksiAktif = $transaksis
            ->filter(
                fn (Sewa $sewa): bool =>
                    in_array(
                        $sewa->status,
                        $statusAktif,
                        true
                    )
            );

        $ringkasan = [
            'total_transaksi' =>
                $transaksis->count(),

            'transaksi_selesai' =>
                $transaksis
                    ->where('status', 'selesai')
                    ->count(),

            'transaksi_aktif' =>
                $transaksiAktif->count(),

            'total_pendapatan' =>
                (int) $transaksiPendapatan
                    ->sum('total_harga'),

            'total_denda' =>
                (int) $transaksis
                    ->sum('total_denda'),

            'kendaraan_aktif' =>
                $transaksiAktif
                    ->pluck('kendaraan_id')
                    ->filter()
                    ->unique()
                    ->count(),
        ];

        $transaksiPerStatus = $transaksis
            ->groupBy('status')
            ->map(
                function (
                    $items,
                    string $status
                ): array {
                    return [
                        'status' => $status,
                        'total' => $items->count(),
                    ];
                }
            )
            ->sortByDesc('total')
            ->values();

        $kendaraanTerlaris = $transaksis
            ->filter(
                fn (Sewa $sewa): bool =>
                    $sewa->kendaraan !== null
            )
            ->groupBy('kendaraan_id')
            ->map(function ($items): array {
                /** @var Sewa $transaksiPertama */
                $transaksiPertama =
                    $items->first();

                return [
                    'id' =>
                        $transaksiPertama
                            ->kendaraan
                            ->id,

                    'nama_kendaraan' =>
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
                        $items->count(),

                    'pendapatan' =>
                        (int) $items
                            ->filter(
                                fn (Sewa $sewa): bool =>
                                    in_array(
                                        $sewa->status,
                                        [
                                            'disetujui_operasional',
                                            'sedang_berlangsung',
                                            'menunggu_verifikasi_pengembalian',
                                            'selesai',
                                        ],
                                        true
                                    )
                            )
                            ->sum('total_harga'),
                ];
            })
            ->sortByDesc('total_sewa')
            ->take(10)
            ->values();

        $pendapatanBulanan = $transaksiPendapatan
            ->groupBy(
                fn (Sewa $sewa): string =>
                    Carbon::parse(
                        $sewa->tanggal_mulai
                    )->format('Y-m')
            )
            ->sortKeys()
            ->map(
                function (
                    $items,
                    string $periode
                ): array {
                    $bulan = Carbon::createFromFormat(
                        'Y-m',
                        $periode
                    );

                    return [
                        'bulan' =>
                            $bulan->format('m/Y'),

                        'label' =>
                            $bulan->format('m/Y'),

                        'total' =>
                            (int) $items
                                ->sum('total_harga'),

                        'pendapatan' =>
                            (int) $items
                                ->sum('total_harga'),

                        'jumlah_transaksi' =>
                            $items->count(),
                    ];
                }
            )
            ->values();

        $dataTransaksi = $transaksis
            ->map(function (Sewa $sewa): array {
                return [
                    'id' =>
                        $sewa->id,

                    'nomor_booking' =>
                        $sewa->nomor_booking,

                    'jenis_booking' =>
                        $sewa->jenis_booking,

                    'tanggal_mulai' =>
                        $this->formatTanggal(
                            $sewa->tanggal_mulai
                        ),

                    'tanggal_selesai' =>
                        $this->formatTanggal(
                            $sewa->tanggal_selesai
                        ),

                    'tanggal_kembali_aktual' =>
                        $this->formatTanggal(
                            $sewa
                                ->tanggal_kembali_aktual
                        ),

                    'total_harga' =>
                        (int) (
                            $sewa->total_harga ?? 0
                        ),

                    'denda_keterlambatan' =>
                        (int) (
                            $sewa
                                ->denda_keterlambatan
                            ?? 0
                        ),

                    'denda_kerusakan' =>
                        (int) (
                            $sewa->denda_kerusakan
                            ?? 0
                        ),

                    'total_denda' =>
                        (int) (
                            $sewa->total_denda ?? 0
                        ),

                    'total_tagihan' =>
                        (int) (
                            $sewa->total_harga ?? 0
                        )
                        + (int) (
                            $sewa->total_denda ?? 0
                        ),

                    'status' =>
                        $sewa->status,

                    'created_at' =>
                        $sewa->created_at
                            ?->toIso8601String(),

                    'user' => $sewa->user
                        ? [
                            'id' =>
                                $sewa->user->id,

                            'name' =>
                                $sewa->user->name,

                            'email' =>
                                $sewa->user->email,
                        ]
                        : null,

                    /*
                     * Alias pelanggan disediakan agar tetap
                     * cocok dengan berbagai komponen frontend.
                     */
                    'pelanggan' => $sewa->user
                        ? [
                            'id' =>
                                $sewa->user->id,

                            'name' =>
                                $sewa->user->name,

                            'email' =>
                                $sewa->user->email,
                        ]
                        : null,

                    'kendaraan' => $sewa->kendaraan
                        ? [
                            'id' =>
                                $sewa->kendaraan->id,

                            'nama_kendaraan' =>
                                $sewa->kendaraan
                                    ->nama_kendaraan,

                            'merek' =>
                                $sewa->kendaraan
                                    ->merek,

                            'plat_nomor' =>
                                $sewa->kendaraan
                                    ->plat_nomor,

                            'harga_per_hari' =>
                                (int) (
                                    $sewa->kendaraan
                                        ->harga_per_hari
                                    ?? 0
                                ),
                        ]
                        : null,
                ];
            })
            ->values();

        return Inertia::render(
            'Admin/LaporanOperasional',
            [
                'ringkasan' =>
                    $ringkasan,

                'transaksi_per_status' =>
                    $transaksiPerStatus,

                'kendaraan_terlaris' =>
                    $kendaraanTerlaris,

                'pendapatan_bulanan' =>
                    $pendapatanBulanan,

                'transaksis' =>
                    $dataTransaksi,

                'filter' => [
                    'tanggal_mulai' =>
                        $tanggalMulai
                            ->toDateString(),

                    'tanggal_selesai' =>
                        $tanggalSelesai
                            ->toDateString(),
                ],
            ]
        );
    }

    /**
     * Menormalkan tanggal menjadi YYYY-MM-DD.
     */
    private function formatTanggal(
        mixed $tanggal
    ): ?string {
        if (blank($tanggal)) {
            return null;
        }

        return Carbon::parse($tanggal)
            ->toDateString();
    }
}
