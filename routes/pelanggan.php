<?php

use App\Http\Controllers\Pelanggan\BookingController;
use App\Http\Controllers\Pelanggan\DashboardController;
use App\Http\Controllers\Pelanggan\IdentitasController;
use App\Http\Controllers\Pelanggan\KatalogController;
use App\Http\Controllers\Pelanggan\PembayaranController;
use App\Http\Controllers\Pelanggan\PembayaranDendaController;
use App\Http\Controllers\Pelanggan\PerpanjanganSewaController;
use App\Http\Controllers\Pelanggan\ProfileController;
use App\Http\Controllers\Pelanggan\RiwayatSewaController;
use Illuminate\Support\Facades\Route;

Route::middleware([
    'auth',
    'role:pelanggan',
])
    ->prefix('pelanggan')
    ->name('pelanggan.')
    ->group(function (): void {
        /*
        |--------------------------------------------------------------------------
        | DASHBOARD
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | KATALOG
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
        | IDENTITAS PER TRANSAKSI
        |--------------------------------------------------------------------------
        */

        Route::get('/identitas/{id}', [
            IdentitasController::class,
            'show',
        ])
            ->whereNumber('id')
            ->name('identitas.show');

        Route::post('/identitas/{id}', [
            IdentitasController::class,
            'store',
        ])
            ->whereNumber('id')
            ->name('identitas.store');

        /*
        |--------------------------------------------------------------------------
        | PEMBAYARAN SEWA
        |--------------------------------------------------------------------------
        */

        Route::get('/pembayaran/{id}', [
            PembayaranController::class,
            'show',
        ])
            ->whereNumber('id')
            ->name('pembayaran.show');

        Route::post('/pembayaran/{id}', [
            PembayaranController::class,
            'store',
        ])
            ->whereNumber('id')
            ->name('sewa.pembayaran.unggah');

        /*
        |--------------------------------------------------------------------------
        | PERPANJANGAN RENTAL
        |--------------------------------------------------------------------------
        */

        Route::get('/perpanjangan/{id}', [
            PerpanjanganSewaController::class,
            'show',
        ])
            ->whereNumber('id')
            ->name('perpanjangan.show');

        Route::post('/perpanjangan/{id}', [
            PerpanjanganSewaController::class,
            'store',
        ])
            ->whereNumber('id')
            ->name('perpanjangan.store');

        /*
         * Pembayaran biaya tambahan perpanjangan.
         */
        Route::post(
            '/perpanjangan/{perpanjanganId}/pembayaran',
            [
                PerpanjanganSewaController::class,
                'storePembayaran',
            ]
        )
            ->whereNumber('perpanjanganId')
            ->name('perpanjangan.pembayaran');

        /*
         * Bukti pembayaran private.
         */
        Route::get(
            '/perpanjangan/{perpanjanganId}/bukti',
            [
                PerpanjanganSewaController::class,
                'buktiPembayaran',
            ]
        )
            ->whereNumber('perpanjanganId')
            ->name('perpanjangan.bukti');

        /*
        |--------------------------------------------------------------------------
        | PEMBAYARAN DENDA
        |--------------------------------------------------------------------------
        */

        Route::get('/denda/{id}', [
            PembayaranDendaController::class,
            'show',
        ])
            ->whereNumber('id')
            ->name('denda.show');

        Route::post('/denda/{id}', [
            PembayaranDendaController::class,
            'store',
        ])
            ->whereNumber('id')
            ->name('denda.store');

        Route::get('/denda/{id}/bukti', [
            PembayaranDendaController::class,
            'bukti',
        ])
            ->whereNumber('id')
            ->name('denda.bukti');

        /*
        |--------------------------------------------------------------------------
        | PROFIL
        |--------------------------------------------------------------------------
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
    });
