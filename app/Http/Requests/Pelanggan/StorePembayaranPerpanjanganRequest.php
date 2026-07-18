<?php

namespace App\Http\Requests\Pelanggan;

use App\Models\PerpanjanganSewa;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePembayaranPerpanjanganRequest extends FormRequest
{
    /**
     * Pelanggan hanya dapat membayar perpanjangan
     * dari transaksi miliknya sendiri.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        if (
            ! $user
            || $user->role !== 'pelanggan'
        ) {
            return false;
        }

        $perpanjanganId =
            (int) $this->route(
                'perpanjanganId'
            );

        return PerpanjanganSewa::query()
            ->where(
                'id',
                $perpanjanganId
            )
            ->whereHas(
                'sewa',
                function ($query) use (
                    $user
                ): void {
                    $query->where(
                        'user_id',
                        $user->id
                    );
                }
            )
            ->exists();
    }

    /**
     * Membersihkan metode pembayaran.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'metode_pembayaran' =>
                strtolower(
                    trim(
                        (string) $this->input(
                            'metode_pembayaran',
                            'transfer'
                        )
                    )
                ),
        ]);
    }

    /**
     * Validasi bukti pembayaran.
     */
    public function rules(): array
    {
        return [
            'metode_pembayaran' => [
                'required',
                Rule::in([
                    'transfer',
                ]),
            ],

            'bukti_pembayaran' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],
        ];
    }

    /**
     * Pesan validasi Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'metode_pembayaran.required' =>
                'Metode pembayaran wajib dipilih.',

            'metode_pembayaran.in' =>
                'Metode pembayaran tidak valid.',

            'bukti_pembayaran.required' =>
                'Bukti pembayaran wajib diunggah.',

            'bukti_pembayaran.file' =>
                'Bukti pembayaran harus berupa file.',

            'bukti_pembayaran.image' =>
                'Bukti pembayaran harus berupa gambar.',

            'bukti_pembayaran.mimes' =>
                'Format bukti pembayaran harus JPG, JPEG, PNG, atau WEBP.',

            'bukti_pembayaran.max' =>
                'Ukuran bukti pembayaran maksimal 3 MB.',
        ];
    }

    /**
     * Nama atribut untuk pesan validasi.
     */
    public function attributes(): array
    {
        return [
            'metode_pembayaran' =>
                'metode pembayaran',

            'bukti_pembayaran' =>
                'bukti pembayaran',
        ];
    }
}
