<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VerifikasiPembayaranRequest;
use App\Services\PembayaranService;
use Illuminate\Http\RedirectResponse;

class PembayaranController extends Controller
{
    public function __construct(
        private readonly PembayaranService $pembayaranService
    ) {
    }

    public function verifikasi(
        VerifikasiPembayaranRequest $request,
        int $id
    ): RedirectResponse {
        $data = $request->validated();

        $this->pembayaranService->verifikasi(
            $id,
            $data,
            $request->user(),
            $request->ip()
        );

        return back()->with(
            'success',
            $data['aksi'] === 'setujui'
                ? 'Pembayaran berhasil disetujui.'
                : 'Pembayaran berhasil ditolak dan pelanggan dapat mengunggah ulang bukti pembayaran.'
        );
    }
}
