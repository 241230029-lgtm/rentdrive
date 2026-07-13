<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CekKetersediaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

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
            ],

            'tanggal_selesai' => [
                'required',
                'date',
                'after:tanggal_mulai',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'kendaraan_id.required' =>
                'Kendaraan wajib dipilih.',

            'kendaraan_id.integer' =>
                'Data kendaraan tidak valid.',

            'kendaraan_id.exists' =>
                'Data kendaraan tidak ditemukan.',

            'tanggal_mulai.required' =>
                'Tanggal mulai wajib diisi.',

            'tanggal_mulai.date' =>
                'Tanggal mulai tidak valid.',

            'tanggal_selesai.required' =>
                'Tanggal selesai wajib diisi.',

            'tanggal_selesai.date' =>
                'Tanggal selesai tidak valid.',

            'tanggal_selesai.after' =>
                'Tanggal selesai harus setelah tanggal mulai.',
        ];
    }
}
