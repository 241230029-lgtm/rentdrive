<?php

namespace App\Services;

use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class PengembalianService
{
    /**
     * Menyelesaikan proses pengembalian kendaraan.
     */
    public function selesaikan(
        int $sewaId,
        array $data,
        User $admin,
        string $alamatIp
    ): Sewa {
        $sewa = Sewa::query()
            ->with([
                'kendaraan',
                'user',
            ])
            ->findOrFail($sewaId);

        if (
            ! in_array(
                $sewa->status,
                [
                    'disetujui_operasional',
                    'sedang_berlangsung',
                    'menunggu_verifikasi_pengembalian',
                ],
                true
            )
        ) {
            throw ValidationException::withMessages([
                'tanggal_kembali_aktual' =>
                    'Transaksi ini tidak dapat diproses pada menu pengembalian.',
            ]);
        }

        $tanggalMulai = Carbon::parse(
            $sewa->tanggal_mulai
        );

        $tanggalSelesai = Carbon::parse(
            $sewa->tanggal_selesai
        );

        $tanggalKembaliAktual = Carbon::parse(
            $data['tanggal_kembali_aktual']
        );

        if (
            $tanggalKembaliAktual->lt(
                $tanggalMulai
            )
        ) {
            throw ValidationException::withMessages([
                'tanggal_kembali_aktual' =>
                    'Tanggal pengembalian tidak boleh sebelum tanggal mulai sewa.',
            ]);
        }

        $dendaKeterlambatan = 0;

        if (
            $tanggalKembaliAktual->gt(
                $tanggalSelesai
            )
        ) {
            $hariTerlambat = (int)
                $tanggalSelesai->diffInDays(
                    $tanggalKembaliAktual
                );

            $dendaKeterlambatan =
                $hariTerlambat *
                (int) $sewa
                    ->kendaraan
                    ->harga_per_hari;
        }

        $dendaKerusakan =
            (int) $data['denda_kerusakan'];

        $totalDenda =
            $dendaKeterlambatan +
            $dendaKerusakan;

        $namaFotoKembali =
            $sewa->foto_kondisi_kembali;

        if (
            isset(
                $data['foto_kondisi_kembali']
            )
        ) {
            $namaFotoKembali =
                $data['foto_kondisi_kembali']
                    ->store(
                        'kondisi_kembali',
                        'public'
                    );
        }

        $sewa->update([
            'tanggal_kembali_aktual' =>
                $data['tanggal_kembali_aktual'],

            'kondisi_kendaraan_kembali' =>
                $data['kondisi_kendaraan_kembali'],

            'foto_kondisi_kembali' =>
                $namaFotoKembali,

            'kilometer_kembali' =>
                $data['kilometer_kembali'],

            'denda_keterlambatan' =>
                $dendaKeterlambatan,

            'denda_kerusakan' =>
                $dendaKerusakan,

            'total_denda' =>
                $totalDenda,

            'status' =>
                'selesai',
        ]);

        LogAktivitas::create([
            'user_id' =>
                $admin->id,

            'jenis_aktivitas' =>
                'Penyelesaian Pengembalian',

            'deskripsi' =>
                'Admin menyelesaikan transaksi ' .
                $sewa->nomor_booking .
                '. Total denda Rp ' .
                number_format(
                    $totalDenda,
                    0,
                    ',',
                    '.'
                ) .
                '.',

            'alamat_ip' =>
                $alamatIp,
        ]);

        return $sewa->fresh([
            'kendaraan',
            'user',
        ]);
    }
}
