<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Models\PerpanjanganSewa;
use App\Models\Sewa;
use App\Services\SinkronisasiStatusSewaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RiwayatSewaController extends Controller
{
    public function __construct(
        private readonly SinkronisasiStatusSewaService $statusService
    ) {
    }

    /**
     * Menampilkan seluruh transaksi pelanggan.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        /*
         * Sebelum data ditampilkan, status transaksi
         * disinkronkan berdasarkan tanggal mulai.
         */
        $this->statusService
            ->sinkronkanPelanggan(
                $user->id
            );

        /*
         * Denda pada transaksi mana pun tetap memblokir
         * booking dan pengajuan perpanjangan akun.
         */
        $memilikiDendaBelumLunas =
            Sewa::query()
                ->where(
                    'user_id',
                    $user->id
                )
                ->where(
                    'total_denda',
                    '>',
                    0
                )
                ->whereIn(
                    'status_pembayaran_denda',
                    [
                        Sewa::DENDA_BELUM_DIBAYAR,
                        Sewa::DENDA_MENUNGGU_VERIFIKASI,
                        Sewa::DENDA_DITOLAK,
                    ]
                )
                ->exists();

        $daftarSewa = Sewa::query()
            ->with([
                'kendaraan:id,nama_kendaraan,merek,foto_kendaraan,harga_per_hari',
            ])
            ->where(
                'user_id',
                $user->id
            )
            ->orderByDesc('id')
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
                'bukti_pembayaran',

                /*
                 * Data pengembalian.
                 */
                'tanggal_kembali_aktual',
                'kondisi_kendaraan_kembali',
                'foto_kondisi_kembali',
                'kilometer_kembali',
                'denda_keterlambatan',
                'denda_kerusakan',
                'total_denda',

                /*
                 * Pembayaran denda.
                 */
                'status_pembayaran_denda',
                'metode_pembayaran_denda',
                'bukti_pembayaran_denda',
                'alasan_penolakan_pembayaran_denda',
                'denda_dibayar_pada',
                'denda_diperiksa_pada',
                'denda_diperiksa_oleh',

                /*
                 * Penolakan transaksi utama.
                 */
                'alasan_penolakan',
                'jenis_penolakan',
                'kategori_penolakan',

                'status',
                'created_at',
                'updated_at',
            ]);

        $daftarSewaId =
            $daftarSewa
                ->pluck('id');

        /*
         * Mengambil seluruh pengajuan perpanjangan
         * lalu menentukan pengajuan terakhir setiap transaksi.
         */
        $perpanjanganTerakhir =
            PerpanjanganSewa::query()
                ->whereIn(
                    'sewa_id',
                    $daftarSewaId
                )
                ->orderByDesc('id')
                ->get()
                ->groupBy('sewa_id')
                ->map(
                    fn ($items) =>
                        $items->first()
                );

        /*
         * Menentukan transaksi yang masih mempunyai
         * permintaan perpanjangan menunggu persetujuan.
         */
        $sewaDenganPerpanjanganAktif =
            PerpanjanganSewa::query()
                ->whereIn(
                    'sewa_id',
                    $daftarSewaId
                )
                ->where(
                    'status',
                    PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN
                )
                ->pluck('sewa_id')
                ->flip();

        $hariIni =
            now()->startOfDay();

        $riwayatSewa =
            $daftarSewa
                ->map(
                    function (
                        Sewa $sewa
                    ) use (
                        $perpanjanganTerakhir,
                        $sewaDenganPerpanjanganAktif,
                        $memilikiDendaBelumLunas,
                        $hariIni
                    ): array {
                        $totalDenda =
                            max(
                                0,
                                (int) (
                                    $sewa->total_denda
                                    ?? 0
                                )
                            );

                        $statusPembayaranDenda =
                            $this
                                ->normalisasiStatusPembayaranDenda(
                                    $sewa,
                                    $totalDenda
                                );

                        $tanggalSelesai =
                            $sewa->tanggal_selesai
                                ? Carbon::parse(
                                    $sewa->tanggal_selesai
                                )->startOfDay()
                                : null;

                        $tanggalKembali =
                            $sewa->tanggal_kembali_aktual
                                ? Carbon::parse(
                                    $sewa->tanggal_kembali_aktual
                                )->startOfDay()
                                : null;

                        $hariTerlambat =
                            0;

                        if (
                            $tanggalSelesai
                            && $tanggalKembali
                            && $tanggalKembali
                                ->greaterThan(
                                    $tanggalSelesai
                                )
                        ) {
                            $hariTerlambat =
                                (int) $tanggalSelesai
                                    ->diffInDays(
                                        $tanggalKembali
                                    );
                        }

                        $memilikiDataPengembalian =
                            filled(
                                $sewa->tanggal_kembali_aktual
                            )
                            || filled(
                                $sewa->kondisi_kendaraan_kembali
                            )
                            || filled(
                                $sewa->foto_kondisi_kembali
                            )
                            || $totalDenda > 0
                            || $sewa->status ===
                                'selesai';

                        $pengajuanTerakhir =
                            $perpanjanganTerakhir
                                ->get(
                                    $sewa->id
                                );

                        $memilikiPerpanjanganAktif =
                            $sewaDenganPerpanjanganAktif
                                ->has(
                                    $sewa->id
                                );

                        $statusDapatDiperpanjang =
                            in_array(
                                $sewa->status,
                                [
                                    'disetujui_operasional',
                                    'sedang_berlangsung',
                                ],
                                true
                            );

                        $masaRentalBelumBerakhir =
                            $tanggalSelesai
                            && $hariIni
                                ->lessThanOrEqualTo(
                                    $tanggalSelesai
                                );

                        $bolehMengajukanPerpanjangan =
                            $statusDapatDiperpanjang
                            && $masaRentalBelumBerakhir
                            && ! $memilikiDendaBelumLunas
                            && ! $memilikiPerpanjanganAktif;

                        $alasanPerpanjanganTidakTersedia =
                            $this
                                ->tentukanAlasanPerpanjanganTidakTersedia(
                                    statusDapatDiperpanjang:
                                        $statusDapatDiperpanjang,

                                    masaRentalBelumBerakhir:
                                        $masaRentalBelumBerakhir,

                                    memilikiDendaBelumLunas:
                                        $memilikiDendaBelumLunas,

                                    memilikiPerpanjanganAktif:
                                        $memilikiPerpanjanganAktif
                                );

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

                            'total_harga' =>
                                (int) (
                                    $sewa->total_harga
                                    ?? 0
                                ),

                            'metode_pembayaran' =>
                                $sewa->metode_pembayaran,

                            'status' =>
                                $sewa->status,

                            'alasan_penolakan' =>
                                $sewa->alasan_penolakan,

                            'jenis_penolakan' =>
                                $sewa->jenis_penolakan,

                            'kategori_penolakan' =>
                                $sewa->kategori_penolakan,

                            'created_at' =>
                                $sewa->created_at
                                    ?->toIso8601String(),

                            'updated_at' =>
                                $sewa->updated_at
                                    ?->toIso8601String(),

                            /*
                             * Kendaraan tanpa stok, unit,
                             * dan plat nomor.
                             */
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

                                        'foto_kendaraan' =>
                                            $sewa
                                                ->kendaraan
                                                ->foto_kendaraan,

                                        'harga_per_hari' =>
                                            (int) (
                                                $sewa
                                                    ->kendaraan
                                                    ->harga_per_hari
                                                ?? 0
                                            ),
                                    ]
                                    : null,

                            /*
                             * Informasi perpanjangan.
                             */
                            'boleh_mengajukan_perpanjangan' =>
                                $bolehMengajukanPerpanjangan,

                            'alasan_perpanjangan_tidak_tersedia' =>
                                $alasanPerpanjanganTidakTersedia,

                            'memiliki_perpanjangan_aktif' =>
                                $memilikiPerpanjanganAktif,

                            'perpanjangan' =>
                                $pengajuanTerakhir
                                    ? [
                                        'id' =>
                                            $pengajuanTerakhir
                                                ->id,

                                        'tanggal_selesai_lama' =>
                                            $pengajuanTerakhir
                                                ->tanggal_selesai_lama
                                                ?->format(
                                                    'Y-m-d'
                                                ),

                                        'tanggal_selesai_baru' =>
                                            $pengajuanTerakhir
                                                ->tanggal_selesai_baru
                                                ?->format(
                                                    'Y-m-d'
                                                ),

                                        'jumlah_hari_tambahan' =>
                                            (int) $pengajuanTerakhir
                                                ->jumlah_hari_tambahan,

                                        'harga_per_hari' =>
                                            (int) $pengajuanTerakhir
                                                ->harga_per_hari,

                                        'biaya_tambahan' =>
                                            (int) $pengajuanTerakhir
                                                ->biaya_tambahan,

                                        'alasan_pengajuan' =>
                                            $pengajuanTerakhir
                                                ->alasan_pengajuan,

                                        'status' =>
                                            $pengajuanTerakhir
                                                ->status,

                                        'alasan_penolakan' =>
                                            $pengajuanTerakhir
                                                ->alasan_penolakan,

                                        'diajukan_pada' =>
                                            $pengajuanTerakhir
                                                ->diajukan_pada
                                                ?->toIso8601String(),

                                        'diproses_pada' =>
                                            $pengajuanTerakhir
                                                ->diproses_pada
                                                ?->toIso8601String(),
                                    ]
                                    : null,

                            /*
                             * Detail pengembalian.
                             */
                            'pengembalian' =>
                                $memilikiDataPengembalian
                                    ? [
                                        'tanggal_seharusnya' =>
                                            $this->formatTanggal(
                                                $sewa
                                                    ->tanggal_selesai
                                            ),

                                        'tanggal_kembali_aktual' =>
                                            $this->formatTanggal(
                                                $sewa
                                                    ->tanggal_kembali_aktual
                                            ),

                                        'hari_terlambat' =>
                                            $hariTerlambat,

                                        'kondisi_kendaraan' =>
                                            $sewa
                                                ->kondisi_kendaraan_kembali,

                                        'foto_kondisi' =>
                                            $sewa
                                                ->foto_kondisi_kembali,

                                        'kilometer_kembali' =>
                                            $sewa
                                                ->kilometer_kembali,

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
                                            $totalDenda,
                                    ]
                                    : null,

                            /*
                             * Informasi pembayaran denda.
                             */
                            'pembayaran_denda' => [
                                'status' =>
                                    $statusPembayaranDenda,

                                'metode' =>
                                    $sewa
                                        ->metode_pembayaran_denda,

                                'memiliki_bukti' =>
                                    filled(
                                        $sewa
                                            ->bukti_pembayaran_denda
                                    ),

                                'alasan_penolakan' =>
                                    $sewa
                                        ->alasan_penolakan_pembayaran_denda,

                                'dibayar_pada' =>
                                    $sewa
                                        ->denda_dibayar_pada
                                        ?->toIso8601String(),

                                'diperiksa_pada' =>
                                    $sewa
                                        ->denda_diperiksa_pada
                                        ?->toIso8601String(),

                                'boleh_membayar' =>
                                    $totalDenda > 0
                                    && in_array(
                                        $statusPembayaranDenda,
                                        [
                                            Sewa::DENDA_BELUM_DIBAYAR,
                                            Sewa::DENDA_DITOLAK,
                                        ],
                                        true
                                    ),
                            ],

                            'total_denda' =>
                                $totalDenda,

                            'status_pembayaran_denda' =>
                                $statusPembayaranDenda,
                        ];
                    }
                )
                ->values();

        $statusAktif = [
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
        ];

        $statusMenunggu = [
            'menunggu_konfirmasi_admin',
            'menunggu_identitas',
            'menunggu_verifikasi_identitas',
            'identitas_ditolak',
            'menunggu_pembayaran',
            'menunggu_verifikasi_pembayaran',
            'ditolak_pembayaran',
        ];

        $tagihanDendaAktif =
            $riwayatSewa
                ->filter(
                    fn (array $item): bool =>
                        (int) $item['total_denda'] > 0
                        && in_array(
                            $item[
                                'status_pembayaran_denda'
                            ],
                            [
                                Sewa::DENDA_BELUM_DIBAYAR,
                                Sewa::DENDA_MENUNGGU_VERIFIKASI,
                                Sewa::DENDA_DITOLAK,
                            ],
                            true
                        )
                );

        $ringkasan = [
            'total_transaksi' =>
                $riwayatSewa->count(),

            'transaksi_menunggu' =>
                $riwayatSewa
                    ->whereIn(
                        'status',
                        $statusMenunggu
                    )
                    ->count(),

            'transaksi_aktif' =>
                $riwayatSewa
                    ->whereIn(
                        'status',
                        $statusAktif
                    )
                    ->count(),

            'transaksi_selesai' =>
                $riwayatSewa
                    ->where(
                        'status',
                        'selesai'
                    )
                    ->count(),

            'jumlah_tagihan_denda' =>
                $tagihanDendaAktif
                    ->count(),

            'total_denda_belum_lunas' =>
                (int) $tagihanDendaAktif
                    ->sum(
                        'total_denda'
                    ),

            'perpanjangan_menunggu' =>
                $riwayatSewa
                    ->where(
                        'memiliki_perpanjangan_aktif',
                        true
                    )
                    ->count(),
        ];

        return Inertia::render(
            'Pelanggan/RiwayatSewa',
            [
                'riwayatSewa' =>
                    $riwayatSewa,

                'riwayat' =>
                    $riwayatSewa,

                'ringkasan' =>
                    $ringkasan,

                'memilikiDendaBelumLunas' =>
                    $memilikiDendaBelumLunas,
            ]
        );
    }

    /**
     * Menentukan alasan tombol perpanjangan tidak aktif.
     */
    private function tentukanAlasanPerpanjanganTidakTersedia(
        bool $statusDapatDiperpanjang,
        bool $masaRentalBelumBerakhir,
        bool $memilikiDendaBelumLunas,
        bool $memilikiPerpanjanganAktif
    ): ?string {
        if ($memilikiDendaBelumLunas) {
            return
                'Perpanjangan tidak tersedia karena akun masih memiliki denda yang belum lunas.';
        }

        if ($memilikiPerpanjanganAktif) {
            return
                'Permintaan perpanjangan sedang menunggu persetujuan admin.';
        }

        if (! $masaRentalBelumBerakhir) {
            return
                'Masa rental sudah berakhir.';
        }

        if (! $statusDapatDiperpanjang) {
            return
                'Perpanjangan hanya tersedia pada transaksi disetujui atau sedang berlangsung.';
        }

        return null;
    }

    /**
     * Menentukan status pembayaran denda.
     */
    private function normalisasiStatusPembayaranDenda(
        Sewa $sewa,
        int $totalDenda
    ): string {
        if ($totalDenda <= 0) {
            return Sewa::DENDA_TIDAK_ADA;
        }

        if (
            blank(
                $sewa
                    ->status_pembayaran_denda
            )
            || $sewa
                ->status_pembayaran_denda ===
                Sewa::DENDA_TIDAK_ADA
        ) {
            return Sewa::DENDA_BELUM_DIBAYAR;
        }

        return $sewa
            ->status_pembayaran_denda;
    }

    /**
     * Mengubah tanggal menjadi YYYY-MM-DD.
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
