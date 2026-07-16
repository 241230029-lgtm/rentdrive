<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Models\Sewa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RiwayatSewaController extends Controller
{
    /**
     * Menampilkan seluruh transaksi milik pelanggan.
     *
     * Informasi internal seperti stok, jumlah unit,
     * dan plat nomor kendaraan tidak dikirimkan.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $riwayatSewa = Sewa::query()
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
                 * Pengembalian.
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
            ])
            ->map(function (Sewa $sewa): array {
                $totalDenda = max(
                    0,
                    (int) ($sewa->total_denda ?? 0)
                );

                /*
                 * Transaksi lama yang memiliki denda tetapi
                 * belum mempunyai status pembayaran tetap
                 * ditampilkan sebagai belum dibayar.
                 */
                $statusPembayaranDenda =
                    $this->normalisasiStatusPembayaranDenda(
                        $sewa,
                        $totalDenda
                    );

                $tanggalSelesai = $sewa->tanggal_selesai
                    ? Carbon::parse(
                        $sewa->tanggal_selesai
                    )->startOfDay()
                    : null;

                $tanggalKembali = $sewa->tanggal_kembali_aktual
                    ? Carbon::parse(
                        $sewa->tanggal_kembali_aktual
                    )->startOfDay()
                    : null;

                $hariTerlambat = 0;

                if (
                    $tanggalSelesai
                    && $tanggalKembali
                    && $tanggalKembali->greaterThan(
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
                    || $sewa->status === 'selesai';

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
                     * Kendaraan tanpa informasi stok internal.
                     */
                    'kendaraan' =>
                        $sewa->kendaraan
                            ? [
                                'id' =>
                                    $sewa->kendaraan->id,

                                'nama_kendaraan' =>
                                    $sewa->kendaraan
                                        ->nama_kendaraan,

                                'merek' =>
                                    $sewa->kendaraan
                                        ->merek,

                                'foto_kendaraan' =>
                                    $sewa->kendaraan
                                        ->foto_kendaraan,

                                'harga_per_hari' =>
                                    (int) (
                                        $sewa->kendaraan
                                            ->harga_per_hari
                                        ?? 0
                                    ),
                            ]
                            : null,

                    /*
                     * Detail pengembalian kendaraan.
                     */
                    'pengembalian' =>
                        $memilikiDataPengembalian
                            ? [
                                'tanggal_seharusnya' =>
                                    $this->formatTanggal(
                                        $sewa->tanggal_selesai
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
                            $sewa->denda_dibayar_pada
                                ?->toIso8601String(),

                        'diperiksa_pada' =>
                            $sewa->denda_diperiksa_pada
                                ?->toIso8601String(),

                        /*
                         * Tombol pembayaran hanya aktif apabila
                         * tagihan belum dibayar atau sebelumnya
                         * ditolak oleh admin.
                         */
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

                    /*
                     * Alias agar komponen frontend lebih mudah
                     * membaca status denda.
                     */
                    'total_denda' =>
                        $totalDenda,

                    'status_pembayaran_denda' =>
                        $statusPembayaranDenda,
                ];
            })
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

        $tagihanDendaAktif = $riwayatSewa
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
                    ->sum('total_denda'),
        ];

        return Inertia::render(
            'Pelanggan/RiwayatSewa',
            [
                'riwayatSewa' =>
                    $riwayatSewa,

                /*
                 * Alias untuk kompatibilitas dengan kode lama.
                 */
                'riwayat' =>
                    $riwayatSewa,

                'ringkasan' =>
                    $ringkasan,
            ]
        );
    }

    /**
     * Menentukan status pembayaran denda yang ditampilkan.
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
                $sewa->status_pembayaran_denda
            )
            || $sewa->status_pembayaran_denda ===
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
