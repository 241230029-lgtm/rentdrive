<?php

namespace App\Http\Requests\Pelanggan;

use Illuminate\Foundation\Http\FormRequest;

class DeleteProfileRequest extends FormRequest
{
    /**
     * Hanya pelanggan yang dapat menghapus
     * akun pelanggan miliknya sendiri.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'pelanggan';
    }

    /**
     * Penghapusan akun memerlukan konfirmasi
     * kata sandi yang sedang digunakan.
     */
    public function rules(): array
    {
        return [
            'password' => [
                'required',
                'current_password',
            ],
        ];
    }

    /**
     * Pesan validasi dalam bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'password.required' =>
                'Kata sandi wajib diisi.',

            'password.current_password' =>
                'Kata sandi yang dimasukkan tidak sesuai.',
        ];
    }

    public function attributes(): array
    {
        return [
            'password' =>
                'kata sandi',
        ];
    }
}
