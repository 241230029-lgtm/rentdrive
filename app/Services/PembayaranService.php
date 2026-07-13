<?php

namespace App\Services;

use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PembayaranService
{
    /**
     * Admin menyetujui atau menolak
     * bukti pembayaran pelanggan.
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
        ) {
            $sewa = Sewa::query()
                ->with([
                    'user',
                    'kendaraan',
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
                $sewa->update([
                    'status' =>
                        'disetujui_operasional',

                    'alasan_penolakan' =>
                        null,

                    'jenis_penolakan' =>
                        null,

                    'kategori_penolakan' =>
                        null,

                    'ditolak_oleh' =>
                        null,

                    'ditolak_pada' =>
                        null,
                ]);

                LogAktivitas::create([
                    'user_id' =>
                        $admin->id,

                    'jenis_aktivitas' =>
                        'Persetujuan Pembayaran',

                    'deskripsi' =>
                        'Admin menyetujui pembayaran booking ' .
                        $sewa->nomor_booking .
                        ' milik pelanggan ' .
                        $sewa->user->name .
                        '.',

                    'alamat_ip' =>
                        $alamatIp,
                ]);

                return;
            }

            $sewa->update([
                'status' =>
                    'ditolak_pembayaran',

                'jenis_penolakan' =>
                    'pembayaran',

                'kategori_penolakan' =>
                    $data['kategori_penolakan'],

                'alasan_penolakan' =>
                    $data['alasan_penolakan'],

                'ditolak_oleh' =>
                    $admin->id,

                'ditolak_pada' =>
                    now(),
            ]);

            LogAktivitas::create([
                'user_id' =>
                    $admin->id,

                'jenis_aktivitas' =>
                    'Penolakan Pembayaran',

                'deskripsi' =>
                    'Admin menolak pembayaran booking ' .
                    $sewa->nomor_booking .
                    '. Kategori: ' .
                    $data['kategori_penolakan'] .
                    '. Keterangan: ' .
                    $data['alasan_penolakan'],

                'alamat_ip' =>
                    $alamatIp,
            ]);
        });
    }
}
