<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\DeleteProfileRequest;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Menampilkan halaman profil pelanggan.
     */
    public function edit(
        Request $request
    ): Response {
        return Inertia::render(
            'Pelanggan/Edit',
            [
                'mustVerifyEmail' =>
                    false,

                'status' =>
                    session('status'),
            ]
        );
    }

    /**
     * Memperbarui nama dan email pelanggan.
     */
    public function update(
        ProfileUpdateRequest $request
    ): RedirectResponse {
        $user = $request->user();

        $user->fill(
            $request->validated()
        );

        if (
            $user->isDirty('email')
        ) {
            $user->email_verified_at =
                null;
        }

        $user->save();

        return Redirect::route(
            'pelanggan.profile.edit'
        )->with(
            'success',
            'Profil berhasil diperbarui.'
        );
    }

    /**
     * Menghapus akun pelanggan.
     */
    public function destroy(
        DeleteProfileRequest $request
    ): RedirectResponse {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request
            ->session()
            ->invalidate();

        $request
            ->session()
            ->regenerateToken();

        return Redirect::route(
            'landing_page'
        )->with(
            'success',
            'Akun berhasil dihapus.'
        );
    }
}
