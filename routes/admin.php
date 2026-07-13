<?php

use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\KendaraanController;
use App\Http\Controllers\Admin\LaporanOperasionalController;
use App\Http\Controllers\Admin\PembayaranController;
use App\Http\Controllers\Admin\PengembalianController;
use App\Http\Controllers\Admin\RiwayatTransaksiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTE ADMIN
|--------------------------------------------------------------------------
|
| Seluruh route pada file ini hanya dapat diakses oleh pengguna
| yang sudah login dan memiliki role admin.
|
| Prefix URL:
| /admin
|
| Prefix nama route:
| admin.
|
*/

Route::middleware([
    'auth',
    'role:admin',
])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        /*
        |--------------------------------------------------------------------------
        | DASHBOARD ADMIN
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | KELOLA BOOKING
        |--------------------------------------------------------------------------
        */

        Route::get('/booking', [
            BookingController::class,
            'index',
        ])->name('booking.index');

        /*
        |--------------------------------------------------------------------------
        | KONFIRMASI BOOKING ONLINE
        |--------------------------------------------------------------------------
        |
        | Admin dapat menyetujui atau menolak booking pelanggan.
        |
        */

        Route::post('/booking/konfirmasi/{id}', [
            BookingController::class,
            'konfirmasi',
        ])->name('booking.konfirmasi');

        /*
        |--------------------------------------------------------------------------
        | VERIFIKASI PEMBAYARAN
        |--------------------------------------------------------------------------
        |
        | Admin dapat menyetujui atau menolak bukti pembayaran.
        |
        */

        Route::post('/booking/verifikasi/{id}', [
            PembayaranController::class,
            'verifikasi',
        ])->name('booking.verifikasi');

        /*
        |--------------------------------------------------------------------------
        | CEK KETERSEDIAAN KENDARAAN
        |--------------------------------------------------------------------------
        */

        Route::get('/booking/cek-ketersediaan', [
            BookingController::class,
            'cekKetersediaan',
        ])->name('booking.cek-ketersediaan');

        /*
        |--------------------------------------------------------------------------
        | BOOKING WALK-IN
        |--------------------------------------------------------------------------
        */

        Route::post('/booking/walk-in', [
            BookingController::class,
            'storeWalkIn',
        ])->name('booking.walkin');

        /*
        |--------------------------------------------------------------------------
        | KELOLA KENDARAAN
        |--------------------------------------------------------------------------
        */

        Route::get('/kendaraan', [
            KendaraanController::class,
            'index',
        ])->name('kendaraan.index');

        Route::post('/kendaraan/simpan', [
            KendaraanController::class,
            'store',
        ])->name('kendaraan.simpan');

        Route::patch('/kendaraan/update/{id}', [
            KendaraanController::class,
            'update',
        ])->name('kendaraan.update');

        Route::delete('/kendaraan/hapus/{id}', [
            KendaraanController::class,
            'destroy',
        ])->name('kendaraan.hapus');

        /*
        |--------------------------------------------------------------------------
        | PENGEMBALIAN KENDARAAN
        |--------------------------------------------------------------------------
        */

        Route::get('/pengembalian', [
            PengembalianController::class,
            'index',
        ])->name('pengembalian.index');

        Route::post('/pengembalian/proses/{id}', [
            PengembalianController::class,
            'proses',
        ])->name('pengembalian.proses');

        /*
        |--------------------------------------------------------------------------
        | RIWAYAT TRANSAKSI
        |--------------------------------------------------------------------------
        */

        Route::get('/riwayat-transaksi', [
            RiwayatTransaksiController::class,
            'index',
        ])->name('riwayat.index');

        /*
        |--------------------------------------------------------------------------
        | LAPORAN OPERASIONAL
        |--------------------------------------------------------------------------
        */

        Route::get('/laporan', [
            LaporanOperasionalController::class,
            'index',
        ])->name('laporan');
    });
