<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CekKetersediaanRequest extends FormRequest
{
    /**
     * Hanya admin yang boleh melihat stok internal.
     */
    public function authorize(): bool
    {
        return $this->user()?->role ===
            'admin';
    }

    /**
     * Validasi kendaraan dan rentang tanggal.
     */
    public function rules(): array
    {
        return [
            'kendaraan_id' => [
                'required',
                'integer',
                'exists:kendaraans,id',
            ],

            'tanggal_mulai' => [
                'required',
                'date',
                'after_or_equal:today',
            ],

            'tanggal_selesai' => [
                'required',
                'date',
                'after:tanggal_mulai',
            ],
        ];
    }

    /**
     * Pesan validasi Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'kendaraan_id.required' =>
                'Kendaraan wajib dipilih.',

            'kendaraan_id.integer' =>
                'Data kendaraan tidak valid.',

            'kendaraan_id.exists' =>
                'Kendaraan tidak ditemukan.',

            'tanggal_mulai.required' =>
                'Tanggal mulai wajib diisi.',

            'tanggal_mulai.date' =>
                'Tanggal mulai tidak valid.',

            'tanggal_mulai.after_or_equal' =>
                'Tanggal mulai tidak boleh sebelum hari ini.',

            'tanggal_selesai.required' =>
                'Tanggal selesai wajib diisi.',

            'tanggal_selesai.date' =>
                'Tanggal selesai tidak valid.',

            'tanggal_selesai.after' =>
                'Tanggal selesai harus setelah tanggal mulai.',
        ];
    }

    /**
     * Nama atribut untuk pesan validasi.
     */
    public function attributes(): array
    {
        return [
            'kendaraan_id' =>
                'kendaraan',

            'tanggal_mulai' =>
                'tanggal mulai',

            'tanggal_selesai' =>
                'tanggal selesai',
        ];
    }
}
