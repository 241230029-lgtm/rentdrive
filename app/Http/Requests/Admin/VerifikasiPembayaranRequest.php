<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class VerifikasiPembayaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

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

    public function messages(): array
    {
        return [
            'aksi.required' =>
                'Aksi verifikasi wajib dipilih.',

            'aksi.in' =>
                'Aksi verifikasi tidak dikenali.',

            'kategori_penolakan.required_if' =>
                'Kategori penolakan pembayaran wajib dipilih.',

            'kategori_penolakan.string' =>
                'Kategori penolakan harus berupa teks.',

            'kategori_penolakan.max' =>
                'Kategori penolakan maksimal 100 karakter.',

            'alasan_penolakan.required_if' =>
                'Keterangan penolakan pembayaran wajib diisi.',

            'alasan_penolakan.string' =>
                'Keterangan penolakan harus berupa teks.',

            'alasan_penolakan.max' =>
                'Keterangan penolakan maksimal 1.000 karakter.',
        ];
    }
}
