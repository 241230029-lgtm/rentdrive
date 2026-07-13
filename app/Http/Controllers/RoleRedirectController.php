<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RoleRedirectController extends Controller
{
    /**
     * Mengarahkan pengguna ke dashboard berdasarkan role akun.
     */
    public function __invoke(
        Request $request
    ): RedirectResponse {
        return match ($request->user()->role) {
            'pelanggan' => redirect()->route(
                'pelanggan.dashboard'
            ),

            'admin' => redirect()->route(
                'admin.dashboard'
            ),

            'owner' => redirect()->route(
                'owner.dashboard'
            ),

            default => abort(
                403,
                'Role akun tidak dikenali oleh sistem.'
            ),
        };
    }
}
