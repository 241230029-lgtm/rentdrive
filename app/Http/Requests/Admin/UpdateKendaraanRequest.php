<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKendaraanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nama_kendaraan' => trim(
                (string) $this->input('nama_kendaraan')
            ),

            'merek' => trim(
                (string) $this->input('merek')
            ),

            'warna' => trim(
                (string) $this->input('warna')
            ),

            'plat_nomor' => strtoupper(
                trim((string) $this->input('plat_nomor'))
            ),

            'fasilitas' => $this->filled('fasilitas')
                ? trim((string) $this->input('fasilitas'))
                : null,

            'deskripsi_kendaraan' =>
                $this->filled('deskripsi_kendaraan')
                    ? trim(
                        (string) $this->input(
                            'deskripsi_kendaraan'
                        )
                    )
                    : null,
        ]);
    }

    public function rules(): array
    {
        $kendaraanId = (int) $this->route('id');

        return [
            'nama_kendaraan' => [
                'required',
                'string',
                'max:150',
            ],

            'merek' => [
                'required',
                'string',
                'max:100',
            ],

            'warna' => [
                'required',
                'string',
                'max:100',
            ],

            'tahun_pembuatan' => [
                'required',
                'integer',
                'digits:4',
                'min:1900',
                'max:' . (now()->year + 1),
            ],

            'transmisi' => [
                'required',
                'in:manual,otomatis',
            ],

            'kapasitas_penumpang' => [
                'required',
                'integer',
                'min:1',
                'max:100',
            ],

            'harga_per_hari' => [
                'required',
                'integer',
                'min:1',
                'max:2000000000',
            ],

            'jumlah_unit' => [
                'required',
                'integer',
                'min:1',
                'max:1000',
            ],

            'plat_nomor' => [
                'required',
                'string',
                'max:30',
                Rule::unique(
                    'kendaraans',
                    'plat_nomor'
                )->ignore($kendaraanId),
            ],

            'status' => [
                'required',
                'in:tersedia,perbaikan,tidak_aktif',
            ],

            'foto_kendaraan' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],

            'fasilitas' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'deskripsi_kendaraan' => [
                'nullable',
                'string',
                'max:10000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_kendaraan.required' =>
                'Nama kendaraan wajib diisi.',

            'merek.required' =>
                'Merek kendaraan wajib diisi.',

            'warna.required' =>
                'Warna kendaraan wajib diisi.',

            'tahun_pembuatan.required' =>
                'Tahun pembuatan wajib diisi.',

            'tahun_pembuatan.digits' =>
                'Tahun pembuatan harus terdiri dari empat angka.',

            'tahun_pembuatan.max' =>
                'Tahun pembuatan tidak valid.',

            'transmisi.required' =>
                'Jenis transmisi wajib dipilih.',

            'transmisi.in' =>
                'Jenis transmisi tidak dikenali.',

            'kapasitas_penumpang.required' =>
                'Kapasitas penumpang wajib diisi.',

            'harga_per_hari.required' =>
                'Harga sewa per hari wajib diisi.',

            'jumlah_unit.required' =>
                'Jumlah unit wajib diisi.',

            'jumlah_unit.min' =>
                'Jumlah unit minimal satu.',

            'plat_nomor.required' =>
                'Plat nomor wajib diisi.',

            'plat_nomor.unique' =>
                'Plat nomor tersebut sudah digunakan.',

            'status.required' =>
                'Status kendaraan wajib dipilih.',

            'status.in' =>
                'Status kendaraan tidak dikenali.',

            'foto_kendaraan.image' =>
                'Foto kendaraan harus berupa gambar.',

            'foto_kendaraan.mimes' =>
                'Foto kendaraan harus berformat JPG, JPEG, PNG, atau WEBP.',

            'foto_kendaraan.max' =>
                'Ukuran foto kendaraan maksimal 3 MB.',
        ];
    }
}
