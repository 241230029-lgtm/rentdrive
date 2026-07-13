<?php

use App\Http\Controllers\Pelanggan\BookingController;
use App\Http\Controllers\Pelanggan\DashboardController;
use App\Http\Controllers\Pelanggan\KatalogController;
use App\Http\Controllers\Pelanggan\PembayaranController;
use App\Http\Controllers\Pelanggan\ProfileController;
use App\Http\Controllers\Pelanggan\RiwayatSewaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTE PELANGGAN
|--------------------------------------------------------------------------
|
| Seluruh route pada file ini hanya dapat diakses oleh pengguna yang:
|
| 1. Sudah login
| 2. Memiliki role pelanggan
|
| Prefix URL:
| /pelanggan
|
| Prefix nama route:
| pelanggan.
|
*/

Route::middleware([
    'auth',
    'role:pelanggan',
])
    ->prefix('pelanggan')
    ->name('pelanggan.')
    ->group(function () {
        /*
        |--------------------------------------------------------------------------
        | DASHBOARD PELANGGAN
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | KATALOG KENDARAAN
        |--------------------------------------------------------------------------
        */

        Route::get('/katalog', [
            KatalogController::class,
            'index',
        ])->name('katalog');

        /*
        |--------------------------------------------------------------------------
        | RIWAYAT SEWA
        |--------------------------------------------------------------------------
        */

        Route::get('/riwayat', [
            RiwayatSewaController::class,
            'index',
        ])->name('riwayat');

        /*
        |--------------------------------------------------------------------------
        | PROFIL PELANGGAN
        |--------------------------------------------------------------------------
        |
        | Controller:
        | app/Http/Controllers/Pelanggan/ProfileController.php
        |
        */

        Route::get('/profil', [
            ProfileController::class,
            'edit',
        ])->name('profile.edit');

        Route::patch('/profil', [
            ProfileController::class,
            'update',
        ])->name('profile.update');

        Route::delete('/profil', [
            ProfileController::class,
            'destroy',
        ])->name('profile.destroy');

        /*
        |--------------------------------------------------------------------------
        | BOOKING ONLINE
        |--------------------------------------------------------------------------
        */

        Route::post('/sewa', [
            BookingController::class,
            'store',
        ])->name('sewa.simpan');

        /*
        |--------------------------------------------------------------------------
        | UNGGAH BUKTI PEMBAYARAN
        |--------------------------------------------------------------------------
        */

        Route::post('/sewa/pembayaran/{id}', [
            PembayaranController::class,
            'store',
        ])->name('sewa.pembayaran.unggah');
    });
