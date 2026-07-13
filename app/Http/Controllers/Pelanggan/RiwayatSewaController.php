<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Models\Sewa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RiwayatSewaController extends Controller
{
    /**
     * Menampilkan seluruh riwayat penyewaan milik
     * pelanggan yang sedang login.
     *
     * Pelanggan hanya dapat melihat transaksi
     * yang memiliki user_id sesuai akun miliknya.
     */
    public function index(Request $request): Response
    {
        $riwayatSewa = Sewa::query()
            ->with([
                'kendaraan:id,nama_kendaraan,merek,foto_kendaraan,harga_per_hari',
            ])
            ->where(
                'user_id',
                $request->user()->id
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
                'bukti_pembayaran',
                'tanggal_kembali_aktual',
                'kondisi_kendaraan_kembali',
                'foto_kondisi_kembali',
                'kilometer_kembali',
                'denda_keterlambatan',
                'denda_kerusakan',
                'total_denda',
                'alasan_penolakan',
                'jenis_penolakan',
                'kategori_penolakan',
                'ditolak_oleh',
                'ditolak_pada',
                'status',
                'created_at',
            ]);

        return Inertia::render(
            'Pelanggan/RiwayatSewa',
            [
                'riwayatSewa' => $riwayatSewa,
            ]
        );
    }
}
