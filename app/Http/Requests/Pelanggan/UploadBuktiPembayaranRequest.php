<?php

namespace App\Http\Requests\Pelanggan;

use Illuminate\Foundation\Http\FormRequest;

class UploadBuktiPembayaranRequest extends FormRequest
{
    /**
     * Hanya akun pelanggan yang boleh
     * mengunggah bukti pembayaran.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'pelanggan';
    }

    /**
     * Aturan validasi bukti pembayaran.
     */
    public function rules(): array
    {
        return [
            'bukti_pembayaran' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048',
            ],
        ];
    }

    /**
     * Pesan validasi dalam bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'bukti_pembayaran.required' =>
                'Bukti pembayaran wajib dipilih.',

            'bukti_pembayaran.image' =>
                'Bukti pembayaran harus berupa gambar.',

            'bukti_pembayaran.mimes' =>
                'Format yang diperbolehkan adalah JPG, JPEG, PNG, atau WebP.',

            'bukti_pembayaran.max' =>
                'Ukuran bukti pembayaran maksimal 2 MB.',
        ];
    }

    /**
     * Nama atribut yang lebih mudah dipahami.
     */
    public function attributes(): array
    {
        return [
            'bukti_pembayaran' =>
                'bukti pembayaran',
        ];
    }
}
