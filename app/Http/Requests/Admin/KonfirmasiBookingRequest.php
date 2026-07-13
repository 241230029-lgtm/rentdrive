<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class KonfirmasiBookingRequest extends FormRequest
{
    /**
     * Hanya pengguna dengan role admin yang dapat
     * menyetujui atau menolak pengajuan booking.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Aturan validasi konfirmasi booking.
     */
    public function rules(): array
    {
        return [
            'aksi' => [
                'required',
                'in:setujui,tolak',
            ],

            'kategori_penolakan' => [
                'nullable',
                'required_if:aksi,tolak',
                'string',
                'max:100',
            ],

            'alasan_penolakan' => [
                'nullable',
                'required_if:aksi,tolak',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Pesan validasi dalam bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'aksi.required' =>
                'Aksi konfirmasi wajib dipilih.',

            'aksi.in' =>
                'Aksi konfirmasi tidak dikenali.',

            'kategori_penolakan.required_if' =>
                'Kategori penolakan wajib dipilih.',

            'kategori_penolakan.string' =>
                'Kategori penolakan harus berupa teks.',

            'kategori_penolakan.max' =>
                'Kategori penolakan maksimal 100 karakter.',

            'alasan_penolakan.required_if' =>
                'Keterangan penolakan wajib diisi.',

            'alasan_penolakan.string' =>
                'Keterangan penolakan harus berupa teks.',

            'alasan_penolakan.max' =>
                'Keterangan penolakan maksimal 1.000 karakter.',
        ];
    }

    /**
     * Nama atribut agar pesan validasi lebih mudah dipahami.
     */
    public function attributes(): array
    {
        return [
            'aksi' =>
                'aksi konfirmasi',

            'kategori_penolakan' =>
                'kategori penolakan',

            'alasan_penolakan' =>
                'keterangan penolakan',
        ];
    }
}
