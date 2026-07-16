<?php

namespace App\Services;

use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use App\Notifications\NotifikasiTransaksi;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class PengembalianService
{
    /**
     * Memproses pengembalian kendaraan oleh admin.
     *
     * Proses meliputi:
     * - menyimpan kondisi kendaraan;
     * - menghitung keterlambatan;
     * - menghitung denda;
     * - membuat tagihan denda;
     * - menyelesaikan transaksi sewa;
     * - mencatat aktivitas admin;
     * - mengirim notifikasi kepada pelanggan.
     */
    public function proses(
        int $sewaId,
        array $data,
        User $admin,
        string $alamatIp
    ): Sewa {
        $fileBaru = null;
        $fileLama = null;

        try {
            $sewaHasil = DB::transaction(
                function () use (
                    $sewaId,
                    $data,
                    $admin,
                    $alamatIp,
                    &$fileBaru,
                    &$fileLama
                ): Sewa {
                    $sewa = Sewa::query()
                        ->with([
                            'user:id,name,email',
                            'kendaraan:id,nama_kendaraan,merek,harga_per_hari',
                        ])
                        ->lockForUpdate()
                        ->findOrFail($sewaId);

                    $statusYangDapatDiproses = [
                        'disetujui_operasional',
                        'sedang_berlangsung',
                        'menunggu_verifikasi_pengembalian',
                    ];

                    if (
                        ! in_array(
                            $sewa->status,
                            $statusYangDapatDiproses,
                            true
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'pengembalian' =>
                                'Transaksi ini tidak dapat diproses sebagai pengembalian.',
                        ]);
                    }

                    if (! $sewa->user) {
                        throw ValidationException::withMessages([
                            'pengembalian' =>
                                'Data pelanggan pada transaksi tidak ditemukan.',
                        ]);
                    }

                    if (! $sewa->kendaraan) {
                        throw ValidationException::withMessages([
                            'pengembalian' =>
                                'Data kendaraan pada transaksi tidak ditemukan.',
                        ]);
                    }

                    /*
                     * Menentukan tanggal jatuh tempo dan
                     * tanggal kendaraan benar-benar kembali.
                     */
                    $tanggalSelesai = Carbon::parse(
                        $sewa->tanggal_selesai
                    )->startOfDay();

                    $tanggalKembali = Carbon::parse(
                        $data['tanggal_kembali_aktual']
                    )->startOfDay();

                    /*
                     * Kendaraan tidak boleh dikembalikan sebelum
                     * tanggal mulai penyewaan.
                     */
                    $tanggalMulai = Carbon::parse(
                        $sewa->tanggal_mulai
                    )->startOfDay();

                    if (
                        $tanggalKembali->lessThan(
                            $tanggalMulai
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'tanggal_kembali_aktual' =>
                                'Tanggal pengembalian tidak boleh sebelum tanggal mulai penyewaan.',
                        ]);
                    }

                    /*
                     * Menghitung jumlah hari keterlambatan.
                     */
                    $hariTerlambat = 0;

                    if (
                        $tanggalKembali->greaterThan(
                            $tanggalSelesai
                        )
                    ) {
                        $hariTerlambat =
                            (int) $tanggalSelesai
                                ->diffInDays(
                                    $tanggalKembali
                                );
                    }

                    /*
                     * Denda keterlambatan dihitung berdasarkan
                     * harga sewa kendaraan per hari.
                     */
                    $hargaPerHari = max(
                        0,
                        (int) $sewa
                            ->kendaraan
                            ->harga_per_hari
                    );

                    $dendaKeterlambatan =
                        $hariTerlambat
                        * $hargaPerHari;

                    /*
                     * Denda kerusakan ditentukan admin
                     * berdasarkan hasil pemeriksaan kendaraan.
                     */
                    $dendaKerusakan = max(
                        0,
                        (int) (
                            $data['denda_kerusakan']
                            ?? 0
                        )
                    );

                    $totalDenda =
                        $dendaKeterlambatan
                        + $dendaKerusakan;

                    /*
                     * Menyimpan foto kondisi kendaraan.
                     */
                    $fileLama =
                        $sewa->foto_kondisi_kembali;

                    if (
                        isset(
                            $data['foto_kondisi_kembali']
                        )
                        && $data['foto_kondisi_kembali']
                    ) {
                        $fileBaru =
                            $data['foto_kondisi_kembali']
                                ->store(
                                    'kondisi_kembali',
                                    'public'
                                );
                    }

                    /*
                     * Apabila ada denda, status pembayaran
                     * langsung menjadi belum_dibayar.
                     *
                     * Data pembayaran sebelumnya dibersihkan
                     * karena proses pengembalian hanya boleh
                     * dilakukan satu kali.
                     */
                    $statusPembayaranDenda =
                        $totalDenda > 0
                            ? Sewa::DENDA_BELUM_DIBAYAR
                            : Sewa::DENDA_TIDAK_ADA;

                    $sewa->update([
                        'tanggal_kembali_aktual' =>
                            $tanggalKembali
                                ->toDateString(),

                        'kondisi_kendaraan_kembali' =>
                            trim(
                                (string) $data[
                                    'kondisi_kendaraan_kembali'
                                ]
                            ),

                        'kilometer_kembali' =>
                            (int) $data[
                                'kilometer_kembali'
                            ],

                        'denda_keterlambatan' =>
                            $dendaKeterlambatan,

                        'denda_kerusakan' =>
                            $dendaKerusakan,

                        'total_denda' =>
                            $totalDenda,

                        'foto_kondisi_kembali' =>
                            $fileBaru
                            ?: $fileLama,

                        /*
                         * Status pembayaran denda.
                         */
                        'status_pembayaran_denda' =>
                            $statusPembayaranDenda,

                        'metode_pembayaran_denda' =>
                            null,

                        'bukti_pembayaran_denda' =>
                            null,

                        'alasan_penolakan_pembayaran_denda' =>
                            null,

                        'denda_dibayar_pada' =>
                            null,

                        'denda_diperiksa_pada' =>
                            null,

                        'denda_diperiksa_oleh' =>
                            null,

                        /*
                         * Transaksi sewa selesai setelah
                         * kendaraan dikembalikan.
                         *
                         * Tagihan denda tetap berjalan melalui
                         * status_pembayaran_denda.
                         */
                        'status' =>
                            'selesai',
                    ]);

                    /*
                     * Mencatat aktivitas admin.
                     */
                    LogAktivitas::query()->create([
                        'user_id' =>
                            $admin->id,

                        'jenis_aktivitas' =>
                            'Proses Pengembalian',

                        'deskripsi' =>
                            'Admin memproses pengembalian booking '
                            . $sewa->nomor_booking
                            . ' milik pelanggan '
                            . $sewa->user->name
                            . '. Keterlambatan: '
                            . $hariTerlambat
                            . ' hari. Denda keterlambatan: Rp'
                            . number_format(
                                $dendaKeterlambatan,
                                0,
                                ',',
                                '.'
                            )
                            . '. Denda kerusakan: Rp'
                            . number_format(
                                $dendaKerusakan,
                                0,
                                ',',
                                '.'
                            )
                            . '. Total denda: Rp'
                            . number_format(
                                $totalDenda,
                                0,
                                ',',
                                '.'
                            )
                            . '. Status pembayaran denda: '
                            . $statusPembayaranDenda
                            . '.',

                        'alamat_ip' =>
                            $alamatIp,
                    ]);

                    $namaKendaraan =
                        $sewa->kendaraan
                            ->nama_kendaraan
                        ?? 'kendaraan RentDrive';

                    /*
                     * Mengirim notifikasi kepada pelanggan.
                     */
                    if ($totalDenda > 0) {
                        $judul =
                            'Tagihan Denda Pengembalian';

                        $pesan =
                            'Pengembalian '
                            . $namaKendaraan
                            . ' untuk booking '
                            . $sewa->nomor_booking
                            . ' telah diproses. '
                            . 'Anda memiliki tagihan denda sebesar Rp'
                            . number_format(
                                $totalDenda,
                                0,
                                ',',
                                '.'
                            )
                            . '. Selesaikan pembayaran denda sebelum melakukan booking baru.';

                        $jenisNotifikasi =
                            'tagihan_denda';

                        $urlNotifikasi =
                            '/pelanggan/riwayat?sewa='
                            . $sewa->id
                            . '&detail=pengembalian';
                    } else {
                        $judul =
                            'Pengembalian Kendaraan Selesai';

                        $pesan =
                            'Pengembalian '
                            . $namaKendaraan
                            . ' untuk booking '
                            . $sewa->nomor_booking
                            . ' telah selesai diproses. '
                            . 'Tidak terdapat denda tambahan.';

                        $jenisNotifikasi =
                            'transaksi_selesai';

                        $urlNotifikasi =
                            '/pelanggan/riwayat?sewa='
                            . $sewa->id
                            . '&detail=pengembalian';
                    }

                    $sewa->user->notify(
                        new NotifikasiTransaksi(
                            judul:
                                $judul,

                            pesan:
                                $pesan,

                            jenis:
                                $jenisNotifikasi,

                            url:
                                $urlNotifikasi,

                            sewaId:
                                $sewa->id,

                            nomorBooking:
                                $sewa->nomor_booking,

                            dataTambahan: [
                                'kendaraan' =>
                                    $namaKendaraan,

                                'tanggal_kembali_aktual' =>
                                    $tanggalKembali
                                        ->toDateString(),

                                'hari_terlambat' =>
                                    $hariTerlambat,

                                'denda_keterlambatan' =>
                                    $dendaKeterlambatan,

                                'denda_kerusakan' =>
                                    $dendaKerusakan,

                                'total_denda' =>
                                    $totalDenda,

                                'status_pembayaran_denda' =>
                                    $statusPembayaranDenda,

                                'status_baru' =>
                                    'selesai',
                            ],
                        )
                    );

                    return $sewa->fresh([
                        'user',
                        'kendaraan',
                    ]);
                }
            );
        } catch (Throwable $exception) {
            /*
             * Menghapus file baru apabila proses database
             * atau notifikasi gagal.
             */
            if ($fileBaru) {
                Storage::disk('public')
                    ->delete(
                        $fileBaru
                    );
            }

            throw $exception;
        }

        /*
         * Foto lama baru dihapus setelah transaksi baru
         * benar-benar berhasil.
         */
        if (
            $fileBaru
            && $fileLama
            && $fileLama !== $fileBaru
        ) {
            Storage::disk('public')
                ->delete(
                    $fileLama
                );
        }

        return $sewaHasil;
    }
}
