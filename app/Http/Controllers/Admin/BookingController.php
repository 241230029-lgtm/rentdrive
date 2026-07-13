<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CekKetersediaanRequest;
use App\Http\Requests\Admin\KonfirmasiBookingRequest;
use App\Http\Requests\Admin\StoreWalkInRequest;
use App\Models\Kendaraan;
use App\Models\Sewa;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService
    ) {
    }

    public function index(): Response
    {
        $bookings = Sewa::query()
            ->with([
                'user:id,name,email',
                'kendaraan:id,nama_kendaraan,merek,foto_kendaraan,jumlah_unit,status',
            ])
            ->where('jenis_booking', 'online')
            ->latest()
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
                'alasan_penolakan',
                'jenis_penolakan',
                'kategori_penolakan',
                'ditolak_oleh',
                'ditolak_pada',
                'status',
                'created_at',
            ]);

        $pelanggans = User::query()
            ->where('role', 'pelanggan')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
            ]);

        $kendaraans = Kendaraan::query()
            ->orderBy('nama_kendaraan')
            ->get([
                'id',
                'nama_kendaraan',
                'merek',
                'harga_per_hari',
                'jumlah_unit',
                'plat_nomor',
                'status',
            ]);

        return Inertia::render('Admin/KelolaBooking', [
            'bookings' => $bookings,
            'pelanggans' => $pelanggans,
            'kendaraans' => $kendaraans,
        ]);
    }

    public function konfirmasi(
        KonfirmasiBookingRequest $request,
        int $id
    ): RedirectResponse {
        $data = $request->validated();

        $this->bookingService->konfirmasiBooking(
            $id,
            $data,
            $request->user(),
            $request->ip()
        );

        return back()->with(
            'success',
            $data['aksi'] === 'setujui'
                ? 'Booking berhasil disetujui. Pelanggan dapat melakukan pembayaran.'
                : 'Booking berhasil ditolak dan keterangan penolakan akan ditampilkan kepada pelanggan.'
        );
    }

    public function cekKetersediaan(
        CekKetersediaanRequest $request
    ): JsonResponse {
        return response()->json(
            $this->bookingService->cekKetersediaan(
                $request->validated()
            )
        );
    }

    public function storeWalkIn(
        StoreWalkInRequest $request
    ): RedirectResponse {
        $sewa = $this->bookingService
            ->buatBookingWalkIn(
                $request->validated(),
                $request->user(),
                $request->ip()
            );

        return redirect()
            ->route('admin.booking.index')
            ->with(
                'success',
                'Booking walk-in berhasil dibuat dengan nomor ' .
                $sewa->nomor_booking .
                '.'
            );
    }
}
