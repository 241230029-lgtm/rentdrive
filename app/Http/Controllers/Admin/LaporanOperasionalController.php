<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LaporanOperasionalController extends Controller
{
    /**
     * Menampilkan halaman laporan operasional admin.
     */
    public function index(): Response
    {
        return Inertia::render(
            'Admin/LaporanOperasional'
        );
    }
}
