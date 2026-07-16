<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sewa;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class RiwayatTransaksiController extends Controller
{
    /**
     * Menampilkan seluruh transaksi rental kepada admin.
     *
     * Data mencakup transaksi yang masih aktif, selesai,
     * ditolak, dibatalkan, serta transaksi dengan denda.
     */
    public function index(): Response
    {
        $transaksis = Sewa::query()
            ->with([
                'user:id,name,email',
                'kendaraan:id,nama_kendaraan,merek,plat_nomor,foto_kendaraan,harga_per_hari',
            ])
            ->orderByDesc('id')
            ->get()
            ->map(function (Sewa $sewa): array {
                return [
                    'id' => $sewa->id,

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
                            $sewa->tanggal_kembali_aktual
                        ),

                    'total_harga' =>
                        (int) ($sewa->total_harga ?? 0),

                    'denda_keterlambatan' =>
                        (int) (
                            $sewa->denda_keterlambatan
                            ?? 0
                        ),

                    'denda_kerusakan' =>
                        (int) (
                            $sewa->denda_kerusakan
                            ?? 0
                        ),

                    'total_denda' =>
                        (int) ($sewa->total_denda ?? 0),

                    'total_tagihan' =>
                        (int) ($sewa->total_harga ?? 0)
                        + (int) ($sewa->total_denda ?? 0),

                    'kondisi_kendaraan_kembali' =>
                        $sewa->kondisi_kendaraan_kembali,

                    'kilometer_kembali' =>
                        $sewa->kilometer_kembali,

                    'alasan_penolakan' =>
                        $sewa->alasan_penolakan,

                    'status' =>
                        $sewa->status,

                    'created_at' =>
                        $sewa->created_at
                            ?->toIso8601String(),

                    'updated_at' =>
                        $sewa->updated_at
                            ?->toIso8601String(),

                    'user' => $sewa->user
                        ? [
                            'id' =>
                                $sewa->user->id,

                            'name' =>
                                $sewa->user->name,

                            'email' =>
                                $sewa->user->email,
                        ]
                        : null,

                    /*
                     * Properti pelanggan juga dikirim untuk
                     * menjaga kompatibilitas dengan komponen
                     * yang mungkin membaca item.pelanggan.
                     */
                    'pelanggan' => $sewa->user
                        ? [
                            'id' =>
                                $sewa->user->id,

                            'name' =>
                                $sewa->user->name,

                            'email' =>
                                $sewa->user->email,
                        ]
                        : null,

                    'kendaraan' => $sewa->kendaraan
                        ? [
                            'id' =>
                                $sewa->kendaraan->id,

                            'nama_kendaraan' =>
                                $sewa->kendaraan
                                    ->nama_kendaraan,

                            'merek' =>
                                $sewa->kendaraan->merek,

                            'plat_nomor' =>
                                $sewa->kendaraan
                                    ->plat_nomor,

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
                ];
            })
            ->values();

        return Inertia::render(
            'Admin/RiwayatTransaksi',
            [
                'transaksis' => $transaksis,
            ]
        );
    }

    /**
     * Mengubah nilai tanggal menjadi format YYYY-MM-DD.
     */
    private function formatTanggal(
        mixed $tanggal
    ): ?string {
        if (blank($tanggal)) {
            return null;
        }

        return Carbon::parse($tanggal)
            ->toDateString();
    }
}
