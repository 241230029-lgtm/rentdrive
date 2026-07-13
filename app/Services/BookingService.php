<?php

namespace App\Services;

use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /**
     * Status transaksi yang masih menggunakan kuota kendaraan.
     */
    private const STATUS_MEMAKAI_KUOTA = [
        'menunggu_konfirmasi_admin',
        'menunggu_pembayaran',
        'menunggu_verifikasi_pembayaran',
        'ditolak_pembayaran',
        'disetujui_operasional',
        'sedang_berlangsung',
        'menunggu_verifikasi_pengembalian',
    ];

    /**
     * Membuat booking online pelanggan.
     */
    public function buatBookingOnline(
        array $data,
        User $pelanggan
    ): Sewa {
        return DB::transaction(function () use (
            $data,
            $pelanggan
        ) {
            $kendaraan = Kendaraan::query()
                ->lockForUpdate()
                ->findOrFail($data['kendaraan_id']);

            if (
                in_array(
                    $kendaraan->status,
                    [
                        'perbaikan',
                        'tidak_aktif',
                    ],
                    true
                )
            ) {
                throw ValidationException::withMessages([
                    'tanggal_mulai' =>
                        'Permintaan belum dapat diproses. Silakan pilih kendaraan atau jadwal lain.',
                ]);
            }

            $jumlahBentrok = $this->hitungBookingBentrok(
                $kendaraan->id,
                $data['tanggal_mulai'],
                $data['tanggal_selesai']
            );

            if (
                $jumlahBentrok >=
                (int) $kendaraan->jumlah_unit
            ) {
                throw ValidationException::withMessages([
                    'tanggal_mulai' =>
                        'Kendaraan tidak tersedia pada jadwal tersebut. Silakan pilih jadwal lain.',
                ]);
            }

            $totalHarga = $this->hitungTotalHarga(
                $kendaraan,
                $data['tanggal_mulai'],
                $data['tanggal_selesai']
            );

            return Sewa::create([
                'nomor_booking' =>
                    $this->buatNomorBooking('BK'),

                'user_id' =>
                    $pelanggan->id,

                'kendaraan_id' =>
                    $kendaraan->id,

                'jenis_booking' =>
                    'online',

                'tanggal_mulai' =>
                    $data['tanggal_mulai'],

                'tanggal_selesai' =>
                    $data['tanggal_selesai'],

                'total_harga' =>
                    $totalHarga,

                'status' =>
                    'menunggu_konfirmasi_admin',
            ]);
        });
    }

    /**
     * Admin menyetujui atau menolak booking online.
     */
    public function konfirmasiBooking(
        int $sewaId,
        array $data,
        User $admin,
        string $alamatIp
    ): void {
        DB::transaction(function () use (
            $sewaId,
            $data,
            $admin,
            $alamatIp
        ) {
            $sewa = Sewa::query()
                ->with([
                    'user',
                    'kendaraan',
                ])
                ->lockForUpdate()
                ->findOrFail($sewaId);

            if (
                $sewa->status !==
                'menunggu_konfirmasi_admin'
            ) {
                throw ValidationException::withMessages([
                    'aksi' =>
                        'Booking ini sudah pernah diproses.',
                ]);
            }

            if ($data['aksi'] === 'setujui') {
                $kendaraan = Kendaraan::query()
                    ->lockForUpdate()
                    ->findOrFail($sewa->kendaraan_id);

                if (
                    in_array(
                        $kendaraan->status,
                        [
                            'perbaikan',
                            'tidak_aktif',
                        ],
                        true
                    )
                ) {
                    throw ValidationException::withMessages([
                        'aksi' =>
                            'Booking tidak dapat disetujui karena kendaraan sedang tidak aktif atau menjalani perbaikan.',
                    ]);
                }

                $tanggalMulai = Carbon::parse(
                    $sewa->tanggal_mulai
                )->toDateString();

                $tanggalSelesai = Carbon::parse(
                    $sewa->tanggal_selesai
                )->toDateString();

                $jumlahBentrok = $this->hitungBookingBentrok(
                    $kendaraan->id,
                    $tanggalMulai,
                    $tanggalSelesai,
                    $sewa->id
                );

                if (
                    $jumlahBentrok >=
                    (int) $kendaraan->jumlah_unit
                ) {
                    throw ValidationException::withMessages([
                        'aksi' =>
                            'Booking tidak dapat disetujui karena seluruh unit telah digunakan pada jadwal tersebut.',
                    ]);
                }

                $sewa->update([
                    'status' =>
                        'menunggu_pembayaran',

                    'alasan_penolakan' =>
                        null,

                    'jenis_penolakan' =>
                        null,

                    'kategori_penolakan' =>
                        null,

                    'ditolak_oleh' =>
                        null,

                    'ditolak_pada' =>
                        null,
                ]);

                LogAktivitas::create([
                    'user_id' =>
                        $admin->id,

                    'jenis_aktivitas' =>
                        'Persetujuan Booking',

                    'deskripsi' =>
                        'Admin menyetujui booking ' .
                        $sewa->nomor_booking .
                        ' milik pelanggan ' .
                        $sewa->user->name .
                        '.',

                    'alamat_ip' =>
                        $alamatIp,
                ]);

                return;
            }

            $sewa->update([
                'status' =>
                    'ditolak_booking',

                'jenis_penolakan' =>
                    'booking',

                'kategori_penolakan' =>
                    $data['kategori_penolakan'],

                'alasan_penolakan' =>
                    $data['alasan_penolakan'],

                'ditolak_oleh' =>
                    $admin->id,

                'ditolak_pada' =>
                    now(),
            ]);

            LogAktivitas::create([
                'user_id' =>
                    $admin->id,

                'jenis_aktivitas' =>
                    'Penolakan Booking',

                'deskripsi' =>
                    'Admin menolak booking ' .
                    $sewa->nomor_booking .
                    '. Kategori: ' .
                    $data['kategori_penolakan'] .
                    '. Keterangan: ' .
                    $data['alasan_penolakan'],

                'alamat_ip' =>
                    $alamatIp,
            ]);
        });
    }

    /**
     * Admin membuat booking walk-in.
     */
    public function buatBookingWalkIn(
        array $data,
        User $admin,
        string $alamatIp
    ): Sewa {
        $pelanggan = User::query()
            ->where(
                'id',
                $data['pelanggan_id']
            )
            ->where(
                'role',
                'pelanggan'
            )
            ->first();

        if (! $pelanggan) {
            throw ValidationException::withMessages([
                'pelanggan_id' =>
                    'Akun yang dipilih bukan akun pelanggan.',
            ]);
        }

        return DB::transaction(function () use (
            $data,
            $admin,
            $alamatIp,
            $pelanggan
        ) {
            $kendaraan = Kendaraan::query()
                ->lockForUpdate()
                ->findOrFail($data['kendaraan_id']);

            if (
                in_array(
                    $kendaraan->status,
                    [
                        'perbaikan',
                        'tidak_aktif',
                    ],
                    true
                )
            ) {
                throw ValidationException::withMessages([
                    'kendaraan_id' =>
                        'Kendaraan sedang tidak aktif atau menjalani perbaikan.',
                ]);
            }

            $jumlahBentrok = $this->hitungBookingBentrok(
                $kendaraan->id,
                $data['tanggal_mulai'],
                $data['tanggal_selesai']
            );

            if (
                $jumlahBentrok >=
                (int) $kendaraan->jumlah_unit
            ) {
                throw ValidationException::withMessages([
                    'tanggal_mulai' =>
                        'Seluruh unit kendaraan telah digunakan pada jadwal tersebut.',
                ]);
            }

            $totalHarga = $this->hitungTotalHarga(
                $kendaraan,
                $data['tanggal_mulai'],
                $data['tanggal_selesai']
            );

            $sewa = Sewa::create([
                'nomor_booking' =>
                    $this->buatNomorBooking('WI'),

                'user_id' =>
                    $pelanggan->id,

                'kendaraan_id' =>
                    $kendaraan->id,

                'jenis_booking' =>
                    'walk_in',

                'tanggal_mulai' =>
                    $data['tanggal_mulai'],

                'tanggal_selesai' =>
                    $data['tanggal_selesai'],

                'total_harga' =>
                    $totalHarga,

                'bukti_pembayaran' =>
                    'WALK_IN_CASH',

                'status' =>
                    'disetujui_operasional',
            ]);

            LogAktivitas::create([
                'user_id' =>
                    $admin->id,

                'jenis_aktivitas' =>
                    'Input Booking Walk-In',

                'deskripsi' =>
                    'Admin membuat booking walk-in ' .
                    $sewa->nomor_booking .
                    ' untuk pelanggan ' .
                    $pelanggan->name .
                    ' menggunakan kendaraan ' .
                    $kendaraan->nama_kendaraan .
                    '.',

                'alamat_ip' =>
                    $alamatIp,
            ]);

            return $sewa;
        });
    }

    /**
     * Mengambil informasi ketersediaan kendaraan.
     */
    public function cekKetersediaan(
        array $data
    ): array {
        $kendaraan = Kendaraan::query()
            ->findOrFail($data['kendaraan_id']);

        $unitTerpakai = $this->hitungBookingBentrok(
            $kendaraan->id,
            $data['tanggal_mulai'],
            $data['tanggal_selesai']
        );

        $statusAktif =
            $kendaraan->status === 'tersedia';

        $unitTersedia = $statusAktif
            ? max(
                0,
                (int) $kendaraan->jumlah_unit -
                $unitTerpakai
            )
            : 0;

        $pesan = match ($kendaraan->status) {
            'perbaikan' =>
                'Kendaraan sedang menjalani perbaikan.',

            'tidak_aktif' =>
                'Kendaraan sedang tidak aktif.',

            default =>
                $unitTersedia > 0
                    ? 'Kendaraan tersedia pada jadwal tersebut.'
                    : 'Seluruh unit sedang digunakan pada jadwal tersebut.',
        };

        return [
            'kendaraan' => [
                'id' =>
                    $kendaraan->id,

                'nama_kendaraan' =>
                    $kendaraan->nama_kendaraan,

                'merek' =>
                    $kendaraan->merek,
            ],

            'total_unit' =>
                (int) $kendaraan->jumlah_unit,

            'unit_terpakai' =>
                $unitTerpakai,

            'unit_tersedia' =>
                $unitTersedia,

            'status_operasional' =>
                $kendaraan->status,

            'tersedia' =>
                $unitTersedia > 0,

            'pesan' =>
                $pesan,
        ];
    }

    /**
     * Menghitung jumlah booking aktif yang tanggalnya bertabrakan.
     */
    public function hitungBookingBentrok(
        int $kendaraanId,
        string $tanggalMulai,
        string $tanggalSelesai,
        ?int $abaikanSewaId = null
    ): int {
        $query = Sewa::query()
            ->where(
                'kendaraan_id',
                $kendaraanId
            )
            ->whereIn(
                'status',
                self::STATUS_MEMAKAI_KUOTA
            )
            ->where(function ($query) use (
                $tanggalMulai,
                $tanggalSelesai
            ) {
                $query
                    ->where(
                        'tanggal_mulai',
                        '<=',
                        $tanggalSelesai
                    )
                    ->where(
                        'tanggal_selesai',
                        '>=',
                        $tanggalMulai
                    );
            });

        if ($abaikanSewaId !== null) {
            $query->where(
                'id',
                '!=',
                $abaikanSewaId
            );
        }

        return $query->count();
    }

    /**
     * Menghitung total biaya penyewaan.
     */
    private function hitungTotalHarga(
        Kendaraan $kendaraan,
        string $tanggalMulai,
        string $tanggalSelesai
    ): int {
        $mulai = Carbon::parse(
            $tanggalMulai
        );

        $selesai = Carbon::parse(
            $tanggalSelesai
        );

        $durasiHari = max(
            1,
            (int) $mulai->diffInDays(
                $selesai
            )
        );

        return
            $durasiHari *
            (int) $kendaraan->harga_per_hari;
    }

    /**
     * Membuat nomor booking unik.
     */
    private function buatNomorBooking(
        string $awalan
    ): string {
        do {
            $nomorBooking =
                $awalan .
                '-' .
                now()->format('Ymd') .
                '-' .
                strtoupper(
                    Str::random(6)
                );
        } while (
            Sewa::query()
                ->where(
                    'nomor_booking',
                    $nomorBooking
                )
                ->exists()
        );

        return $nomorBooking;
    }
}
