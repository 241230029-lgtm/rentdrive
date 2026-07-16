<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Mengambil maksimal 20 notifikasi terbaru milik
     * pengguna yang sedang login.
     */
    public function index(Request $request): JsonResponse
    {
        $notifikasi = $request->user()
            ->notifications()
            ->latest()
            ->limit(20)
            ->get()
            ->map(
                function (
                    DatabaseNotification $notification
                ): array {
                    return [
                        'id' => $notification->id,

                        'judul' => data_get(
                            $notification->data,
                            'judul',
                            'Notifikasi'
                        ),

                        'pesan' => data_get(
                            $notification->data,
                            'pesan',
                            ''
                        ),

                        'jenis' => data_get(
                            $notification->data,
                            'jenis',
                            'informasi'
                        ),

                        'url' => data_get(
                            $notification->data,
                            'url'
                        ),

                        'sewa_id' => data_get(
                            $notification->data,
                            'sewa_id'
                        ),

                        'nomor_booking' => data_get(
                            $notification->data,
                            'nomor_booking'
                        ),

                        'sudah_dibaca' =>
                            $notification->read_at !== null,

                        'dibaca_pada' => $notification->read_at
                            ?->toIso8601String(),

                        'dibuat_pada' => $notification->created_at
                            ?->toIso8601String(),
                    ];
                }
            )
            ->values();

        return response()->json([
            'notifikasi' => $notifikasi,

            'jumlah_belum_dibaca' => $request->user()
                ->unreadNotifications()
                ->count(),
        ]);
    }

    /**
     * Menandai satu notifikasi sebagai sudah dibaca,
     * kemudian mengarahkan pengguna ke halaman terkait.
     */
    public function baca(
        Request $request,
        string $id
    ): RedirectResponse {
        /*
         * Pencarian dilakukan melalui relasi pengguna.
         * Artinya pengguna tidak dapat membaca notifikasi
         * yang dimiliki pengguna lain.
         */
        $notification = $request->user()
            ->notifications()
            ->whereKey($id)
            ->firstOrFail();

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        $urlTujuan = data_get(
            $notification->data,
            'url'
        );

        return redirect()->to(
            $this->buatUrlTujuanAman(
                $request,
                is_string($urlTujuan)
                    ? $urlTujuan
                    : null
            )
        );
    }

    /**
     * Menandai seluruh notifikasi pengguna sebagai dibaca.
     */
    public function bacaSemua(
        Request $request
    ): RedirectResponse {
        $request->user()
            ->unreadNotifications()
            ->update([
                'read_at' => now(),
            ]);

        return back()->with(
            'success',
            'Semua notifikasi telah ditandai sebagai dibaca.'
        );
    }

    /**
     * Memastikan URL tujuan notifikasi hanya mengarah
     * ke halaman internal aplikasi RentDrive.
     */
    private function buatUrlTujuanAman(
        Request $request,
        ?string $urlTujuan
    ): string {
        if (! $urlTujuan) {
            return route('dashboard');
        }

        /*
         * URL relatif internal, misalnya:
         * /pelanggan/riwayat
         * /admin/booking
         */
        if (str_starts_with($urlTujuan, '/')) {
            return url($urlTujuan);
        }

        /*
         * URL lengkap hanya diterima apabila host-nya
         * sama dengan host aplikasi yang sedang dibuka.
         */
        $hostTujuan = parse_url(
            $urlTujuan,
            PHP_URL_HOST
        );

        if (
            is_string($hostTujuan) &&
            $hostTujuan === $request->getHost()
        ) {
            return $urlTujuan;
        }

        /*
         * Mencegah notifikasi mengarahkan pengguna
         * menuju website eksternal.
         */
        return route('dashboard');
    }
}
