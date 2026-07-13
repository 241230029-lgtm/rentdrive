<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\StoreBookingRequest;
use App\Services\BookingService;
use Illuminate\Http\RedirectResponse;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService
    ) {
    }

    /**
     * Menyimpan pengajuan booking online pelanggan.
     */
    public function store(
        StoreBookingRequest $request
    ): RedirectResponse {
        $sewa = $this->bookingService
            ->buatBookingOnline(
                $request->validated(),
                $request->user()
            );

        return redirect()
            ->route('pelanggan.riwayat')
            ->with(
                'success',
                'Booking berhasil diajukan dengan nomor ' .
                $sewa->nomor_booking .
                '. Permintaan sedang menunggu konfirmasi admin.'
            );
    }
}
