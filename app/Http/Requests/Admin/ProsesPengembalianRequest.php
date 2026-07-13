<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProsesPengembalianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'tanggal_kembali_aktual' => [
                'required',
                'date',
            ],

            'kondisi_kendaraan_kembali' => [
                'required',
                'string',
                'max:3000',
            ],

            'foto_kondisi_kembali' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048',
            ],

            'kilometer_kembali' => [
                'required',
                'integer',
                'min:0',
            ],

            'denda_kerusakan' => [
                'required',
                'integer',
                'min:0',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'tanggal_kembali_aktual.required' =>
                'Tanggal pengembalian wajib diisi.',

            'tanggal_kembali_aktual.date' =>
                'Tanggal pengembalian tidak valid.',

            'kondisi_kendaraan_kembali.required' =>
                'Kondisi kendaraan wajib diisi.',

            'kondisi_kendaraan_kembali.string' =>
                'Kondisi kendaraan harus berupa teks.',

            'kondisi_kendaraan_kembali.max' =>
                'Keterangan kondisi kendaraan maksimal 3.000 karakter.',

            'foto_kondisi_kembali.image' =>
                'Foto kondisi kendaraan harus berupa gambar.',

            'foto_kondisi_kembali.mimes' =>
                'Format foto harus JPG, JPEG, PNG, atau WebP.',

            'foto_kondisi_kembali.max' =>
                'Ukuran foto maksimal 2 MB.',

            'kilometer_kembali.required' =>
                'Kilometer kendaraan wajib diisi.',

            'kilometer_kembali.integer' =>
                'Kilometer kendaraan harus berupa angka.',

            'kilometer_kembali.min' =>
                'Kilometer kendaraan tidak boleh negatif.',

            'denda_kerusakan.required' =>
                'Denda kerusakan wajib diisi. Masukkan 0 jika tidak ada denda.',

            'denda_kerusakan.integer' =>
                'Denda kerusakan harus berupa angka.',

            'denda_kerusakan.min' =>
                'Denda kerusakan tidak boleh negatif.',
        ];
    }
}
