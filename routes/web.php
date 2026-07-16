<?php

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoleRedirectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTE UTAMA
|--------------------------------------------------------------------------
|
| File ini menjadi pusat pemanggilan seluruh kelompok route:
|
| - Route publik
| - Route pelanggan
| - Route admin
| - Route owner
| - Route autentikasi
| - Route notifikasi
|
*/

/*
|--------------------------------------------------------------------------
| REDIRECT DASHBOARD BERDASARKAN ROLE
|--------------------------------------------------------------------------
|
| Pengguna yang membuka /dashboard akan diarahkan ke dashboard
| berdasarkan role akun yang sedang login.
|
*/

Route::middleware('auth')
    ->get(
        '/dashboard',
        RoleRedirectController::class
    )
    ->name('dashboard');

/*
|--------------------------------------------------------------------------
| NOTIFIKASI PENGGUNA
|--------------------------------------------------------------------------
|
| Route ini dapat digunakan oleh pelanggan, admin, dan owner.
| Setiap pengguna hanya dapat mengakses notifikasinya sendiri.
|
| URL:
| /notifikasi
|
| Nama route:
| notifikasi.*
|
*/

Route::middleware('auth')
    ->prefix('notifikasi')
    ->name('notifikasi.')
    ->group(function () {
        /*
         * Mengambil daftar notifikasi pengguna.
         */
        Route::get('/', [
            NotificationController::class,
            'index',
        ])->name('index');

        /*
         * Menandai semua notifikasi sebagai dibaca.
         *
         * Route ini ditempatkan sebelum route dengan parameter ID.
         */
        Route::post('/baca-semua', [
            NotificationController::class,
            'bacaSemua',
        ])->name('baca-semua');

        /*
         * Menandai satu notifikasi sebagai dibaca,
         * lalu membuka halaman tujuan notifikasi.
         */
        Route::post('/{id}/baca', [
            NotificationController::class,
            'baca',
        ])
            ->whereUuid('id')
            ->name('baca');
    });

/*
|--------------------------------------------------------------------------
| PEMANGGILAN FILE ROUTE
|--------------------------------------------------------------------------
*/

require __DIR__ . '/guest.php';
require __DIR__ . '/pelanggan.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/owner.php';
require __DIR__ . '/auth.php';
