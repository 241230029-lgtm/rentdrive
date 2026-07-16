<?php

use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\IdentitasController;
use App\Http\Controllers\Admin\KendaraanController;
use App\Http\Controllers\Admin\KetersediaanController;
use App\Http\Controllers\Admin\LaporanOperasionalController;
use App\Http\Controllers\Admin\PembayaranController;
use App\Http\Controllers\Admin\PembayaranDendaController;
use App\Http\Controllers\Admin\PengembalianController;
use App\Http\Controllers\Admin\RiwayatTransaksiController;
use Illuminate\Support\Facades\Route;

Route::middleware([
    'auth',
    'role:admin',
])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
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

        Route::post('/booking/konfirmasi/{id}', [
            BookingController::class,
            'konfirmasi',
        ])
            ->whereNumber('id')
            ->name('booking.konfirmasi');

        Route::post('/booking/verifikasi/{id}', [
            PembayaranController::class,
            'verifikasi',
        ])
            ->whereNumber('id')
            ->name('booking.verifikasi');

        Route::post('/booking/walk-in', [
            BookingController::class,
            'storeWalkIn',
        ])->name('booking.walkin');

        /*
        |--------------------------------------------------------------------------
        | CEK KETERSEDIAAN STOK
        |--------------------------------------------------------------------------
        */

        Route::get('/ketersediaan', [
            KetersediaanController::class,
            'index',
        ])->name('ketersediaan.index');

        Route::get('/ketersediaan/periksa', [
            KetersediaanController::class,
            'periksa',
        ])->name('ketersediaan.periksa');

        /*
        |--------------------------------------------------------------------------
        | VERIFIKASI IDENTITAS
        |--------------------------------------------------------------------------
        */

        Route::get('/identitas', [
            IdentitasController::class,
            'index',
        ])->name('identitas.index');

        Route::get(
            '/identitas/{sewaId}/dokumen/{jenis}',
            [
                IdentitasController::class,
                'dokumen',
            ]
        )
            ->whereNumber('sewaId')
            ->whereIn(
                'jenis',
                [
                    'ktp',
                    'sim',
                ]
            )
            ->name('identitas.dokumen');

        Route::post(
            '/identitas/{sewaId}/verifikasi',
            [
                IdentitasController::class,
                'verifikasi',
            ]
        )
            ->whereNumber('sewaId')
            ->name('identitas.verifikasi');

        /*
        |--------------------------------------------------------------------------
        | VERIFIKASI PEMBAYARAN DENDA
        |--------------------------------------------------------------------------
        */

        Route::get('/denda', [
            PembayaranDendaController::class,
            'index',
        ])->name('denda.index');

        Route::get('/denda/{sewaId}/bukti', [
            PembayaranDendaController::class,
            'bukti',
        ])
            ->whereNumber('sewaId')
            ->name('denda.bukti');

        Route::post('/denda/{sewaId}/verifikasi', [
            PembayaranDendaController::class,
            'verifikasi',
        ])
            ->whereNumber('sewaId')
            ->name('denda.verifikasi');

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
        ])
            ->whereNumber('id')
            ->name('kendaraan.update');

        Route::delete('/kendaraan/hapus/{id}', [
            KendaraanController::class,
            'destroy',
        ])
            ->whereNumber('id')
            ->name('kendaraan.hapus');

        /*
        |--------------------------------------------------------------------------
        | PENGEMBALIAN
        |--------------------------------------------------------------------------
        */

        Route::get('/pengembalian', [
            PengembalianController::class,
            'index',
        ])->name('pengembalian.index');

        Route::post('/pengembalian/proses/{id}', [
            PengembalianController::class,
            'proses',
        ])
            ->whereNumber('id')
            ->name('pengembalian.proses');

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
