<?php

use App\Http\Controllers\RoleRedirectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTE UTAMA
|--------------------------------------------------------------------------
|
| File ini berfungsi sebagai pusat pemanggilan seluruh kelompok route:
|
| - Route publik
| - Route pelanggan
| - Route admin
| - Route owner
| - Route autentikasi
|
*/

/*
|--------------------------------------------------------------------------
| REDIRECT DASHBOARD BERDASARKAN ROLE
|--------------------------------------------------------------------------
|
| Pengguna yang membuka /dashboard akan diarahkan ke dashboard
| sesuai role akun yang sedang login.
|
| Controller:
| app/Http/Controllers/RoleRedirectController.php
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
| PEMANGGILAN FILE ROUTE
|--------------------------------------------------------------------------
*/

require __DIR__ . '/guest.php';
require __DIR__ . '/pelanggan.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/owner.php';
require __DIR__ . '/auth.php';
