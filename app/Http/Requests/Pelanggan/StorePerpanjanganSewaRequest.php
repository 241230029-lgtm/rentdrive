<?php

namespace App\Http\Requests\Pelanggan;

use App\Models\Sewa;
use Illuminate\Foundation\Http\FormRequest;

class StorePerpanjanganSewaRequest extends FormRequest
{
    /**
     * Pelanggan hanya dapat mengajukan perpanjangan
     * untuk transaksi miliknya sendiri.
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

        $sewaId = (int) $this->route('id');

        return Sewa::query()
            ->where('id', $sewaId)
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Membersihkan data sebelum proses validasi.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'tanggal_selesai_baru' => filled(
                $this->input('tanggal_selesai_baru')
            )
                ? trim(
                    (string) $this->input(
                        'tanggal_selesai_baru'
                    )
                )
                : null,

            'alasan_pengajuan' => filled(
                $this->input('alasan_pengajuan')
            )
                ? trim(
                    (string) $this->input(
                        'alasan_pengajuan'
                    )
                )
                : null,
        ]);
    }

    /**
     * Aturan validasi dasar.
     *
     * Pemeriksaan tanggal terhadap tanggal selesai
     * transaksi dilakukan kembali pada service.
     */
    public function rules(): array
    {
        return [
            'tanggal_selesai_baru' => [
                'required',
                'date',
                'after:today',
            ],

            'alasan_pengajuan' => [
                'required',
                'string',
                'min:10',
                'max:500',
            ],
        ];
    }

    /**
     * Pesan validasi Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'tanggal_selesai_baru.required' =>
                'Tanggal selesai baru wajib dipilih.',

            'tanggal_selesai_baru.date' =>
                'Tanggal selesai baru tidak valid.',

            'tanggal_selesai_baru.after' =>
                'Tanggal selesai baru harus setelah hari ini.',

            'alasan_pengajuan.required' =>
                'Alasan pengajuan perpanjangan wajib diisi.',

            'alasan_pengajuan.string' =>
                'Alasan pengajuan harus berupa teks.',

            'alasan_pengajuan.min' =>
                'Alasan pengajuan minimal 10 karakter.',

            'alasan_pengajuan.max' =>
                'Alasan pengajuan maksimal 500 karakter.',
        ];
    }

    /**
     * Nama atribut untuk pesan validasi.
     */
    public function attributes(): array
    {
        return [
            'tanggal_selesai_baru' =>
                'tanggal selesai baru',

            'alasan_pengajuan' =>
                'alasan pengajuan',
        ];
    }
}
