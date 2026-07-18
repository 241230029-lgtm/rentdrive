<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\PerpanjanganSewa;
use App\Models\Sewa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LaporanBisnisController extends Controller
{
    private const STATUS_PENDAPATAN = [
        'disetujui_operasional',
        'sedang_berlangsung',
        'menunggu_verifikasi_pengembalian',
        'selesai',
    ];

    private const STATUS_AKTIF = [
        'disetujui_operasional',
        'sedang_berlangsung',
        'menunggu_verifikasi_pengembalian',
    ];

    /**
     * Menampilkan laporan bisnis owner.
     *
     * Pendapatan sewa awal mengikuti tanggal mulai transaksi.
     * Pendapatan perpanjangan mengikuti diterapkan_pada.
     * Pendapatan denda mengikuti transaksi selesai.
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
        | TRANSAKSI SEWA DALAM PERIODE
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | PERPANJANGAN SELESAI DALAM PERIODE
        |--------------------------------------------------------------------------
        */

        $perpanjangansPeriode = PerpanjanganSewa::query()
            ->with([
                'sewa.user:id,name,email,no_telepon',
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
         * Mengambil seluruh perpanjangan selesai milik transaksi
         * yang terdapat dalam periode sewa.
         *
         * Nilainya dikurangi dari total_harga agar diketahui
         * pendapatan sewa awal sebelum perpanjangan.
         */
        $totalPerpanjanganSelesaiPerSewa =
            $this->ambilTotalPerpanjanganSelesaiPerSewa(
                $transaksiPendapatan
                    ->pluck('id')
                    ->map(
                        fn ($id): int =>
                            (int) $id
                    )
                    ->values()
            );

        $perpanjanganPeriodePerSewa =
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

        $hitungSewaAwal =
            function (
                Sewa $sewa
            ) use (
                $totalPerpanjanganSelesaiPerSewa
            ): int {
                $totalHargaSekarang =
                    max(
                        0,
                        (int) (
                            $sewa->total_harga
                            ?? 0
                        )
                    );

                $totalPerpanjangan =
                    max(
                        0,
                        (int) $totalPerpanjanganSelesaiPerSewa
                            ->get(
                                $sewa->id,
                                0
                            )
                    );

                return max(
                    0,
                    $totalHargaSekarang
                    - $totalPerpanjangan
                );
            };

        /*
        |--------------------------------------------------------------------------
        | RINGKASAN PENDAPATAN
        |--------------------------------------------------------------------------
        */

        $pendapatanSewaAwal =
            (int) $transaksiPendapatan
                ->sum(
                    fn (Sewa $sewa): int =>
                        $hitungSewaAwal(
                            $sewa
                        )
                );

        $pendapatanPerpanjangan =
            (int) $perpanjangansPeriode
                ->sum(
                    'biaya_tambahan'
                );

        $pendapatanDenda =
            (int) $transaksis
                ->where(
                    'status',
                    'selesai'
                )
                ->sum(
                    'total_denda'
                );

        $totalPendapatan =
            $pendapatanSewaAwal
            + $pendapatanPerpanjangan
            + $pendapatanDenda;

        /*
         * Rata-rata menggunakan jumlah transaksi unik yang
         * menghasilkan pendapatan dalam periode.
         */
        $jumlahTransaksiPendapatan =
            $transaksiPendapatan
                ->pluck('id')
                ->merge(
                    $perpanjangansPeriode
                        ->pluck('sewa_id')
                )
                ->map(
                    fn ($id): int =>
                        (int) $id
                )
                ->unique()
                ->count();

        $rataRataTransaksi =
            $jumlahTransaksiPendapatan > 0
                ? (int) round(
                    $totalPendapatan
                    / $jumlahTransaksiPendapatan
                )
                : 0;

        $ringkasan = [
            'pendapatan_sewa_awal' =>
                $pendapatanSewaAwal,

            'pendapatan_sewa' =>
                $pendapatanSewaAwal,

            'pendapatan_perpanjangan' =>
                $pendapatanPerpanjangan,

            'jumlah_perpanjangan' =>
                $perpanjangansPeriode
                    ->count(),

            'pendapatan_denda' =>
                $pendapatanDenda,

            'total_denda' =>
                $pendapatanDenda,

            'total_pendapatan' =>
                $totalPendapatan,

            'pendapatan' =>
                $totalPendapatan,

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
        | TREN PENDAPATAN BULANAN
        |--------------------------------------------------------------------------
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
                ] = $this->strukturPendapatanBulanan();
            }

            $pendapatanBulananMap[
                $periode
            ]['pendapatan_sewa_awal'] +=
                $hitungSewaAwal(
                    $sewa
                );

            if (
                $sewa->status ===
                'selesai'
            ) {
                $pendapatanBulananMap[
                    $periode
                ]['pendapatan_denda'] +=
                    max(
                        0,
                        (int) (
                            $sewa->total_denda
                            ?? 0
                        )
                    );
            }

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
                ] = $this->strukturPendapatanBulanan();
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

        $pendapatanPerBulan =
            collect(
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

                        $pendapatanSewaAwal =
                            (int) $item[
                                'pendapatan_sewa_awal'
                            ];

                        $pendapatanPerpanjangan =
                            (int) $item[
                                'pendapatan_perpanjangan'
                            ];

                        $pendapatanDenda =
                            (int) $item[
                                'pendapatan_denda'
                            ];

                        $total =
                            $pendapatanSewaAwal
                            + $pendapatanPerpanjangan
                            + $pendapatanDenda;

                        return [
                            'bulan' =>
                                $periode,

                            'label' =>
                                $bulan
                                    ->translatedFormat(
                                        'F Y'
                                    ),

                            'pendapatan_sewa_awal' =>
                                $pendapatanSewaAwal,

                            'pendapatan_perpanjangan' =>
                                $pendapatanPerpanjangan,

                            'pendapatan_denda' =>
                                $pendapatanDenda,

                            'total' =>
                                $total,

                            'total_pendapatan' =>
                                $total,

                            'pendapatan' =>
                                $total,

                            'jumlah_transaksi' =>
                                (int) $item[
                                    'jumlah_transaksi'
                                ],

                            'transaksi' =>
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

        /*
        |--------------------------------------------------------------------------
        | DISTRIBUSI STATUS
        |--------------------------------------------------------------------------
        */

        $transaksiPerStatus =
            $transaksis
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
                ->sortByDesc(
                    'total'
                )
                ->values();

        /*
        |--------------------------------------------------------------------------
        | KENDARAAN TERLARIS
        |--------------------------------------------------------------------------
        */

        $kendaraanMap = collect();

        foreach (
            $transaksis
            as $sewa
        ) {
            if (! $sewa->kendaraan) {
                continue;
            }

            $kendaraanId =
                (int) $sewa
                    ->kendaraan
                    ->id;

            if (
                ! $kendaraanMap
                    ->has(
                        $kendaraanId
                    )
            ) {
                $kendaraanMap->put(
                    $kendaraanId,
                    $this->strukturKendaraan(
                        $sewa->kendaraan
                    )
                );
            }

            $item =
                $kendaraanMap->get(
                    $kendaraanId
                );

            $item['total_sewa']++;
            $item['jumlah_sewa']++;
            $item['jumlah']++;

            if (
                in_array(
                    $sewa->status,
                    self::STATUS_PENDAPATAN,
                    true
                )
            ) {
                $item[
                    'pendapatan_sewa_awal'
                ] += $hitungSewaAwal(
                    $sewa
                );
            }

            if (
                $sewa->status ===
                'selesai'
            ) {
                $item[
                    'pendapatan_denda'
                ] += max(
                    0,
                    (int) (
                        $sewa->total_denda
                        ?? 0
                    )
                );
            }

            $kendaraanMap->put(
                $kendaraanId,
                $item
            );
        }

        /*
         * Perpanjangan tetap masuk peringkat kendaraan meskipun
         * tanggal mulai sewa awal berada di luar periode laporan.
         */
        foreach (
            $perpanjangansPeriode
            as $perpanjangan
        ) {
            $kendaraan =
                $perpanjangan
                    ->sewa
                    ?->kendaraan;

            if (! $kendaraan) {
                continue;
            }

            $kendaraanId =
                (int) $kendaraan->id;

            if (
                ! $kendaraanMap
                    ->has(
                        $kendaraanId
                    )
            ) {
                $kendaraanMap->put(
                    $kendaraanId,
                    $this->strukturKendaraan(
                        $kendaraan
                    )
                );
            }

            $item =
                $kendaraanMap->get(
                    $kendaraanId
                );

            $item[
                'jumlah_perpanjangan'
            ]++;

            $item[
                'pendapatan_perpanjangan'
            ] += max(
                0,
                (int) $perpanjangan
                    ->biaya_tambahan
            );

            $kendaraanMap->put(
                $kendaraanId,
                $item
            );
        }

        $kendaraanTerlaris =
            $kendaraanMap
                ->map(
                    function (
                        array $item
                    ): array {
                        $item['pendapatan'] =
                            (int) $item[
                                'pendapatan_sewa_awal'
                            ]
                            + (int) $item[
                                'pendapatan_perpanjangan'
                            ]
                            + (int) $item[
                                'pendapatan_denda'
                            ];

                        $item[
                            'total_pendapatan'
                        ] = $item[
                            'pendapatan'
                        ];

                        return $item;
                    }
                )
                ->sort(
                    function (
                        array $a,
                        array $b
                    ): int {
                        $perbandinganSewa =
                            $b['total_sewa']
                            <=> $a['total_sewa'];

                        if (
                            $perbandinganSewa !==
                            0
                        ) {
                            return $perbandinganSewa;
                        }

                        return $b[
                            'pendapatan'
                        ]
                            <=> $a[
                                'pendapatan'
                            ];
                    }
                )
                ->take(10)
                ->values();

        /*
        |--------------------------------------------------------------------------
        | DETAIL TRANSAKSI
        |--------------------------------------------------------------------------
        */

        $dataTransaksi =
            $transaksis
                ->map(
                    function (
                        Sewa $sewa
                    ) use (
                        $hitungSewaAwal,
                        $perpanjanganPeriodePerSewa,
                        $jumlahPerpanjanganPeriodePerSewa
                    ): array {
                        $statusPendapatan =
                            in_array(
                                $sewa->status,
                                self::STATUS_PENDAPATAN,
                                true
                            );

                        $pendapatanSewaAwal =
                            $statusPendapatan
                                ? $hitungSewaAwal(
                                    $sewa
                                )
                                : 0;

                        $pendapatanPerpanjangan =
                            (int) $perpanjanganPeriodePerSewa
                                ->get(
                                    $sewa->id,
                                    0
                                );

                        $pendapatanDenda =
                            $sewa->status ===
                            'selesai'
                                ? max(
                                    0,
                                    (int) (
                                        $sewa
                                            ->total_denda
                                        ?? 0
                                    )
                                )
                                : 0;

                        $pendapatanPeriode =
                            $pendapatanSewaAwal
                            + $pendapatanPerpanjangan
                            + $pendapatanDenda;

                        return [
                            'id' =>
                                $sewa->id,

                            'nomor_booking' =>
                                $sewa
                                    ->nomor_booking,

                            'jenis_booking' =>
                                $sewa
                                    ->jenis_booking,

                            'tanggal_mulai' =>
                                $this->formatTanggal(
                                    $sewa
                                        ->tanggal_mulai
                                ),

                            'tanggal_selesai' =>
                                $this->formatTanggal(
                                    $sewa
                                        ->tanggal_selesai
                                ),

                            'tanggal_kembali_aktual' =>
                                $this->formatTanggal(
                                    $sewa
                                        ->tanggal_kembali_aktual
                                ),

                            /*
                             * Total nilai transaksi saat ini,
                             * termasuk perpanjangan yang selesai.
                             */
                            'total_harga' =>
                                (int) (
                                    $sewa
                                        ->total_harga
                                    ?? 0
                                ),

                            'pendapatan_sewa_awal' =>
                                $pendapatanSewaAwal,

                            'pendapatan_perpanjangan' =>
                                $pendapatanPerpanjangan,

                            'jumlah_perpanjangan' =>
                                (int) $jumlahPerpanjanganPeriodePerSewa
                                    ->get(
                                        $sewa->id,
                                        0
                                    ),

                            'pendapatan_denda' =>
                                $pendapatanDenda,

                            'pendapatan_periode' =>
                                $pendapatanPeriode,

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
                                    $sewa
                                        ->total_denda
                                    ?? 0
                                ),

                            'total_tagihan' =>
                                (int) (
                                    $sewa
                                        ->total_harga
                                    ?? 0
                                )
                                + (int) (
                                    $sewa
                                        ->total_denda
                                    ?? 0
                                ),

                            'status' =>
                                $sewa->status,

                            'created_at' =>
                                $sewa->created_at
                                    ?->toIso8601String(),

                            'updated_at' =>
                                $sewa->updated_at
                                    ?->toIso8601String(),

                            'user' =>
                                $sewa->user
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

                                        'no_telepon' =>
                                            $sewa
                                                ->user
                                                ->no_telepon,
                                    ]
                                    : null,

                            'pelanggan' =>
                                $sewa->user
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

                                        'no_telepon' =>
                                            $sewa
                                                ->user
                                                ->no_telepon,
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

        /*
        |--------------------------------------------------------------------------
        | DETAIL PERPANJANGAN
        |--------------------------------------------------------------------------
        */

        $dataPerpanjangan =
            $perpanjangansPeriode
                ->map(
                    function (
                        PerpanjanganSewa $perpanjangan
                    ): array {
                        $sewa =
                            $perpanjangan
                                ->sewa;

                        return [
                            'id' =>
                                $perpanjangan->id,

                            'sewa_id' =>
                                $perpanjangan
                                    ->sewa_id,

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
                                $perpanjangan
                                    ->status,

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

                                        'no_telepon' =>
                                            $sewa
                                                ->user
                                                ->no_telepon,
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
            'Owner/LaporanBisnis',
            [
                'ringkasan' =>
                    $ringkasan,

                'statistik' =>
                    $ringkasan,

                'pendapatan_per_bulan' =>
                    $pendapatanPerBulan,

                'pendapatan_bulanan' =>
                    $pendapatanPerBulan,

                'transaksi_per_status' =>
                    $transaksiPerStatus,

                'status_transaksi' =>
                    $transaksiPerStatus,

                'kendaraan_terlaris' =>
                    $kendaraanTerlaris,

                'transaksis' =>
                    $dataTransaksi,

                'transaksi' =>
                    $dataTransaksi,

                'perpanjangans' =>
                    $dataPerpanjangan,

                'perpanjangan' =>
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

    private function ambilTotalPerpanjanganSelesaiPerSewa(
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

    private function strukturPendapatanBulanan(): array
    {
        return [
            'pendapatan_sewa_awal' =>
                0,

            'pendapatan_perpanjangan' =>
                0,

            'pendapatan_denda' =>
                0,

            'jumlah_transaksi' =>
                0,

            'jumlah_perpanjangan' =>
                0,
        ];
    }

    private function strukturKendaraan(
        mixed $kendaraan
    ): array {
        return [
            'id' =>
                (int) $kendaraan->id,

            'nama_kendaraan' =>
                $kendaraan
                    ->nama_kendaraan,

            'nama' =>
                $kendaraan
                    ->nama_kendaraan,

            'merek' =>
                $kendaraan->merek,

            'plat_nomor' =>
                $kendaraan
                    ->plat_nomor,

            'total_sewa' =>
                0,

            'jumlah_sewa' =>
                0,

            'jumlah' =>
                0,

            'jumlah_perpanjangan' =>
                0,

            'pendapatan_sewa_awal' =>
                0,

            'pendapatan_perpanjangan' =>
                0,

            'pendapatan_denda' =>
                0,

            'pendapatan' =>
                0,

            'total_pendapatan' =>
                0,
        ];
    }

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
