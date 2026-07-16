<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NotifikasiTransaksi extends Notification
{
    use Queueable;

    /**
     * Membuat notifikasi transaksi baru.
     *
     * @param  array<string, mixed>  $dataTambahan
     */
    public function __construct(
        private readonly string $judul,
        private readonly string $pesan,
        private readonly string $jenis,
        private readonly ?string $url = null,
        private readonly ?int $sewaId = null,
        private readonly ?string $nomorBooking = null,
        private readonly array $dataTambahan = [],
    ) {
        //
    }

    /**
     * Menentukan saluran penyimpanan notifikasi.
     *
     * Notifikasi disimpan ke database sehingga tidak hilang
     * ketika pengguna keluar, mengganti perangkat, atau
     * melakukan refresh halaman.
     *
     * @return array<int, string>
     */
    public function via(
        object $notifiable
    ): array {
        return [
            'database',
        ];
    }

    /**
     * Menentukan data yang disimpan ke tabel notifications.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(
        object $notifiable
    ): array {
        return $this->buatPayload();
    }

    /**
     * Representasi array notifikasi.
     *
     * @return array<string, mixed>
     */
    public function toArray(
        object $notifiable
    ): array {
        return $this->buatPayload();
    }

    /**
     * Menyusun isi notifikasi dalam format yang konsisten.
     *
     * @return array<string, mixed>
     */
    private function buatPayload(): array
    {
        return array_merge(
            $this->dataTambahan,
            [
                'judul' =>
                    $this->judul,

                'pesan' =>
                    $this->pesan,

                /*
                 * Contoh jenis:
                 *
                 * booking_baru
                 * booking_disetujui
                 * booking_ditolak
                 * pembayaran_baru
                 * pembayaran_disetujui
                 * pembayaran_ditolak
                 * pengembalian_baru
                 * transaksi_selesai
                 */
                'jenis' =>
                    $this->jenis,

                /*
                 * URL yang akan dibuka ketika notifikasi ditekan.
                 */
                'url' =>
                    $this->url,

                /*
                 * Referensi transaksi terkait.
                 */
                'sewa_id' =>
                    $this->sewaId,

                'nomor_booking' =>
                    $this->nomorBooking,
            ]
        );
    }
}
