<?php

use App\Http\Controllers\Guest\LandingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTE PUBLIK / GUEST
|--------------------------------------------------------------------------
|
| File ini berisi halaman yang dapat diakses tanpa login.
|
| Halaman publik RentDrive saat ini:
|
| - Landing page
| - Informasi kendaraan yang aman untuk calon pelanggan
| - Tombol login dan registrasi
|
| Informasi internal seperti jumlah unit, status kendaraan,
| dan plat nomor tidak dikirimkan kepada pengunjung.
|
*/

/*
|--------------------------------------------------------------------------
| LANDING PAGE
|--------------------------------------------------------------------------
|
| Controller:
| app/Http/Controllers/Guest/LandingController.php
|
| Halaman React:
| resources/js/Pages/HalamanUtama.jsx
|
| URL dan nama route tetap dipertahankan.
|
*/

Route::get('/', [
    LandingController::class,
    'index',
])->name('landing_page');
