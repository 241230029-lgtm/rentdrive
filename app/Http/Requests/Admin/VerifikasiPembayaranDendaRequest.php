<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifikasiPembayaranDendaRequest extends FormRequest
{
    /**
     * Hanya administrator yang boleh memverifikasi denda.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Membersihkan data sebelum validasi.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'aksi' => strtolower(
                trim(
                    (string) $this->input('aksi')
                )
            ),

            'alasan_penolakan' => filled(
                $this->input('alasan_penolakan')
            )
                ? trim(
                    (string) $this->input(
                        'alasan_penolakan'
                    )
                )
                : null,
        ]);
    }

    /**
     * Aturan validasi.
     */
    public function rules(): array
    {
        return [
            'aksi' => [
                'required',
                Rule::in([
                    'setujui',
                    'tolak',
                ]),
            ],

            'alasan_penolakan' => [
                'nullable',
                'required_if:aksi,tolak',
                'string',
                'min:10',
                'max:1000',
            ],
        ];
    }

    /**
     * Pesan validasi Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'aksi.required' =>
                'Aksi verifikasi wajib dipilih.',

            'aksi.in' =>
                'Aksi verifikasi tidak valid.',

            'alasan_penolakan.required_if' =>
                'Alasan penolakan wajib diisi ketika pembayaran ditolak.',

            'alasan_penolakan.string' =>
                'Alasan penolakan harus berupa teks.',

            'alasan_penolakan.min' =>
                'Alasan penolakan minimal 10 karakter.',

            'alasan_penolakan.max' =>
                'Alasan penolakan maksimal 1.000 karakter.',
        ];
    }
}
