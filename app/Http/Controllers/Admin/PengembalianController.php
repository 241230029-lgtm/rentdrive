<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProsesPengembalianRequest;
use App\Services\PengembalianService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PengembalianController extends Controller
{
    public function __construct(
        private readonly PengembalianService $pengembalianService
    ) {
    }

    public function index(): Response
    {
        return Inertia::render(
            'Admin/KelolaPengembalian'
        );
    }

    public function proses(
        ProsesPengembalianRequest $request,
        int $id
    ): RedirectResponse {
        $sewa = $this->pengembalianService
            ->selesaikan(
                $id,
                $request->validated(),
                $request->user(),
                $request->ip()
            );

        return redirect()
            ->route('admin.pengembalian.index')
            ->with(
                'success',
                'Pengembalian transaksi ' .
                $sewa->nomor_booking .
                ' berhasil diselesaikan.'
            );
    }
}
