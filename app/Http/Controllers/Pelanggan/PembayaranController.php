<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\UploadBuktiPembayaranRequest;
use App\Models\Sewa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class PembayaranController extends Controller
{
    /**
     * Menyimpan bukti pembayaran yang diunggah pelanggan.
     *
     * Pelanggan hanya dapat mengunggah bukti pembayaran
     * untuk transaksi miliknya sendiri.
     */
    public function store(
        UploadBuktiPembayaranRequest $request,
        int $id
    ): RedirectResponse {
        $data = $request->validated();

        $sewa = Sewa::query()
            ->where('id', $id)
            ->where(
                'user_id',
                $request->user()->id
            )
            ->firstOrFail();

        /*
         * Bukti pembayaran hanya dapat diunggah setelah
         * booking disetujui admin atau setelah pembayaran
         * sebelumnya ditolak.
         */
        if (
            ! in_array(
                $sewa->status,
                [
                    'menunggu_pembayaran',
                    'ditolak_pembayaran',
                ],
                true
            )
        ) {
            return back()->with(
                'error',
                'Bukti pembayaran tidak dapat diunggah pada status transaksi ini.'
            );
        }

        $fileLama = $sewa->bukti_pembayaran;

        $fileBaru = $data['bukti_pembayaran']
            ->store(
                'bukti_pembayaran',
                'public'
            );

        $sewa->update([
            'bukti_pembayaran' =>
                $fileBaru,

            'status' =>
                'menunggu_verifikasi_pembayaran',

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

        /*
         * Bukti lama dihapus setelah bukti baru
         * berhasil disimpan.
         */
        if (
            $fileLama &&
            $fileLama !== 'WALK_IN_CASH' &&
            $fileLama !== $fileBaru
        ) {
            Storage::disk('public')
                ->delete($fileLama);
        }

        return redirect()
            ->route('pelanggan.riwayat')
            ->with(
                'success',
                'Bukti pembayaran berhasil dikirim dan sedang menunggu verifikasi admin.'
            );
    }
}
