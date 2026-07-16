<?php

use App\Http\Controllers\Owner\DashboardController;
use App\Http\Controllers\Owner\LaporanBisnisController;
use Illuminate\Support\Facades\Route;

Route::middleware([
    'auth',
    'role:owner',
])
    ->prefix('owner')
    ->name('owner.')
    ->group(function (): void {
        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');

        Route::get('/laporan-bisnis', [
            LaporanBisnisController::class,
            'index',
        ])->name('laporan_bisnis');
    });
