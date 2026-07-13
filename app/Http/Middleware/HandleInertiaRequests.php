<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Template Blade utama yang pertama kali dimuat.
     */
    protected $rootView = 'app';

    /**
     * Menentukan versi asset.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Data global yang dapat digunakan seluruh halaman React.
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            'auth' => [
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'role' => $request->user()->role,
                    ]
                    : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
