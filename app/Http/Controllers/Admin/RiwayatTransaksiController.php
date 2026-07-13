<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class RiwayatTransaksiController extends Controller
{
    /**
     * Menampilkan halaman riwayat transaksi admin.
     */
    public function index(): Response
    {
        return Inertia::render(
            'Admin/RiwayatTransaksi'
        );
    }
}
