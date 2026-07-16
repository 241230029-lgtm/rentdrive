<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifikasiIdentitasRequest extends FormRequest
{
    /**
     * Hanya pengguna dengan role admin yang boleh
     * memverifikasi identitas pelanggan.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Membersihkan data sebelum proses validasi.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'aksi' => strtolower(
                trim((string) $this->input('aksi'))
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
     * Aturan validasi persetujuan atau penolakan
     * identitas pelanggan.
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

            /*
             * Alasan wajib diisi apabila admin menolak
             * identitas pelanggan.
             */
            'alasan_penolakan' => [
                Rule::requiredIf(
                    $this->input('aksi') === 'tolak'
                ),
                'nullable',
                'string',
                'min:10',
                'max:1000',
            ],
        ];
    }

    /**
     * Pesan validasi dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'aksi.required' =>
                'Tindakan verifikasi harus dipilih.',

            'aksi.in' =>
                'Tindakan verifikasi tidak valid.',

            'alasan_penolakan.required' =>
                'Alasan penolakan wajib diisi ketika identitas ditolak.',

            'alasan_penolakan.string' =>
                'Alasan penolakan harus berupa teks.',

            'alasan_penolakan.min' =>
                'Alasan penolakan harus berisi minimal 10 karakter.',

            'alasan_penolakan.max' =>
                'Alasan penolakan tidak boleh lebih dari 1.000 karakter.',
        ];
    }

    /**
     * Nama atribut yang lebih mudah dipahami.
     */
    public function attributes(): array
    {
        return [
            'aksi' =>
                'tindakan verifikasi',

            'alasan_penolakan' =>
                'alasan penolakan identitas',
        ];
    }
}
