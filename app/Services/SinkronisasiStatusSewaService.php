<?php

namespace App\Services;

use App\Models\Sewa;

class SinkronisasiStatusSewaService
{
    /**
     * Mengubah transaksi pelanggan dari
     * disetujui_operasional menjadi sedang_berlangsung
     * ketika tanggal mulai rental telah tiba.
     */
    public function sinkronkanPelanggan(
        int $pelangganId
    ): int {
        return Sewa::query()
            ->where(
                'user_id',
                $pelangganId
            )
            ->where(
                'status',
                'disetujui_operasional'
            )
            ->whereDate(
                'tanggal_mulai',
                '<=',
                now()->toDateString()
            )
            ->update([
                'status' =>
                    'sedang_berlangsung',

                'updated_at' =>
                    now(),
            ]);
    }

    /**
     * Sinkronisasi seluruh transaksi.
     *
     * Method ini nantinya dapat digunakan pada
     * dashboard admin, laporan, atau scheduler.
     */
    public function sinkronkanSemua(): int
    {
        return Sewa::query()
            ->where(
                'status',
                'disetujui_operasional'
            )
            ->whereDate(
                'tanggal_mulai',
                '<=',
                now()->toDateString()
            )
            ->update([
                'status' =>
                    'sedang_berlangsung',

                'updated_at' =>
                    now(),
            ]);
    }
}
