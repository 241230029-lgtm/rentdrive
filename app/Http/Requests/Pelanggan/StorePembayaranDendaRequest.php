<?php

namespace App\Http\Requests\Pelanggan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePembayaranDendaRequest extends FormRequest
{
    /**
     * Hanya pelanggan yang boleh mengirim pembayaran denda.
     */
    public function authorize(): bool
    {
        return $this->user()?->role ===
            'pelanggan';
    }

    /**
     * Membersihkan input sebelum validasi.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'metode_pembayaran_denda' =>
                strtolower(
                    trim(
                        (string) $this->input(
                            'metode_pembayaran_denda'
                        )
                    )
                ),
        ]);
    }

    /**
     * Validasi pembayaran denda.
     */
    public function rules(): array
    {
        return [
            'metode_pembayaran_denda' => [
                'required',
                Rule::in([
                    'transfer',
                ]),
            ],

            'bukti_pembayaran_denda' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],

            'persetujuan_pembayaran' => [
                'required',
                'accepted',
            ],
        ];
    }

    /**
     * Pesan validasi Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'metode_pembayaran_denda.required' =>
                'Metode pembayaran denda wajib dipilih.',

            'metode_pembayaran_denda.in' =>
                'Metode pembayaran denda tidak valid.',

            'bukti_pembayaran_denda.required' =>
                'Bukti pembayaran denda wajib diunggah.',

            'bukti_pembayaran_denda.file' =>
                'Bukti pembayaran harus berupa file.',

            'bukti_pembayaran_denda.image' =>
                'Bukti pembayaran harus berupa gambar.',

            'bukti_pembayaran_denda.mimes' =>
                'Format bukti pembayaran harus JPG, JPEG, PNG, atau WebP.',

            'bukti_pembayaran_denda.max' =>
                'Ukuran bukti pembayaran maksimal 3 MB.',

            'persetujuan_pembayaran.required' =>
                'Konfirmasi pembayaran wajib dicentang.',

            'persetujuan_pembayaran.accepted' =>
                'Anda harus memastikan bahwa data pembayaran sudah benar.',
        ];
    }

    /**
     * Nama atribut untuk pesan error.
     */
    public function attributes(): array
    {
        return [
            'metode_pembayaran_denda' =>
                'metode pembayaran',

            'bukti_pembayaran_denda' =>
                'bukti pembayaran denda',

            'persetujuan_pembayaran' =>
                'konfirmasi pembayaran',
        ];
    }
}
