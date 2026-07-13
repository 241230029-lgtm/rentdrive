<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Menampilkan halaman pendaftaran pelanggan.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Menyimpan akun pelanggan baru.
     *
     * Pengguna tidak langsung login setelah mendaftar.
     * Setelah berhasil, pengguna kembali ke landing page
     * dan melakukan login secara manual.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'confirmed',
                Rules\Password::defaults(),
            ],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'pelanggan',
        ]);

        event(new Registered($user));

        /*
         * Jangan menggunakan Auth::login($user).
         * Pelanggan harus login secara manual setelah mendaftar.
         */
        return redirect()
            ->route('landing_page')
            ->with(
                'success',
                'Pendaftaran berhasil. Silakan masuk menggunakan akun yang baru dibuat.'
            );
    }
}
