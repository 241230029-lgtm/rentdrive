<?php

namespace App\Http\Requests\Pelanggan;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Pengguna hanya boleh mengirim booking apabila
     * sudah login dan memiliki role pelanggan.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'pelanggan';
    }

    /**
     * Aturan validasi pengajuan booking online.
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
     * Pesan validasi dalam bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'kendaraan_id.required' =>
                'Kendaraan belum dipilih.',

            'kendaraan_id.integer' =>
                'Data kendaraan tidak valid.',

            'kendaraan_id.exists' =>
                'Data kendaraan tidak ditemukan.',

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
     * Nama atribut yang lebih mudah dipahami.
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
