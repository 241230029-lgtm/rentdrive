<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Template Blade utama yang pertama kali dimuat.
     */
    protected $rootView = 'app';

    /**
     * Menentukan versi asset aplikasi.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Membagikan data global ke seluruh halaman Inertia.
     *
     * Data yang dibagikan:
     * - pengguna yang sedang login;
     * - notifikasi terbaru;
     * - jumlah notifikasi belum dibaca;
     * - flash message.
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        /*
         * Nilai awal digunakan ketika pengguna belum login.
         */
        $daftarNotifikasi = [];
        $jumlahBelumDibaca = 0;

        if ($user) {
            /*
             * Mengambil maksimal 10 notifikasi terbaru.
             *
             * Data ini tersedia pada seluruh halaman pelanggan,
             * admin, dan owner yang sudah login.
             */
            $daftarNotifikasi = $user
                ->notifications()
                ->latest()
                ->limit(10)
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

                            /*
                             * URL halaman yang berkaitan dengan
                             * isi notifikasi.
                             */
                            'url' => data_get(
                                $notification->data,
                                'url'
                            ),

                            /*
                             * Referensi transaksi yang berkaitan.
                             */
                            'sewa_id' => data_get(
                                $notification->data,
                                'sewa_id'
                            ),

                            'nomor_booking' => data_get(
                                $notification->data,
                                'nomor_booking'
                            ),

                            /*
                             * True berarti notifikasi telah dibaca.
                             */
                            'sudah_dibaca' =>
                                $notification->read_at !== null,

                            'dibaca_pada' =>
                                $notification->read_at
                                    ?->toIso8601String(),

                            'dibuat_pada' =>
                                $notification->created_at
                                    ?->toIso8601String(),
                        ];
                    }
                )
                ->values()
                ->all();

            /*
             * Badge notifikasi hanya menghitung notifikasi
             * yang belum dibaca oleh pengguna tersebut.
             */
            $jumlahBelumDibaca = $user
                ->unreadNotifications()
                ->count();
        }

        return [
            ...parent::share($request),

            /*
             * Informasi pengguna aktif.
             */
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ]
                    : null,
            ],

            /*
             * Data notifikasi global.
             *
             * Frontend dapat mengaksesnya melalui:
             *
             * usePage().props.notifikasi
             */
            'notifikasi' => [
                'terbaru' => $daftarNotifikasi,

                'jumlah_belum_dibaca' =>
                    $jumlahBelumDibaca,
            ],

            /*
             * Pesan sementara setelah suatu proses berhasil
             * atau gagal.
             */
            'flash' => [
                'success' => fn () =>
                    $request
                        ->session()
                        ->get('success'),

                'error' => fn () =>
                    $request
                        ->session()
                        ->get('error'),
            ],
        ];
    }
}
