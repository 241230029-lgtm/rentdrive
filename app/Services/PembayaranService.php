<?php

namespace App\Services;

use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use App\Notifications\NotifikasiTransaksi;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PembayaranService
{
    /**
     * Admin menyetujui atau menolak bukti pembayaran pelanggan.
     *
     * Hasil verifikasi dikirim kepada pelanggan melalui notifikasi
     * yang membuka halaman detail pembayaran transaksi terkait.
     */
    public function verifikasi(
        int $sewaId,
        array $data,
        User $admin,
        string $alamatIp
    ): void {
        DB::transaction(function () use (
            $sewaId,
            $data,
            $admin,
            $alamatIp
        ): void {
            $sewa = Sewa::query()
                ->with([
                    'user:id,name,email',
                    'kendaraan:id,nama_kendaraan,merek',
                ])
                ->lockForUpdate()
                ->findOrFail($sewaId);

            if (
                $sewa->status !==
                'menunggu_verifikasi_pembayaran'
            ) {
                throw ValidationException::withMessages([
                    'aksi' =>
                        'Transaksi tidak sedang menunggu verifikasi pembayaran.',
                ]);
            }

            if ($data['aksi'] === 'setujui') {
                $this->setujuiPembayaran(
                    $sewa,
                    $admin,
                    $alamatIp
                );

                return;
            }

            $this->tolakPembayaran(
                $sewa,
                $data,
                $admin,
                $alamatIp
            );
        });
    }

    /**
     * Menyetujui pembayaran pelanggan.
     */
    private function setujuiPembayaran(
        Sewa $sewa,
        User $admin,
        string $alamatIp
    ): void {
        $sewa->update([
            'status' => 'disetujui_operasional',
            'alasan_penolakan' => null,
            'jenis_penolakan' => null,
            'kategori_penolakan' => null,
            'ditolak_oleh' => null,
            'ditolak_pada' => null,
        ]);

        LogAktivitas::create([
            'user_id' => $admin->id,
            'jenis_aktivitas' => 'Persetujuan Pembayaran',
            'deskripsi' =>
                'Admin menyetujui pembayaran booking '
                . $sewa->nomor_booking
                . ' milik pelanggan '
                . $sewa->user->name
                . '.',
            'alamat_ip' => $alamatIp,
        ]);

        /*
         * Pelanggan diarahkan ke halaman pembayaran terlebih dahulu
         * agar dapat melihat detail hasil verifikasi. Dari halaman itu
         * pelanggan dapat melanjutkan ke riwayat booking.
         */
        $sewa->user->notify(
            new NotifikasiTransaksi(
                judul: 'Pembayaran Disetujui',
                pesan:
                    'Pembayaran booking '
                    . $sewa->nomor_booking
                    . ' untuk '
                    . ($sewa->kendaraan?->nama_kendaraan
                        ?? 'kendaraan RentDrive')
                    . ' telah diverifikasi. '
                    . 'Booking Anda siap masuk ke proses operasional.',
                jenis: 'pembayaran_disetujui',
                url:
                    '/pelanggan/pembayaran/'
                    . $sewa->id,
                sewaId: $sewa->id,
                nomorBooking: $sewa->nomor_booking,
                dataTambahan: [
                    'kendaraan' =>
                        $sewa->kendaraan?->nama_kendaraan,
                    'status_baru' =>
                        'disetujui_operasional',
                ],
            )
        );
    }

    /**
     * Menolak pembayaran pelanggan.
     */
    private function tolakPembayaran(
        Sewa $sewa,
        array $data,
        User $admin,
        string $alamatIp
    ): void {
        $sewa->update([
            'status' => 'ditolak_pembayaran',
            'jenis_penolakan' => 'pembayaran',
            'kategori_penolakan' =>
                $data['kategori_penolakan'],
            'alasan_penolakan' =>
                $data['alasan_penolakan'],
            'ditolak_oleh' => $admin->id,
            'ditolak_pada' => now(),
        ]);

        LogAktivitas::create([
            'user_id' => $admin->id,
            'jenis_aktivitas' => 'Penolakan Pembayaran',
            'deskripsi' =>
                'Admin menolak pembayaran booking '
                . $sewa->nomor_booking
                . '. Kategori: '
                . $data['kategori_penolakan']
                . '. Keterangan: '
                . $data['alasan_penolakan'],
            'alamat_ip' => $alamatIp,
        ]);

        /*
         * Alasan pembayaran boleh disampaikan kepada pelanggan karena
         * dibutuhkan untuk memperbaiki bukti. Kategori internal admin
         * tidak ikut dikirimkan.
         */
        $sewa->user->notify(
            new NotifikasiTransaksi(
                judul: 'Pembayaran Perlu Diperbaiki',
                pesan:
                    'Bukti pembayaran booking '
                    . $sewa->nomor_booking
                    . ' belum dapat diverifikasi. '
                    . 'Keterangan: '
                    . $data['alasan_penolakan']
                    . ' Silakan unggah ulang bukti pembayaran.',
                jenis: 'pembayaran_ditolak',
                url:
                    '/pelanggan/pembayaran/'
                    . $sewa->id,
                sewaId: $sewa->id,
                nomorBooking: $sewa->nomor_booking,
                dataTambahan: [
                    'kendaraan' =>
                        $sewa->kendaraan?->nama_kendaraan,
                    'status_baru' =>
                        'ditolak_pembayaran',
                ],
            )
        );
    }
}
