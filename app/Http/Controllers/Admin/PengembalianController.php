<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProsesPengembalianRequest;
use App\Models\Sewa;
use App\Services\PengembalianService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengembalianController extends Controller
{
    public function __construct(
        private readonly PengembalianService $pengembalianService
    ) {
    }

    /**
     * Menampilkan transaksi yang dapat diproses sebagai pengembalian.
     */
    public function index(Request $request): Response
    {
        $tanggalHariIni = now()->toDateString();

        $pengembalians = Sewa::query()
            ->with([
                'user:id,name,email,no_telepon',
                'kendaraan:id,nama_kendaraan,merek,plat_nomor,harga_per_hari,foto_kendaraan',
            ])
            ->whereIn('status', [
                'disetujui_operasional',
                'sedang_berlangsung',
                'menunggu_verifikasi_pengembalian',
            ])
            ->orderBy('tanggal_selesai')
            ->orderBy('id')
            ->get([
                'id',
                'nomor_booking',
                'user_id',
                'kendaraan_id',
                'jenis_booking',
                'tanggal_mulai',
                'tanggal_selesai',
                'total_harga',
                'tanggal_kembali_aktual',
                'kondisi_kendaraan_kembali',
                'foto_kondisi_kembali',
                'kilometer_kembali',
                'denda_keterlambatan',
                'denda_kerusakan',
                'total_denda',
                'status',
                'created_at',
            ]);

        $dataPengembalian = $pengembalians
            ->map(function (Sewa $sewa): array {
                return [
                    'id' => $sewa->id,

                    'nomor_booking' =>
                        $sewa->nomor_booking,

                    'jenis_booking' =>
                        $sewa->jenis_booking,

                    'tanggal_mulai' =>
                        $sewa->tanggal_mulai
                            ?->format('Y-m-d'),

                    'tanggal_selesai' =>
                        $sewa->tanggal_selesai
                            ?->format('Y-m-d'),

                    'total_harga' =>
                        (int) $sewa->total_harga,

                    'tanggal_kembali_aktual' =>
                        $sewa->tanggal_kembali_aktual
                            ?->format('Y-m-d'),

                    'kondisi_kendaraan_kembali' =>
                        $sewa->kondisi_kendaraan_kembali,

                    'kilometer_kembali' =>
                        $sewa->kilometer_kembali,

                    'denda_keterlambatan' =>
                        (int) $sewa->denda_keterlambatan,

                    'denda_kerusakan' =>
                        (int) $sewa->denda_kerusakan,

                    'total_denda' =>
                        (int) $sewa->total_denda,

                    'status' => $sewa->status,

                    'pelanggan' => $sewa->user
                        ? [
                            'id' =>
                                $sewa->user->id,

                            'name' =>
                                $sewa->user->name,

                            'email' =>
                                $sewa->user->email,

                            'no_telepon' =>
                                $sewa->user->no_telepon,
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

                            'harga_per_hari' =>
                                (int) $sewa->kendaraan
                                    ->harga_per_hari,

                            'foto_kendaraan' =>
                                $sewa->kendaraan
                                    ->foto_kendaraan,
                        ]
                        : null,
                ];
            })
            ->values();

        $ringkasan = [
            'total' =>
                $pengembalians->count(),

            'jatuh_tempo_hari_ini' =>
                $pengembalians
                    ->filter(
                        fn (Sewa $sewa): bool =>
                            $sewa->tanggal_selesai
                                ?->toDateString()
                            === $tanggalHariIni
                    )
                    ->count(),

            'terlambat' =>
                $pengembalians
                    ->filter(
                        fn (Sewa $sewa): bool =>
                            $sewa->tanggal_selesai
                                ?->isBefore(now()->startOfDay())
                            ?? false
                    )
                    ->count(),

            'sedang_berlangsung' =>
                $pengembalians
                    ->where(
                        'status',
                        'sedang_berlangsung'
                    )
                    ->count(),

            'menunggu_verifikasi' =>
                $pengembalians
                    ->where(
                        'status',
                        'menunggu_verifikasi_pengembalian'
                    )
                    ->count(),
        ];

        return Inertia::render(
            'Admin/KelolaPengembalian',
            [
                'pengembalians' =>
                    $dataPengembalian,

                'ringkasan' =>
                    $ringkasan,

                'tanggal_hari_ini' =>
                    $tanggalHariIni,
            ]
        );
    }

    /**
     * Menyimpan hasil pemeriksaan pengembalian kendaraan.
     */
    public function proses(
        ProsesPengembalianRequest $request,
        int $id
    ): RedirectResponse {
        $sewa = $this->pengembalianService
            ->proses(
                sewaId: $id,
                data: $request->validated(),
                admin: $request->user(),
                alamatIp: $request->ip(),
            );

        $pesan = (int) $sewa->total_denda > 0
            ? 'Pengembalian berhasil diproses. Detail denda telah dikirim kepada pelanggan.'
            : 'Pengembalian berhasil diselesaikan. Pelanggan telah menerima notifikasi.';

        return redirect()
            ->route(
                'admin.pengembalian.index'
            )
            ->with('success', $pesan);
    }
}
