<?php

namespace App\Http\Requests\Pelanggan;

use App\Models\IdentitasSewa;
use App\Models\Sewa;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIdentitasRequest extends FormRequest
{
    private bool $identitasSudahDicari = false;

    private ?IdentitasSewa $identitasSaatIni = null;

    /**
     * Hanya pemilik booking dengan role pelanggan
     * yang boleh mengirim identitas transaksi.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        if (
            ! $user ||
            $user->role !== 'pelanggan'
        ) {
            return false;
        }

        $sewaId = (int) $this->route('id');

        return Sewa::query()
            ->whereKey($sewaId)
            ->where(
                'user_id',
                $user->id
            )
            ->exists();
    }

    /**
     * Membersihkan data sebelum validasi.
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
            (string) $this->input('nik')
        );

        $this->merge([
            'nama_pengguna' =>
                trim(
                    (string) $this->input(
                        'nama_pengguna'
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

            'no_telepon' =>
                $nomorTelepon,

            'alamat' =>
                trim(
                    (string) $this->input(
                        'alamat'
                    )
                ),
        ]);
    }

    /**
     * Validasi identitas khusus transaksi.
     */
    public function rules(): array
    {
        $identitas =
            $this->identitasTransaksi();

        return [
            'nama_pengguna' => [
                'required',
                'string',
                'min:3',
                'max:150',
            ],

            'nik' => [
                'nullable',
],

            'nomor_sim' => [
                     'nullable',
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
             * Pada booking baru, KTP dan SIM selalu wajib.
             *
             * Saat memperbaiki identitas pada booking yang
             * sama, file lama boleh dipertahankan apabila
             * hanya salah satu dokumen yang diganti.
             */
            'dokumen_ktp' => [
                Rule::requiredIf(
                    blank(
                        $identitas
                            ?->dokumen_ktp
                    )
                ),
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],

            'dokumen_sim' => [
                Rule::requiredIf(
                    blank(
                        $identitas
                            ?->dokumen_sim
                    )
                ),
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],

            'persetujuan_privasi' => [
                'required',
                'accepted',
            ],
        ];
    }

    /**
     * Pesan validasi Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'nama_pengguna.required' =>
                'Nama pengguna kendaraan wajib diisi.',

            'nama_pengguna.min' =>
                'Nama pengguna kendaraan minimal 3 karakter.',

            'nama_pengguna.max' =>
                'Nama pengguna kendaraan maksimal 150 karakter.',

            'nik.required' =>
                'NIK wajib diisi.',

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

            'no_telepon.required' =>
                'Nomor telepon pengguna kendaraan wajib diisi.',

            'no_telepon.min' =>
                'Nomor telepon terlalu pendek.',

            'no_telepon.max' =>
                'Nomor telepon terlalu panjang.',

            'no_telepon.regex' =>
                'Format nomor telepon tidak valid. Gunakan format 08xxx atau +628xxx.',

            'alamat.required' =>
                'Alamat pengguna kendaraan wajib diisi.',

            'alamat.min' =>
                'Alamat harus berisi minimal 10 karakter.',

            'alamat.max' =>
                'Alamat maksimal 1.000 karakter.',

            'dokumen_ktp.required' =>
                'Foto KTP wajib diunggah untuk booking ini.',

            'dokumen_ktp.file' =>
                'Dokumen KTP harus berupa file.',

            'dokumen_ktp.image' =>
                'Dokumen KTP harus berupa gambar.',

            'dokumen_ktp.mimes' =>
                'Format KTP harus JPG, JPEG, PNG, atau WebP.',

            'dokumen_ktp.max' =>
                'Ukuran foto KTP maksimal 3 MB.',

            'dokumen_sim.required' =>
                'Foto SIM wajib diunggah untuk booking ini.',

            'dokumen_sim.file' =>
                'Dokumen SIM harus berupa file.',

            'dokumen_sim.image' =>
                'Dokumen SIM harus berupa gambar.',

            'dokumen_sim.mimes' =>
                'Format SIM harus JPG, JPEG, PNG, atau WebP.',

            'dokumen_sim.max' =>
                'Ukuran foto SIM maksimal 3 MB.',

            'persetujuan_privasi.required' =>
                'Persetujuan penggunaan data wajib dicentang.',

            'persetujuan_privasi.accepted' =>
                'Anda harus menyetujui penggunaan data identitas untuk proses rental.',
        ];
    }

    /**
     * Nama atribut pada pesan error.
     */
    public function attributes(): array
    {
        return [
            'nama_pengguna' =>
                'nama pengguna kendaraan',

            'nik' =>
                'NIK',

            'nomor_sim' =>
                'nomor SIM',

            'no_telepon' =>
                'nomor telepon',

            'alamat' =>
                'alamat lengkap',

            'dokumen_ktp' =>
                'foto KTP',

            'dokumen_sim' =>
                'foto SIM',

            'persetujuan_privasi' =>
                'persetujuan penggunaan data',
        ];
    }

    /**
     * Mengambil identitas yang sudah tersimpan
     * pada booking yang sedang diperbaiki.
     */
    private function identitasTransaksi(): ?IdentitasSewa
    {
        if ($this->identitasSudahDicari) {
            return $this->identitasSaatIni;
        }

        $this->identitasSudahDicari = true;

        $sewaId = (int) $this->route('id');

        $this->identitasSaatIni =
            IdentitasSewa::query()
                ->where(
                    'sewa_id',
                    $sewaId
                )
                ->first();

        return $this->identitasSaatIni;
    }
}
