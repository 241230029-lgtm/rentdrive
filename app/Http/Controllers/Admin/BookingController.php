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
    /**
     * BookingService menangani seluruh logika bisnis
     * pembuatan dan persetujuan booking.
     */
    public function __construct(
        private readonly BookingService $bookingService
    ) {
    }

    /**
     * Menampilkan halaman pengelolaan booking admin.
     *
     * Admin diperbolehkan melihat data operasional seperti
     * jumlah unit, plat nomor, dan status kendaraan.
     */
    public function index(): Response
    {
        $bookings = Sewa::query()
            ->with([
                'user:id,name,email,no_telepon,status_identitas',
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
                'updated_at',
            ])
            ->map(function (Sewa $booking): array {
                return [
                    'id' =>
                        $booking->id,

                    'nomor_booking' =>
                        $booking->nomor_booking,

                    'jenis_booking' =>
                        $booking->jenis_booking,

                    /*
                     * Tanggal dinormalisasi menjadi YYYY-MM-DD
                     * agar aman dibaca oleh React.
                     */
                    'tanggal_mulai' =>
                        $booking->tanggal_mulai
                            ?->format('Y-m-d'),

                    'tanggal_selesai' =>
                        $booking->tanggal_selesai
                            ?->format('Y-m-d'),

                    'total_harga' =>
                        (int) $booking->total_harga,

                    'bukti_pembayaran' =>
                        $booking->bukti_pembayaran,

                    'alasan_penolakan' =>
                        $booking->alasan_penolakan,

                    'jenis_penolakan' =>
                        $booking->jenis_penolakan,

                    'kategori_penolakan' =>
                        $booking->kategori_penolakan,

                    'ditolak_oleh' =>
                        $booking->ditolak_oleh,

                    'ditolak_pada' =>
                        $booking->ditolak_pada
                            ?->toIso8601String(),

                    'status' =>
                        $booking->status,

                    'created_at' =>
                        $booking->created_at
                            ?->toIso8601String(),

                    'updated_at' =>
                        $booking->updated_at
                            ?->toIso8601String(),

                    /*
                     * Data pelanggan yang diperlukan admin
                     * untuk memproses booking.
                     *
                     * Path KTP dan SIM tidak dikirim melalui
                     * halaman booking. Dokumen hanya dapat
                     * dibuka melalui halaman verifikasi identitas.
                     */
                    'user' =>
                        $booking->user
                            ? [
                                'id' =>
                                    $booking->user->id,

                                'name' =>
                                    $booking->user->name,

                                'email' =>
                                    $booking->user->email,

                                'no_telepon' =>
                                    $booking->user
                                        ->no_telepon,

                                'status_identitas' =>
                                    $booking->user
                                        ->status_identitas
                                    ?? 'belum_dilengkapi',
                            ]
                            : null,

                    /*
                     * Informasi kendaraan bersifat internal
                     * sehingga boleh terlihat oleh admin.
                     */
                    'kendaraan' =>
                        $booking->kendaraan
                            ? [
                                'id' =>
                                    $booking->kendaraan->id,

                                'nama_kendaraan' =>
                                    $booking->kendaraan
                                        ->nama_kendaraan,

                                'merek' =>
                                    $booking->kendaraan->merek,

                                'foto_kendaraan' =>
                                    $booking->kendaraan
                                        ->foto_kendaraan,

                                'jumlah_unit' =>
                                    (int) $booking->kendaraan
                                        ->jumlah_unit,

                                'status' =>
                                    $booking->kendaraan
                                        ->status,
                            ]
                            : null,
                ];
            })
            ->values();

        /*
         * Daftar pelanggan digunakan pada form booking walk-in.
         */
        $pelanggans = User::query()
            ->where('role', 'pelanggan')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'no_telepon',
                'status_identitas',
            ])
            ->map(function (User $pelanggan): array {
                return [
                    'id' =>
                        $pelanggan->id,

                    'name' =>
                        $pelanggan->name,

                    'email' =>
                        $pelanggan->email,

                    'no_telepon' =>
                        $pelanggan->no_telepon,

                    'status_identitas' =>
                        $pelanggan->status_identitas
                        ?? 'belum_dilengkapi',
                ];
            })
            ->values();

        /*
         * Data kendaraan lengkap hanya dikirim ke admin.
         * Pelanggan tidak pernah menerima jumlah unit
         * maupun plat nomor kendaraan.
         */
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
            ])
            ->map(function (Kendaraan $kendaraan): array {
                return [
                    'id' =>
                        $kendaraan->id,

                    'nama_kendaraan' =>
                        $kendaraan->nama_kendaraan,

                    'merek' =>
                        $kendaraan->merek,

                    'harga_per_hari' =>
                        (int) $kendaraan
                            ->harga_per_hari,

                    'jumlah_unit' =>
                        (int) $kendaraan
                            ->jumlah_unit,

                    'plat_nomor' =>
                        $kendaraan->plat_nomor,

                    'status' =>
                        $kendaraan->status,
                ];
            })
            ->values();

        return Inertia::render(
            'Admin/KelolaBooking',
            [
                'bookings' =>
                    $bookings,

                'pelanggans' =>
                    $pelanggans,

                'kendaraans' =>
                    $kendaraans,
            ]
        );
    }

    /**
     * Admin menyetujui atau menolak booking online.
     */
    public function konfirmasi(
        KonfirmasiBookingRequest $request,
        int $id
    ): RedirectResponse {
        $data = $request->validated();

        $this->bookingService
            ->konfirmasiBooking(
                $id,
                $data,
                $request->user(),
                $request->ip()
            );

        if ($data['aksi'] === 'tolak') {
            return back()->with(
                'success',
                'Booking berhasil ditolak dan pelanggan telah menerima notifikasi.'
            );
        }

        /*
         * Periksa status setelah booking disetujui.
         *
         * Pelanggan baru harus melengkapi identitas,
         * sedangkan pelanggan yang identitasnya sudah
         * terverifikasi dapat langsung membayar.
         */
        $booking = Sewa::query()
            ->findOrFail($id);

        $pesan = match ($booking->status) {
            'menunggu_identitas' =>
                'Booking berhasil disetujui. Pelanggan diminta melengkapi identitas sebelum pembayaran.',

            'menunggu_pembayaran' =>
                'Booking berhasil disetujui. Identitas pelanggan sudah terverifikasi dan pelanggan dapat melanjutkan pembayaran.',

            default =>
                'Booking berhasil disetujui dan tahap berikutnya telah diperbarui.',
        };

        return back()->with(
            'success',
            $pesan
        );
    }

    /**
     * Memeriksa ketersediaan kendaraan untuk kebutuhan admin.
     *
     * Respons memuat jumlah unit karena endpoint ini hanya
     * dapat diakses oleh admin.
     */
    public function cekKetersediaan(
        CekKetersediaanRequest $request
    ): JsonResponse {
        return response()->json(
            $this->bookingService
                ->cekKetersediaan(
                    $request->validated()
                )
        );
    }

    /**
     * Membuat booking walk-in dari halaman admin.
     */
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
                'Booking walk-in berhasil dibuat dengan nomor '
                . $sewa->nomor_booking
                . '.'
            );
    }
}
