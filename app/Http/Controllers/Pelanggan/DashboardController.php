<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard pelanggan.
     *
     * Halaman React yang digunakan tetap:
     * resources/js/Pages/Dashboard.jsx
     *
     * Lokasi halaman belum dipindahkan agar tampilan dan fungsi
     * yang sudah berjalan tidak mengalami perubahan.
     */
    public function index(): Response
    {
        return Inertia::render('Dashboard');
    }
}
