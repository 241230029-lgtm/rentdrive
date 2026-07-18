<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PerpanjanganSewa;
use App\Models\Sewa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LaporanOperasionalController extends Controller
{
    /**
     * Status transaksi yang dapat diakui sebagai pendapatan.
     */
    private const STATUS_PENDAPATAN = [
        'disetujui_operasional',
        'sedang_berlangsung',
        'menunggu_verifikasi_pengembalian',
        'selesai',
    ];

    /**
     * Status transaksi yang masih aktif secara operasional.
     */
    private const STATUS_AKTIF = [
        'disetujui_operasional',
        'sedang_berlangsung',
        'menunggu_verifikasi_pengembalian',
    ];

    /**
     * Menampilkan laporan operasional berdasarkan periode.
     *
     * Pendapatan sewa awal diakui berdasarkan tanggal mulai sewa.
     * Pendapatan perpanjangan diakui berdasarkan diterapkan_pada,
     * yaitu saat pembayaran perpanjangan disetujui admin.
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
         * Transaksi sewa awal disaring berdasarkan tanggal mulai sewa.
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

        $transaksiPendapatan = $transaksis
            ->filter(
                fn (Sewa $sewa): bool =>
                    in_array(
                        $sewa->status,
                        self::STATUS_PENDAPATAN,
                        true
                    )
            )
            ->values();

        $transaksiAktif = $transaksis
            ->filter(
                fn (Sewa $sewa): bool =>
                    in_array(
                        $sewa->status,
                        self::STATUS_AKTIF,
                        true
                    )
            )
            ->values();

        /*
         * Perpanjangan dalam periode laporan diakui berdasarkan
         * waktu tanggal baru diterapkan setelah pembayaran disetujui.
         */
        $perpanjangansPeriode = PerpanjanganSewa::query()
            ->with([
                'sewa.user:id,name,email',
                'sewa.kendaraan:id,nama_kendaraan,merek,plat_nomor,harga_per_hari',
            ])
            ->where(
                'status',
                PerpanjanganSewa::STATUS_SELESAI
            )
            ->whereNotNull(
                'diterapkan_pada'
            )
            ->whereBetween(
                'diterapkan_pada',
                [
                    $tanggalMulai,
                    $tanggalSelesai,
                ]
            )
            ->orderByDesc(
                'diterapkan_pada'
            )
            ->orderByDesc('id')
            ->get();

        /*
         * Total seluruh perpanjangan selesai untuk transaksi yang
         * masuk periode tanggal mulai sewa.
         *
         * Nilai ini dipakai untuk mengembalikan total_harga menjadi
         * nilai sewa awal agar biaya perpanjangan tidak dihitung dua kali.
         */
        $biayaPerpanjanganSelesaiPerSewa =
            $this->ambilBiayaPerpanjanganSelesaiPerSewa(
                $transaksiPendapatan
                    ->pluck('id')
                    ->map(
                        fn ($id): int =>
                            (int) $id
                    )
                    ->values()
            );

        /*
         * Perpanjangan yang diterapkan pada periode laporan,
         * dikelompokkan berdasarkan transaksi.
         */
        $biayaPerpanjanganPeriodePerSewa =
            $perpanjangansPeriode
                ->groupBy('sewa_id')
                ->map(
                    fn (Collection $items): int =>
                        (int) $items->sum(
                            'biaya_tambahan'
                        )
                );

        $jumlahPerpanjanganPeriodePerSewa =
            $perpanjangansPeriode
                ->groupBy('sewa_id')
                ->map(
                    fn (Collection $items): int =>
                        $items->count()
                );

        $hitungPendapatanSewaAwal =
            function (
                Sewa $sewa
            ) use (
                $biayaPerpanjanganSelesaiPerSewa
            ): int {
                $totalHargaSaatIni =
                    max(
                        0,
                        (int) (
                            $sewa->total_harga
                            ?? 0
                        )
                    );

                $totalPerpanjanganSelesai =
                    max(
                        0,
                        (int) $biayaPerpanjanganSelesaiPerSewa
                            ->get(
                                $sewa->id,
                                0
                            )
                    );

                return max(
                    0,
                    $totalHargaSaatIni
                    - $totalPerpanjanganSelesai
                );
            };

        $pendapatanSewaAwal =
            (int) $transaksiPendapatan
                ->sum(
                    fn (Sewa $sewa): int =>
                        $hitungPendapatanSewaAwal(
                            $sewa
                        )
                );

        $pendapatanPerpanjangan =
            (int) $perpanjangansPeriode
                ->sum(
                    'biaya_tambahan'
                );

        $totalPendapatan =
            $pendapatanSewaAwal
            + $pendapatanPerpanjangan;

        $ringkasan = [
            'total_transaksi' =>
                $transaksis->count(),

            'transaksi_selesai' =>
                $transaksis
                    ->where(
                        'status',
                        'selesai'
                    )
                    ->count(),

            'transaksi_aktif' =>
                $transaksiAktif->count(),

            'pendapatan_sewa_awal' =>
                $pendapatanSewaAwal,

            'pendapatan_perpanjangan' =>
                $pendapatanPerpanjangan,

            'total_pendapatan' =>
                $totalPendapatan,

            'jumlah_perpanjangan' =>
                $perpanjangansPeriode
                    ->count(),

            /*
             * Nilai denda dipertahankan mengikuti laporan lama.
             */
            'total_denda' =>
                (int) $transaksis
                    ->sum(
                        'total_denda'
                    ),

            'kendaraan_aktif' =>
                $transaksiAktif
                    ->pluck(
                        'kendaraan_id'
                    )
                    ->filter()
                    ->unique()
                    ->count(),
        ];

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
            ->groupBy(
                'kendaraan_id'
            )
            ->map(
                function (
                    Collection $items
                ) use (
                    $hitungPendapatanSewaAwal,
                    $biayaPerpanjanganPeriodePerSewa,
                    $jumlahPerpanjanganPeriodePerSewa
                ): array {
                    /** @var Sewa $transaksiPertama */
                    $transaksiPertama =
                        $items->first();

                    $itemsPendapatan =
                        $items->filter(
                            fn (Sewa $sewa): bool =>
                                in_array(
                                    $sewa->status,
                                    self::STATUS_PENDAPATAN,
                                    true
                                )
                        );

                    $pendapatanSewaAwalKendaraan =
                        (int) $itemsPendapatan
                            ->sum(
                                fn (Sewa $sewa): int =>
                                    $hitungPendapatanSewaAwal(
                                        $sewa
                                    )
                            );

                    $pendapatanPerpanjanganKendaraan =
                        (int) $items
                            ->sum(
                                fn (Sewa $sewa): int =>
                                    (int) $biayaPerpanjanganPeriodePerSewa
                                        ->get(
                                            $sewa->id,
                                            0
                                        )
                            );

                    $jumlahPerpanjanganKendaraan =
                        (int) $items
                            ->sum(
                                fn (Sewa $sewa): int =>
                                    (int) $jumlahPerpanjanganPeriodePerSewa
                                        ->get(
                                            $sewa->id,
                                            0
                                        )
                            );

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

                        'jumlah_perpanjangan' =>
                            $jumlahPerpanjanganKendaraan,

                        'pendapatan_sewa_awal' =>
                            $pendapatanSewaAwalKendaraan,

                        'pendapatan_perpanjangan' =>
                            $pendapatanPerpanjanganKendaraan,

                        'pendapatan' =>
                            $pendapatanSewaAwalKendaraan
                            + $pendapatanPerpanjanganKendaraan,
                    ];
                }
            )
            ->sortByDesc(
                'total_sewa'
            )
            ->take(10)
            ->values();

        /*
         * Pendapatan bulanan digabung dari dua sumber:
         * 1. sewa awal berdasarkan tanggal mulai;
         * 2. perpanjangan berdasarkan diterapkan_pada.
         */
        $pendapatanBulananMap = [];

        foreach (
            $transaksiPendapatan
            as $sewa
        ) {
            $periode = Carbon::parse(
                $sewa->tanggal_mulai
            )->format('Y-m');

            if (
                ! isset(
                    $pendapatanBulananMap[
                        $periode
                    ]
                )
            ) {
                $pendapatanBulananMap[
                    $periode
                ] = [
                    'pendapatan_sewa_awal' =>
                        0,

                    'pendapatan_perpanjangan' =>
                        0,

                    'jumlah_transaksi' =>
                        0,

                    'jumlah_perpanjangan' =>
                        0,
                ];
            }

            $pendapatanBulananMap[
                $periode
            ]['pendapatan_sewa_awal'] +=
                $hitungPendapatanSewaAwal(
                    $sewa
                );

            $pendapatanBulananMap[
                $periode
            ]['jumlah_transaksi']++;
        }

        foreach (
            $perpanjangansPeriode
            as $perpanjangan
        ) {
            $periode = Carbon::parse(
                $perpanjangan
                    ->diterapkan_pada
            )->format('Y-m');

            if (
                ! isset(
                    $pendapatanBulananMap[
                        $periode
                    ]
                )
            ) {
                $pendapatanBulananMap[
                    $periode
                ] = [
                    'pendapatan_sewa_awal' =>
                        0,

                    'pendapatan_perpanjangan' =>
                        0,

                    'jumlah_transaksi' =>
                        0,

                    'jumlah_perpanjangan' =>
                        0,
                ];
            }

            $pendapatanBulananMap[
                $periode
            ]['pendapatan_perpanjangan'] +=
                max(
                    0,
                    (int) $perpanjangan
                        ->biaya_tambahan
                );

            $pendapatanBulananMap[
                $periode
            ]['jumlah_perpanjangan']++;
        }

        $pendapatanBulanan = collect(
            $pendapatanBulananMap
        )
            ->sortKeys()
            ->map(
                function (
                    array $item,
                    string $periode
                ): array {
                    $bulan =
                        Carbon::createFromFormat(
                            'Y-m',
                            $periode
                        );

                    $pendapatanAwal =
                        (int) $item[
                            'pendapatan_sewa_awal'
                        ];

                    $pendapatanPerpanjangan =
                        (int) $item[
                            'pendapatan_perpanjangan'
                        ];

                    return [
                        'bulan' =>
                            $bulan->format(
                                'm/Y'
                            ),

                        'label' =>
                            $bulan->format(
                                'm/Y'
                            ),

                        'pendapatan_sewa_awal' =>
                            $pendapatanAwal,

                        'pendapatan_perpanjangan' =>
                            $pendapatanPerpanjangan,

                        'total' =>
                            $pendapatanAwal
                            + $pendapatanPerpanjangan,

                        'pendapatan' =>
                            $pendapatanAwal
                            + $pendapatanPerpanjangan,

                        'jumlah_transaksi' =>
                            (int) $item[
                                'jumlah_transaksi'
                            ],

                        'jumlah_perpanjangan' =>
                            (int) $item[
                                'jumlah_perpanjangan'
                            ],
                    ];
                }
            )
            ->values();

        $dataTransaksi = $transaksis
            ->map(
                function (
                    Sewa $sewa
                ) use (
                    $hitungPendapatanSewaAwal,
                    $biayaPerpanjanganPeriodePerSewa,
                    $jumlahPerpanjanganPeriodePerSewa
                ): array {
                    $dapatDiakuiSebagaiPendapatan =
                        in_array(
                            $sewa->status,
                            self::STATUS_PENDAPATAN,
                            true
                        );

                    $pendapatanSewaAwal =
                        $dapatDiakuiSebagaiPendapatan
                            ? $hitungPendapatanSewaAwal(
                                $sewa
                            )
                            : 0;

                    $pendapatanPerpanjanganPeriode =
                        (int) $biayaPerpanjanganPeriodePerSewa
                            ->get(
                                $sewa->id,
                                0
                            );

                    $pendapatanPeriode =
                        $pendapatanSewaAwal
                        + $pendapatanPerpanjanganPeriode;

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

                        /*
                         * Nilai total transaksi saat ini, termasuk
                         * perpanjangan yang sudah selesai.
                         */
                        'total_harga' =>
                            (int) (
                                $sewa->total_harga
                                ?? 0
                            ),

                        'pendapatan_sewa_awal' =>
                            $pendapatanSewaAwal,

                        'pendapatan_perpanjangan_periode' =>
                            $pendapatanPerpanjanganPeriode,

                        'pendapatan_periode' =>
                            $pendapatanPeriode,

                        'jumlah_perpanjangan_periode' =>
                            (int) $jumlahPerpanjanganPeriodePerSewa
                                ->get(
                                    $sewa->id,
                                    0
                                ),

                        'denda_keterlambatan' =>
                            (int) (
                                $sewa
                                    ->denda_keterlambatan
                                ?? 0
                            ),

                        'denda_kerusakan' =>
                            (int) (
                                $sewa
                                    ->denda_kerusakan
                                ?? 0
                            ),

                        'total_denda' =>
                            (int) (
                                $sewa->total_denda
                                ?? 0
                            ),

                        'total_tagihan' =>
                            (int) (
                                $sewa->total_harga
                                ?? 0
                            )
                            + (int) (
                                $sewa->total_denda
                                ?? 0
                            ),

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
                                ]
                                : null,

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
                                        $sewa
                                            ->kendaraan
                                            ->id,

                                    'nama_kendaraan' =>
                                        $sewa
                                            ->kendaraan
                                            ->nama_kendaraan,

                                    'merek' =>
                                        $sewa
                                            ->kendaraan
                                            ->merek,

                                    'plat_nomor' =>
                                        $sewa
                                            ->kendaraan
                                            ->plat_nomor,

                                    'harga_per_hari' =>
                                        (int) (
                                            $sewa
                                                ->kendaraan
                                                ->harga_per_hari
                                            ?? 0
                                        ),
                                ]
                                : null,
                    ];
                }
            )
            ->values();

        $dataPerpanjangan =
            $perpanjangansPeriode
                ->map(
                    function (
                        PerpanjanganSewa $perpanjangan
                    ): array {
                        $sewa =
                            $perpanjangan->sewa;

                        return [
                            'id' =>
                                $perpanjangan->id,

                            'sewa_id' =>
                                $perpanjangan->sewa_id,

                            'nomor_booking' =>
                                $sewa
                                    ?->nomor_booking,

                            'tanggal_selesai_lama' =>
                                $this->formatTanggal(
                                    $perpanjangan
                                        ->tanggal_selesai_lama
                                ),

                            'tanggal_selesai_baru' =>
                                $this->formatTanggal(
                                    $perpanjangan
                                        ->tanggal_selesai_baru
                                ),

                            'jumlah_hari_tambahan' =>
                                (int) $perpanjangan
                                    ->jumlah_hari_tambahan,

                            'harga_per_hari' =>
                                (int) $perpanjangan
                                    ->harga_per_hari,

                            'biaya_tambahan' =>
                                (int) $perpanjangan
                                    ->biaya_tambahan,

                            'status' =>
                                $perpanjangan->status,

                            'dibayar_pada' =>
                                $perpanjangan
                                    ->dibayar_pada
                                    ?->toIso8601String(),

                            'diterapkan_pada' =>
                                $perpanjangan
                                    ->diterapkan_pada
                                    ?->toIso8601String(),

                            'pelanggan' =>
                                $sewa?->user
                                    ? [
                                        'id' =>
                                            $sewa
                                                ->user
                                                ->id,

                                        'name' =>
                                            $sewa
                                                ->user
                                                ->name,

                                        'email' =>
                                            $sewa
                                                ->user
                                                ->email,
                                    ]
                                    : null,

                            'kendaraan' =>
                                $sewa?->kendaraan
                                    ? [
                                        'id' =>
                                            $sewa
                                                ->kendaraan
                                                ->id,

                                        'nama_kendaraan' =>
                                            $sewa
                                                ->kendaraan
                                                ->nama_kendaraan,

                                        'merek' =>
                                            $sewa
                                                ->kendaraan
                                                ->merek,

                                        'plat_nomor' =>
                                            $sewa
                                                ->kendaraan
                                                ->plat_nomor,
                                    ]
                                    : null,
                        ];
                    }
                )
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

                'perpanjangans' =>
                    $dataPerpanjangan,

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
     * Mengambil total seluruh biaya perpanjangan selesai
     * berdasarkan sewa_id.
     */
    private function ambilBiayaPerpanjanganSelesaiPerSewa(
        Collection $sewaIds
    ): Collection {
        if ($sewaIds->isEmpty()) {
            return collect();
        }

        return PerpanjanganSewa::query()
            ->whereIn(
                'sewa_id',
                $sewaIds->all()
            )
            ->where(
                'status',
                PerpanjanganSewa::STATUS_SELESAI
            )
            ->selectRaw(
                'sewa_id, SUM(biaya_tambahan) AS total_biaya'
            )
            ->groupBy(
                'sewa_id'
            )
            ->pluck(
                'total_biaya',
                'sewa_id'
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

        return Carbon::parse(
            $tanggal
        )->toDateString();
    }
}
