<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Sewa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LaporanBisnisController extends Controller
{
    /**
     * Menampilkan laporan bisnis berdasarkan periode transaksi.
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
        |--------------------------------------------------------------------------
        | STATUS TRANSAKSI
        |--------------------------------------------------------------------------
        */

        $statusAktif = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
        ];

        $statusPendapatan = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
            'selesai',
        ];

        /*
        |--------------------------------------------------------------------------
        | AMBIL TRANSAKSI
        |--------------------------------------------------------------------------
        |
        | Laporan menggunakan tanggal mulai sewa agar transaksi yang
        | memang berlangsung pada periode tersebut dapat ditemukan.
        |
        */

        $transaksis = Sewa::query()
            ->with([
                'user:id,name,email,no_telepon',
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

        /*
        |--------------------------------------------------------------------------
        | RINGKASAN LAPORAN
        |--------------------------------------------------------------------------
        */

        $pendapatanSewa = (int) $transaksiPendapatan
            ->sum('total_harga');

        /*
         * Denda dianggap sebagai pendapatan setelah proses
         * pengembalian selesai.
         */
        $pendapatanDenda = (int) $transaksis
            ->where('status', 'selesai')
            ->sum('total_denda');

        $totalPendapatan =
            $pendapatanSewa + $pendapatanDenda;

        $jumlahTransaksiPendapatan =
            $transaksiPendapatan->count();

        $rataRataTransaksi =
            $jumlahTransaksiPendapatan > 0
                ? (int) round(
                    $totalPendapatan /
                    $jumlahTransaksiPendapatan
                )
                : 0;

        $ringkasan = [
            'total_pendapatan' =>
                $totalPendapatan,

            'pendapatan' =>
                $totalPendapatan,

            'pendapatan_sewa' =>
                $pendapatanSewa,

            'total_denda' =>
                $pendapatanDenda,

            'pendapatan_denda' =>
                $pendapatanDenda,

            'total_transaksi' =>
                $transaksis->count(),

            'transaksi' =>
                $transaksis->count(),

            'transaksi_aktif' =>
                $transaksiAktif->count(),

            'aktif' =>
                $transaksiAktif->count(),

            'transaksi_selesai' =>
                $transaksis
                    ->where(
                        'status',
                        'selesai'
                    )
                    ->count(),

            'selesai' =>
                $transaksis
                    ->where(
                        'status',
                        'selesai'
                    )
                    ->count(),

            'rata_rata_transaksi' =>
                $rataRataTransaksi,

            'rata_rata_pendapatan' =>
                $rataRataTransaksi,
        ];

        /*
        |--------------------------------------------------------------------------
        | PENDAPATAN PER BULAN
        |--------------------------------------------------------------------------
        */

        $pendapatanPerBulan = $transaksiPendapatan
            ->groupBy(
                fn (Sewa $sewa): string =>
                    Carbon::parse(
                        $sewa->tanggal_mulai
                    )->format('Y-m')
            )
            ->sortKeys()
            ->map(
                function (
                    Collection $items,
                    string $periode
                ): array {
                    $bulan = Carbon::createFromFormat(
                        'Y-m',
                        $periode
                    );

                    $pendapatanSewa = (int) $items
                        ->sum('total_harga');

                    $pendapatanDenda = (int) $items
                        ->where(
                            'status',
                            'selesai'
                        )
                        ->sum('total_denda');

                    $total =
                        $pendapatanSewa +
                        $pendapatanDenda;

                    return [
                        'bulan' =>
                            $periode,

                        'label' =>
                            $bulan->translatedFormat(
                                'F Y'
                            ),

                        'total' =>
                            $total,

                        'pendapatan' =>
                            $total,

                        'jumlah_transaksi' =>
                            $items->count(),

                        'transaksi' =>
                            $items->count(),
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | DISTRIBUSI STATUS
        |--------------------------------------------------------------------------
        */

        $transaksiPerStatus = $transaksis
            ->groupBy('status')
            ->map(
                function (
                    Collection $items,
                    string $status
                ): array {
                    return [
                        'status' =>
                            $status,

                        'total' =>
                            $items->count(),

                        'jumlah' =>
                            $items->count(),

                        'count' =>
                            $items->count(),
                    ];
                }
            )
            ->sortByDesc('total')
            ->values();

        /*
        |--------------------------------------------------------------------------
        | KENDARAAN TERLARIS
        |--------------------------------------------------------------------------
        */

        $kendaraanTerlaris = $transaksis
            ->filter(
                fn (Sewa $sewa): bool =>
                    $sewa->kendaraan !== null
            )
            ->groupBy('kendaraan_id')
            ->map(
                function (
                    Collection $items
                ): array {
                    /** @var Sewa $transaksiPertama */
                    $transaksiPertama =
                        $items->first();

                    $transaksiSah = $items
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
                        );

                    $pendapatanSewa =
                        (int) $transaksiSah
                            ->sum('total_harga');

                    $pendapatanDenda =
                        (int) $transaksiSah
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
                            $items->count(),

                        'jumlah_sewa' =>
                            $items->count(),

                        'jumlah' =>
                            $items->count(),

                        'pendapatan' =>
                            $pendapatanSewa +
                            $pendapatanDenda,

                        'total_pendapatan' =>
                            $pendapatanSewa +
                            $pendapatanDenda,
                    ];
                }
            )
            ->sortByDesc('total_sewa')
            ->take(10)
            ->values();

        /*
        |--------------------------------------------------------------------------
        | DETAIL TRANSAKSI
        |--------------------------------------------------------------------------
        */

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

                    'updated_at' =>
                        $sewa->updated_at
                            ?->toIso8601String(),

                    'user' => $sewa->user
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

                    'pelanggan' => $sewa->user
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
            'Owner/LaporanBisnis',
            [
                /*
                 * Properti utama yang dibaca halaman React.
                 */
                'ringkasan' =>
                    $ringkasan,

                'pendapatan_per_bulan' =>
                    $pendapatanPerBulan,

                'pendapatan_bulanan' =>
                    $pendapatanPerBulan,

                'transaksi_per_status' =>
                    $transaksiPerStatus,

                'kendaraan_terlaris' =>
                    $kendaraanTerlaris,

                'transaksis' =>
                    $dataTransaksi,

                'transaksi' =>
                    $dataTransaksi,

                /*
                 * Alias tambahan untuk kompatibilitas.
                 */
                'statistik' =>
                    $ringkasan,

                'status_transaksi' =>
                    $transaksiPerStatus,

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
     * Menormalkan tanggal menjadi format YYYY-MM-DD.
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
