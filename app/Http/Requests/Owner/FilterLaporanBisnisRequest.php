<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;

class FilterLaporanBisnisRequest extends FormRequest
{
    /**
     * Hanya owner yang dapat membuka
     * dan memfilter laporan bisnis.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'owner';
    }

    /**
     * Aturan validasi filter laporan bisnis.
     */
    public function rules(): array
    {
        return [
            'tanggal_mulai' => [
                'nullable',
                'date',
            ],

            'tanggal_selesai' => [
                'nullable',
                'date',
                'after_or_equal:tanggal_mulai',
            ],

            'kategori_laporan' => [
                'required',
                'in:pendapatan,booking,kendaraan,pelanggan,denda,refund',
            ],
        ];
    }

    /**
     * Pesan validasi dalam bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'tanggal_mulai.date' =>
                'Tanggal mulai laporan tidak valid.',

            'tanggal_selesai.date' =>
                'Tanggal selesai laporan tidak valid.',

            'tanggal_selesai.after_or_equal' =>
                'Tanggal selesai tidak boleh sebelum tanggal mulai.',

            'kategori_laporan.required' =>
                'Kategori laporan wajib dipilih.',

            'kategori_laporan.in' =>
                'Kategori laporan tidak dikenali.',
        ];
    }

    /**
     * Nama atribut agar pesan lebih mudah dipahami.
     */
    public function attributes(): array
    {
        return [
            'tanggal_mulai' =>
                'tanggal mulai',

            'tanggal_selesai' =>
                'tanggal selesai',

            'kategori_laporan' =>
                'kategori laporan',
        ];
    }
}
