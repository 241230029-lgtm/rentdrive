<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi pembayaran RentDrive
    |--------------------------------------------------------------------------
    |
    | Saat ini pembayaran masih berupa simulasi untuk kebutuhan pengembangan.
    | Nilai diambil dari file .env agar mudah diganti saat aplikasi masuk
    | tahap produksi.
    |
    */

    'payment' => [
        'is_demo' => true,

        'bank_name' => env(
            'RENTDRIVE_BANK_NAME',
            'BANK DEMO'
        ),

        'bank_account' => env(
            'RENTDRIVE_BANK_ACCOUNT',
            '1234567890'
        ),

        'bank_holder' => env(
            'RENTDRIVE_BANK_HOLDER',
            'RENTDRIVE DEMO'
        ),

        'deadline_hours' => (int) env(
            'RENTDRIVE_PAYMENT_DEADLINE_HOURS',
            24
        ),
    ],
];
