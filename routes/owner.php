<?php

use App\Http\Controllers\Owner\DashboardController;
use App\Http\Controllers\Owner\LaporanBisnisController;
use App\Http\Controllers\Owner\MonitoringAdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTE OWNER
|--------------------------------------------------------------------------
|
| Seluruh route pada file ini hanya dapat diakses oleh pengguna yang:
|
| 1. Sudah melakukan login
| 2. Memiliki role owner
|
| Prefix URL:
| /owner
|
| Prefix nama route:
| owner.
|
*/

Route::middleware([
    'auth',
    'role:owner',
])
    ->prefix('owner')
    ->name('owner.')
    ->group(function () {
        /*
        |--------------------------------------------------------------------------
        | DASHBOARD OWNER
        |--------------------------------------------------------------------------
        |
        | Controller:
        | app/Http/Controllers/Owner/DashboardController.php
        |
        | Menampilkan ringkasan pendapatan, transaksi, pelanggan,
        | kendaraan, tren pendapatan, kendaraan terlaris,
        | dan aktivitas admin terbaru.
        |
        */

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | LAPORAN BISNIS
        |--------------------------------------------------------------------------
        |
        | Controller:
        | app/Http/Controllers/Owner/LaporanBisnisController.php
        |
        | Menampilkan laporan berdasarkan periode dan kategori
        | yang dipilih oleh owner.
        |
        */

        Route::get('/laporan-bisnis', [
            LaporanBisnisController::class,
            'index',
        ])->name('laporan_bisnis');

        /*
        |--------------------------------------------------------------------------
        | MONITORING ADMIN
        |--------------------------------------------------------------------------
        |
        | Controller:
        | app/Http/Controllers/Owner/MonitoringAdminController.php
        |
        | Menampilkan audit trail aktivitas admin yang tercatat
        | dalam tabel log aktivitas.
        |
        */

        Route::get('/monitoring-admin', [
            MonitoringAdminController::class,
            'index',
        ])->name('monitoring_admin');
    });
