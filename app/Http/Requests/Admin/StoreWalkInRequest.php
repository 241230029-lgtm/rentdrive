<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWalkInRequest extends FormRequest
{
    /**
     * Hanya admin yang boleh membuat transaksi Walk-In.
     */
    public function authorize(): bool
    {
        return $this->user()?->role ===
            'admin';
    }

    /**
     * Membersihkan input sebelum validasi.
     */
    protected function prepareForValidation(): void
    {
        $nomorTelepon = preg_replace(
            '/[^0-9+]/',
            '',
            (string) $this->input(
                'no_telepon'
            )
        );

        if (
            str_starts_with(
                $nomorTelepon,
                '62'
            ) &&
            ! str_starts_with(
                $nomorTelepon,
                '+62'
            )
        ) {
            $nomorTelepon =
                '+' . $nomorTelepon;
        }

        $nik = preg_replace(
            '/[^0-9]/',
            '',
            (string) $this->input(
                'nik'
            )
        );

        $email = strtolower(
            trim(
                (string) $this->input(
                    'email'
                )
            )
        );

        $this->merge([
            'nama_pelanggan' =>
                trim(
                    (string) $this->input(
                        'nama_pelanggan'
                    )
                ),

            'email' =>
                $email !== ''
                    ? $email
                    : null,

            'no_telepon' =>
                $nomorTelepon,

            'alamat' =>
                trim(
                    (string) $this->input(
                        'alamat'
                    )
                ),

            'nik' =>
                $nik,

            'nomor_sim' =>
                strtoupper(
                    trim(
                        (string) $this->input(
                            'nomor_sim'
                        )
                    )
                ),

            'metode_pembayaran' =>
                strtolower(
                    trim(
                        (string) $this->input(
                            'metode_pembayaran'
                        )
                    )
                ),
        ]);
    }

    /**
     * Validasi transaksi Walk-In.
     */
    public function rules(): array
    {
        return [
            /*
             * Data pelanggan Walk-In.
             */
            'nama_pelanggan' => [
                'required',
                'string',
                'min:3',
                'max:150',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'no_telepon' => [
                'required',
                'string',
                'min:10',
                'max:20',
                'regex:/^(\+62|62|0)[0-9]{8,15}$/',
            ],

            'alamat' => [
                'required',
                'string',
                'min:10',
                'max:1000',
            ],

            /*
             * Identitas khusus transaksi Walk-In.
             */
            'nik' => [
                'required',
                'digits:16',
            ],

            'nomor_sim' => [
                'required',
                'string',
                'min:6',
                'max:50',
                'regex:/^[A-Z0-9\-\/\. ]+$/',
            ],

            'dokumen_ktp' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],

            'dokumen_sim' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],

            /*
             * Informasi penyewaan.
             */
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

            /*
             * Pembayaran langsung di tempat.
             */
            'metode_pembayaran' => [
                'required',
                Rule::in([
                    'cash',
                    'transfer',
                ]),
            ],
        ];
    }

    /**
     * Pesan validasi Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'nama_pelanggan.required' =>
                'Nama pelanggan wajib diisi.',

            'nama_pelanggan.min' =>
                'Nama pelanggan minimal 3 karakter.',

            'nama_pelanggan.max' =>
                'Nama pelanggan maksimal 150 karakter.',

            'email.email' =>
                'Format email pelanggan tidak valid.',

            'email.max' =>
                'Email maksimal 255 karakter.',

            'no_telepon.required' =>
                'Nomor telepon pelanggan wajib diisi.',

            'no_telepon.min' =>
                'Nomor telepon terlalu pendek.',

            'no_telepon.max' =>
                'Nomor telepon terlalu panjang.',

            'no_telepon.regex' =>
                'Format nomor telepon tidak valid. Gunakan format 08xxx atau +628xxx.',

            'alamat.required' =>
                'Alamat pelanggan wajib diisi.',

            'alamat.min' =>
                'Alamat minimal 10 karakter.',

            'alamat.max' =>
                'Alamat maksimal 1.000 karakter.',

            'nik.required' =>
                'NIK pelanggan wajib diisi.',

            'nik.digits' =>
                'NIK harus terdiri dari tepat 16 angka.',

            'nomor_sim.required' =>
                'Nomor SIM wajib diisi.',

            'nomor_sim.min' =>
                'Nomor SIM terlalu pendek.',

            'nomor_sim.max' =>
                'Nomor SIM terlalu panjang.',

            'nomor_sim.regex' =>
                'Format nomor SIM tidak valid.',

            'dokumen_ktp.required' =>
                'Foto KTP wajib diunggah.',

            'dokumen_ktp.file' =>
                'Dokumen KTP harus berupa file.',

            'dokumen_ktp.image' =>
                'Dokumen KTP harus berupa gambar.',

            'dokumen_ktp.mimes' =>
                'Format KTP harus JPG, JPEG, PNG, atau WebP.',

            'dokumen_ktp.max' =>
                'Ukuran foto KTP maksimal 3 MB.',

            'dokumen_sim.required' =>
                'Foto SIM wajib diunggah.',

            'dokumen_sim.file' =>
                'Dokumen SIM harus berupa file.',

            'dokumen_sim.image' =>
                'Dokumen SIM harus berupa gambar.',

            'dokumen_sim.mimes' =>
                'Format SIM harus JPG, JPEG, PNG, atau WebP.',

            'dokumen_sim.max' =>
                'Ukuran foto SIM maksimal 3 MB.',

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

            'tanggal_mulai.after_or_equal' =>
                'Tanggal mulai tidak boleh sebelum hari ini.',

            'tanggal_selesai.required' =>
                'Tanggal selesai wajib diisi.',

            'tanggal_selesai.date' =>
                'Tanggal selesai tidak valid.',

            'tanggal_selesai.after' =>
                'Tanggal selesai harus setelah tanggal mulai.',

            'metode_pembayaran.required' =>
                'Metode pembayaran wajib dipilih.',

            'metode_pembayaran.in' =>
                'Metode pembayaran hanya dapat berupa cash atau transfer.',
        ];
    }

    /**
     * Nama atribut yang lebih mudah dibaca.
     */
    public function attributes(): array
    {
        return [
            'nama_pelanggan' =>
                'nama pelanggan',

            'email' =>
                'email pelanggan',

            'no_telepon' =>
                'nomor telepon',

            'alamat' =>
                'alamat pelanggan',

            'nik' =>
                'NIK',

            'nomor_sim' =>
                'nomor SIM',

            'dokumen_ktp' =>
                'foto KTP',

            'dokumen_sim' =>
                'foto SIM',

            'kendaraan_id' =>
                'kendaraan',

            'tanggal_mulai' =>
                'tanggal mulai',

            'tanggal_selesai' =>
                'tanggal selesai',

            'metode_pembayaran' =>
                'metode pembayaran',
        ];
    }
}
