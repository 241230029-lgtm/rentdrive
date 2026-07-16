<?php

namespace App\Services;

use App\Models\IdentitasSewa;
use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use App\Notifications\NotifikasiTransaksi;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class BookingService
{
    /**
     * Membuat booking online dari pelanggan.
     */
    public function buatBookingOnline(
        array $data,
        User $pelanggan
    ): Sewa {
        if ($pelanggan->role !== 'pelanggan') {
            throw ValidationException::withMessages([
                'pelanggan' =>
                    'Akun yang digunakan bukan akun pelanggan.',
            ]);
        }

        /*
         * Pelanggan dengan denda belum lunas tetap dapat
         * login dan melihat transaksi, tetapi tidak dapat
         * membuat booking baru.
         */
        if (
            $this->pelangganMemilikiDendaBelumLunas(
                $pelanggan->id
            )
        ) {
            throw ValidationException::withMessages([
                'booking' =>
                    'Anda masih memiliki tagihan denda yang belum dilunasi. Selesaikan pembayaran denda sebelum membuat booking baru.',
            ]);
        }

        $hasil = DB::transaction(
            function () use (
                $data,
                $pelanggan
            ): array {
                $kendaraan = Kendaraan::query()
                    ->lockForUpdate()
                    ->findOrFail(
                        $data['kendaraan_id']
                    );

                /*
                 * Status operasional hanya digunakan pada
                 * proses internal. Informasi jumlah unit
                 * tidak dikirim kepada pelanggan.
                 */
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
                            'Kendaraan belum dapat digunakan pada jadwal yang dipilih.',
                    ]);
                }

                $jumlahBentrok =
                    $this->hitungBookingBentrok(
                        kendaraanId:
                            $kendaraan->id,

                        tanggalMulai:
                            $data['tanggal_mulai'],

                        tanggalSelesai:
                            $data['tanggal_selesai']
                    );

                if (
                    $jumlahBentrok >=
                    (int) $kendaraan->jumlah_unit
                ) {
                    throw ValidationException::withMessages([
                        'tanggal_mulai' =>
                            'Kendaraan tidak tersedia pada jadwal yang dipilih. Silakan pilih jadwal atau kendaraan lain.',
                    ]);
                }

                $totalHarga =
                    $this->hitungTotalHarga(
                        kendaraan:
                            $kendaraan,

                        tanggalMulai:
                            $data['tanggal_mulai'],

                        tanggalSelesai:
                            $data['tanggal_selesai']
                    );

                $sewa = Sewa::query()->create([
                    'nomor_booking' =>
                        $this->buatNomorBooking(
                            'BK'
                        ),

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

                    'status_pembayaran_denda' =>
                        Sewa::DENDA_TIDAK_ADA,

                    'status' =>
                        'menunggu_konfirmasi_admin',
                ]);

                return [
                    'sewa' =>
                        $sewa,

                    'kendaraan' =>
                        $kendaraan,
                ];
            }
        );

        /** @var Sewa $sewa */
        $sewa = $hasil['sewa'];

        /** @var Kendaraan $kendaraan */
        $kendaraan = $hasil['kendaraan'];

        /*
         * Notifikasi dikirim setelah transaksi database
         * berhasil disimpan.
         */
        $daftarAdmin = User::query()
            ->where(
                'role',
                'admin'
            )
            ->get();

        if ($daftarAdmin->isNotEmpty()) {
            Notification::send(
                $daftarAdmin,
                new NotifikasiTransaksi(
                    judul:
                        'Booking Baru',

                    pesan:
                        $pelanggan->name
                        . ' mengajukan booking '
                        . $kendaraan->nama_kendaraan
                        . ' untuk tanggal '
                        . $this->formatTanggalNotifikasi(
                            $data['tanggal_mulai']
                        )
                        . ' sampai '
                        . $this->formatTanggalNotifikasi(
                            $data['tanggal_selesai']
                        )
                        . '.',

                    jenis:
                        'booking_baru',

                    url:
                        '/admin/booking?sewa='
                        . $sewa->id,

                    sewaId:
                        $sewa->id,

                    nomorBooking:
                        $sewa->nomor_booking,

                    dataTambahan: [
                        'nama_pelanggan' =>
                            $pelanggan->name,

                        'kendaraan' =>
                            $kendaraan->nama_kendaraan,

                        'tanggal_mulai' =>
                            $data['tanggal_mulai'],

                        'tanggal_selesai' =>
                            $data['tanggal_selesai'],

                        'status_baru' =>
                            'menunggu_konfirmasi_admin',
                    ],
                )
            );
        }

        return $sewa;
    }

    /**
     * Alias untuk menjaga kompatibilitas apabila
     * controller masih memanggil method buatBooking().
     */
    public function buatBooking(
        array $data,
        User $pelanggan
    ): Sewa {
        return $this->buatBookingOnline(
            $data,
            $pelanggan
        );
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
        $hasil = DB::transaction(
            function () use (
                $sewaId,
                $data,
                $admin,
                $alamatIp
            ): array {
                $sewa = Sewa::query()
                    ->with([
                        'user',
                        'kendaraan',
                    ])
                    ->lockForUpdate()
                    ->findOrFail(
                        $sewaId
                    );

                if (
                    $sewa->status !==
                    'menunggu_konfirmasi_admin'
                ) {
                    throw ValidationException::withMessages([
                        'aksi' =>
                            'Booking ini sudah pernah diproses.',
                    ]);
                }

                if (
                    ($data['aksi'] ?? null) ===
                    'setujui'
                ) {
                    return $this->setujuiBooking(
                        sewa:
                            $sewa,

                        admin:
                            $admin,

                        alamatIp:
                            $alamatIp
                    );
                }

                return $this->tolakBooking(
                    sewa:
                        $sewa,

                    data:
                        $data,

                    admin:
                        $admin,

                    alamatIp:
                        $alamatIp
                );
            }
        );

        /** @var Sewa $sewa */
        $sewa = $hasil['sewa'];

        /** @var User $pelanggan */
        $pelanggan = $hasil['pelanggan'];

        /*
         * Notifikasi dikirim setelah transaksi database
         * berhasil.
         */
        if (
            $hasil['aksi'] ===
            'ditolak'
        ) {
            $pelanggan->notify(
                new NotifikasiTransaksi(
                    judul:
                        'Booking Belum Dapat Diproses',

                    pesan:
                        'Permintaan booking '
                        . $sewa->nomor_booking
                        . ' belum dapat diproses pada jadwal yang dipilih. '
                        . 'Silakan pilih kendaraan atau jadwal lain.',

                    jenis:
                        'booking_ditolak',

                    url:
                        '/pelanggan/riwayat?sewa='
                        . $sewa->id,

                    sewaId:
                        $sewa->id,

                    nomorBooking:
                        $sewa->nomor_booking,

                    dataTambahan: [
                        'status_baru' =>
                            'ditolak_booking',
                    ],
                )
            );

            return;
        }

        /*
         * Setiap booking online yang disetujui wajib
         * mengirim identitas khusus transaksi tersebut.
         */
        $pelanggan->notify(
            new NotifikasiTransaksi(
                judul:
                    'Booking Disetujui',

                pesan:
                    'Booking '
                    . $sewa->nomor_booking
                    . ' telah disetujui. '
                    . 'Silakan lengkapi identitas pengguna kendaraan '
                    . 'untuk booking ini sebelum melanjutkan pembayaran.',

                jenis:
                    'booking_disetujui',

                url:
                    '/pelanggan/identitas/'
                    . $sewa->id,

                sewaId:
                    $sewa->id,

                nomorBooking:
                    $sewa->nomor_booking,

                dataTambahan: [
                    'kendaraan' =>
                        $sewa->kendaraan
                            ?->nama_kendaraan,

                    'status_baru' =>
                        'menunggu_identitas',

                    'identitas_per_transaksi' =>
                        true,
                ],
            )
        );
    }

    /**
     * Menyetujui booking pelanggan.
     */
    private function setujuiBooking(
        Sewa $sewa,
        User $admin,
        string $alamatIp
    ): array {
        $kendaraan = Kendaraan::query()
            ->lockForUpdate()
            ->findOrFail(
                $sewa->kendaraan_id
            );

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

        $jumlahBentrok =
            $this->hitungBookingBentrok(
                kendaraanId:
                    $kendaraan->id,

                tanggalMulai:
                    $tanggalMulai,

                tanggalSelesai:
                    $tanggalSelesai,

                abaikanSewaId:
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

        $pelanggan = $sewa->user;

        /*
         * Status identitas akun pelanggan tidak digunakan.
         * Setiap booking harus mengirim identitas baru.
         */
        $statusBaru =
            'menunggu_identitas';

        $sewa->update([
            'status' =>
                $statusBaru,

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

        LogAktivitas::query()->create([
            'user_id' =>
                $admin->id,

            'jenis_aktivitas' =>
                'Persetujuan Booking',

            'deskripsi' =>
                'Admin menyetujui booking '
                . $sewa->nomor_booking
                . ' milik pelanggan '
                . $pelanggan->name
                . '. Pelanggan wajib mengirim identitas '
                . 'khusus untuk transaksi ini.',

            'alamat_ip' =>
                $alamatIp,
        ]);

        $sewa->refresh();

        return [
            'aksi' =>
                'disetujui',

            'status_baru' =>
                $statusBaru,

            'sewa' =>
                $sewa,

            'pelanggan' =>
                $pelanggan,
        ];
    }

    /**
     * Menolak booking pelanggan.
     */
    private function tolakBooking(
        Sewa $sewa,
        array $data,
        User $admin,
        string $alamatIp
    ): array {
        $sewa->update([
            'status' =>
                'ditolak_booking',

            'jenis_penolakan' =>
                'booking',

            'kategori_penolakan' =>
                $data['kategori_penolakan']
                ?? 'lainnya',

            'alasan_penolakan' =>
                $data['alasan_penolakan']
                ?? 'Booking belum dapat diproses.',

            'ditolak_oleh' =>
                $admin->id,

            'ditolak_pada' =>
                now(),
        ]);

        LogAktivitas::query()->create([
            'user_id' =>
                $admin->id,

            'jenis_aktivitas' =>
                'Penolakan Booking',

            'deskripsi' =>
                'Admin menolak booking '
                . $sewa->nomor_booking
                . '. Kategori: '
                . (
                    $data['kategori_penolakan']
                    ?? 'lainnya'
                )
                . '. Keterangan: '
                . (
                    $data['alasan_penolakan']
                    ?? 'Booking belum dapat diproses.'
                ),

            'alamat_ip' =>
                $alamatIp,
        ]);

        $sewa->refresh();

        return [
            'aksi' =>
                'ditolak',

            'status_baru' =>
                'ditolak_booking',

            'sewa' =>
                $sewa,

            'pelanggan' =>
                $sewa->user,
        ];
    }

    /**
     * Admin membuat transaksi Walk-In.
     *
     * Data pelanggan, identitas, dan pembayaran dicatat
     * langsung oleh admin pada satu transaksi.
     */
    public function buatBookingWalkIn(
        array $data,
        User $admin,
        string $alamatIp
    ): Sewa {
        $pathKtp = null;
        $pathSim = null;

        try {
            $hasil = DB::transaction(
                function () use (
                    $data,
                    $admin,
                    $alamatIp,
                    &$pathKtp,
                    &$pathSim
                ): array {
                    /*
                     * Menggunakan akun pelanggan yang sudah ada
                     * berdasarkan email atau nomor telepon.
                     *
                     * Apabila belum ada, sistem membuat akun
                     * internal khusus pelanggan Walk-In.
                     */
                    $pelanggan =
                        $this->cariAtauBuatPelangganWalkIn(
                            $data
                        );

                    /*
                     * Pelanggan yang masih memiliki denda
                     * belum lunas tidak dapat melakukan
                     * transaksi baru.
                     */
                    if (
                        $this->pelangganMemilikiDendaBelumLunas(
                            $pelanggan->id
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'no_telepon' =>
                                'Pelanggan masih memiliki denda yang belum dilunasi dan belum dapat melakukan booking baru.',
                        ]);
                    }

                    $kendaraan = Kendaraan::query()
                        ->lockForUpdate()
                        ->findOrFail(
                            $data['kendaraan_id']
                        );

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

                    $jumlahBentrok =
                        $this->hitungBookingBentrok(
                            kendaraanId:
                                $kendaraan->id,

                            tanggalMulai:
                                $data['tanggal_mulai'],

                            tanggalSelesai:
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

                    $totalHarga =
                        $this->hitungTotalHarga(
                            kendaraan:
                                $kendaraan,

                            tanggalMulai:
                                $data['tanggal_mulai'],

                            tanggalSelesai:
                                $data['tanggal_selesai']
                        );

                    /*
                     * Transaksi Walk-In langsung dianggap:
                     * - identitas telah diperiksa admin;
                     * - pembayaran telah diterima;
                     * - siap masuk tahap operasional.
                     */
                    $sewa = Sewa::query()->create([
                        'nomor_booking' =>
                            $this->buatNomorBooking(
                                'WI'
                            ),

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

                        'metode_pembayaran' =>
                            $data['metode_pembayaran'],

                        /*
                         * Walk-In tidak memerlukan unggahan
                         * bukti pembayaran karena pembayaran
                         * dicatat langsung oleh admin.
                         */
                        'bukti_pembayaran' =>
                            null,

                        'pembayaran_diterima_pada' =>
                            now(),

                        'pembayaran_diterima_oleh' =>
                            $admin->id,

                        'status_pembayaran_denda' =>
                            Sewa::DENDA_TIDAK_ADA,

                        'status' =>
                            'disetujui_operasional',
                    ]);

                    /*
                     * Dokumen disimpan secara private
                     * berdasarkan transaksi.
                     */
                    $pathKtp = $data['dokumen_ktp']
                        ->store(
                            'dokumen_identitas/sewa/'
                            . $sewa->id
                            . '/ktp',
                            'local'
                        );

                    $pathSim = $data['dokumen_sim']
                        ->store(
                            'dokumen_identitas/sewa/'
                            . $sewa->id
                            . '/sim',
                            'local'
                        );

                    /*
                     * Identitas Walk-In langsung terverifikasi
                     * karena admin memeriksa dokumen pelanggan
                     * ketika datang ke lokasi rental.
                     */
                    IdentitasSewa::query()->create([
                        'sewa_id' =>
                            $sewa->id,

                        'nama_pengguna' =>
                            $data['nama_pelanggan'],

                        'nik' =>
                            $data['nik'],

                        'nomor_sim' =>
                            $data['nomor_sim'],

                        'no_telepon' =>
                            $data['no_telepon'],

                        'alamat' =>
                            $data['alamat'],

                        'dokumen_ktp' =>
                            $pathKtp,

                        'dokumen_sim' =>
                            $pathSim,

                        'status_verifikasi' =>
                            IdentitasSewa::STATUS_TERVERIFIKASI,

                        'dikirim_pada' =>
                            now(),

                        'diperiksa_pada' =>
                            now(),

                        'diperiksa_oleh' =>
                            $admin->id,

                        'alasan_penolakan' =>
                            null,
                    ]);

                    $namaMetodePembayaran =
                        $data['metode_pembayaran'] ===
                        Sewa::METODE_CASH
                            ? 'Cash'
                            : 'Transfer';

                    LogAktivitas::query()->create([
                        'user_id' =>
                            $admin->id,

                        'jenis_aktivitas' =>
                            'Input Booking Walk-In',

                        'deskripsi' =>
                            'Admin membuat transaksi Walk-In '
                            . $sewa->nomor_booking
                            . ' untuk '
                            . $data['nama_pelanggan']
                            . ' menggunakan kendaraan '
                            . $kendaraan->nama_kendaraan
                            . '. Pembayaran diterima melalui '
                            . $namaMetodePembayaran
                            . '.',

                        'alamat_ip' =>
                            $alamatIp,
                    ]);

                    return [
                        'sewa' =>
                            $sewa,

                        'pelanggan' =>
                            $pelanggan,

                        'kendaraan' =>
                            $kendaraan,
                    ];
                }
            );
        } catch (Throwable $exception) {
            /*
             * File harus dihapus apabila proses database
             * gagal disimpan.
             */
            if ($pathKtp) {
                Storage::disk('local')
                    ->delete(
                        $pathKtp
                    );
            }

            if ($pathSim) {
                Storage::disk('local')
                    ->delete(
                        $pathSim
                    );
            }

            throw $exception;
        }

        /** @var Sewa $sewa */
        $sewa = $hasil['sewa'];

        /** @var User $pelanggan */
        $pelanggan = $hasil['pelanggan'];

        /** @var Kendaraan $kendaraan */
        $kendaraan = $hasil['kendaraan'];

        /*
         * Notifikasi dikirim apabila akun tersebut
         * digunakan pelanggan untuk login.
         *
         * Kegagalan notifikasi tidak membatalkan
         * transaksi Walk-In.
         */
        try {
            $pelanggan->notify(
                new NotifikasiTransaksi(
                    judul:
                        'Transaksi Walk-In Dicatat',

                    pesan:
                        'Transaksi '
                        . $sewa->nomor_booking
                        . ' untuk '
                        . $kendaraan->nama_kendaraan
                        . ' telah dicatat oleh admin dengan pembayaran '
                        . (
                            $sewa->metode_pembayaran ===
                            Sewa::METODE_CASH
                                ? 'cash'
                                : 'transfer'
                        )
                        . '.',

                    jenis:
                        'booking_disetujui',

                    url:
                        '/pelanggan/riwayat?sewa='
                        . $sewa->id,

                    sewaId:
                        $sewa->id,

                    nomorBooking:
                        $sewa->nomor_booking,

                    dataTambahan: [
                        'kendaraan' =>
                            $kendaraan->nama_kendaraan,

                        'jenis_booking' =>
                            'walk_in',

                        'metode_pembayaran' =>
                            $sewa->metode_pembayaran,

                        'status_baru' =>
                            'disetujui_operasional',
                    ],
                )
            );
        } catch (Throwable) {
            /*
             * Transaksi tetap berhasil meskipun proses
             * notifikasi mengalami kegagalan.
             */
        }

        return $sewa->fresh([
            'user',
            'kendaraan',
            'identitasSewa',
        ]);
    }

    /**
     * Mencari akun pelanggan berdasarkan email atau
     * nomor telepon, lalu membuat akun internal apabila
     * pelanggan belum pernah terdaftar.
     */
    private function cariAtauBuatPelangganWalkIn(
        array $data
    ): User {
        $email = filled(
            $data['email'] ?? null
        )
            ? strtolower(
                trim(
                    $data['email']
                )
            )
            : null;

        $nomorTelepon =
            $data['no_telepon'];

        $pelangganBerdasarkanTelepon =
            User::query()
                ->where(
                    'no_telepon',
                    $nomorTelepon
                )
                ->lockForUpdate()
                ->first();

        $pelangganBerdasarkanEmail =
            $email
                ? User::query()
                    ->where(
                        'email',
                        $email
                    )
                    ->lockForUpdate()
                    ->first()
                : null;

        /*
         * Email dan nomor telepon tidak boleh terhubung
         * dengan dua akun berbeda.
         */
        if (
            $pelangganBerdasarkanTelepon &&
            $pelangganBerdasarkanEmail &&
            $pelangganBerdasarkanTelepon->id !==
                $pelangganBerdasarkanEmail->id
        ) {
            throw ValidationException::withMessages([
                'email' =>
                    'Email dan nomor telepon terhubung dengan akun pelanggan yang berbeda.',
            ]);
        }

        $pelanggan =
            $pelangganBerdasarkanEmail
            ?? $pelangganBerdasarkanTelepon;

        if ($pelanggan) {
            if (
                $pelanggan->role !==
                'pelanggan'
            ) {
                throw ValidationException::withMessages([
                    'email' =>
                        'Email atau nomor telepon tersebut telah digunakan oleh akun selain pelanggan.',
                ]);
            }

            /*
             * Data akun lama tidak ditimpa seluruhnya.
             * Data identitas transaksi disimpan terpisah
             * pada identitas_sewas.
             */
            $perubahan = [];

            if (blank($pelanggan->no_telepon)) {
                $perubahan['no_telepon'] =
                    $nomorTelepon;
            }

            if (blank($pelanggan->alamat)) {
                $perubahan['alamat'] =
                    $data['alamat'];
            }

            if (
                blank($pelanggan->name) &&
                filled(
                    $data['nama_pelanggan']
                )
            ) {
                $perubahan['name'] =
                    $data['nama_pelanggan'];
            }

            if ($perubahan !== []) {
                $pelanggan->update(
                    $perubahan
                );
            }

            return $pelanggan;
        }

        /*
         * Karena kolom email digunakan untuk login,
         * pelanggan tanpa email diberikan email internal.
         */
        $emailAkun =
            $email
            ?? $this->buatEmailInternalWalkIn(
                $nomorTelepon
            );

        return User::query()->create([
            'name' =>
                $data['nama_pelanggan'],

            'email' =>
                $emailAkun,

            /*
             * Password acak tidak diberikan kepada pelanggan.
             * Akun ini berfungsi sebagai penghubung transaksi.
             */
            'password' =>
                Str::random(40),

            'role' =>
                'pelanggan',

            'no_telepon' =>
                $nomorTelepon,

            'alamat' =>
                $data['alamat'],
        ]);
    }

    /**
     * Membuat email internal unik untuk pelanggan Walk-In
     * yang tidak memberikan email.
     */
    private function buatEmailInternalWalkIn(
        string $nomorTelepon
    ): string {
        $nomorBersih = preg_replace(
            '/[^0-9]/',
            '',
            $nomorTelepon
        );

        $nomorBersih = $nomorBersih !== ''
            ? $nomorBersih
            : Str::lower(
                Str::random(12)
            );

        $emailDasar =
            'walkin.'
            . $nomorBersih;

        $email =
            $emailDasar
            . '@rentdrive.local';

        $urutan = 1;

        while (
            User::query()
                ->where(
                    'email',
                    $email
                )
                ->exists()
        ) {
            $email =
                $emailDasar
                . '.'
                . $urutan
                . '@rentdrive.local';

            $urutan++;
        }

        return $email;
    }

    /**
     * Memeriksa tagihan denda pelanggan yang belum lunas.
     */
    private function pelangganMemilikiDendaBelumLunas(
        int $pelangganId
    ): bool {
        return Sewa::query()
            ->where(
                'user_id',
                $pelangganId
            )
            ->where(
                'total_denda',
                '>',
                0
            )
            ->whereIn(
                'status_pembayaran_denda',
                [
                    Sewa::DENDA_BELUM_DIBAYAR,
                    Sewa::DENDA_MENUNGGU_VERIFIKASI,
                    Sewa::DENDA_DITOLAK,
                ]
            )
            ->exists();
    }

    /**
     * Mengambil informasi ketersediaan untuk admin.
     */
    public function cekKetersediaan(
        array $data
    ): array {
        $kendaraan = Kendaraan::query()
            ->findOrFail(
                $data['kendaraan_id']
            );

        $unitTerpakai =
            $this->hitungBookingBentrok(
                kendaraanId:
                    $kendaraan->id,

                tanggalMulai:
                    $data['tanggal_mulai'],

                tanggalSelesai:
                    $data['tanggal_selesai']
            );

        $statusAktif =
            $kendaraan->status ===
            'tersedia';

        $unitTersedia = $statusAktif
            ? max(
                0,
                (int) $kendaraan->jumlah_unit
                - $unitTerpakai
            )
            : 0;

        $pesan = match (
            $kendaraan->status
        ) {
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
     * Menghitung jumlah booking aktif yang tanggalnya
     * saling bertabrakan.
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
                Sewa::STATUS_MEMAKAI_KUOTA
            )
            ->where(
                function ($query) use (
                    $tanggalMulai,
                    $tanggalSelesai
                ): void {
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
                }
            );

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
     * Menghitung total harga berdasarkan jumlah hari.
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
            $durasiHari
            * (int) $kendaraan->harga_per_hari;
    }

    /**
     * Membuat nomor booking unik.
     */
    private function buatNomorBooking(
        string $awalan
    ): string {
        do {
            $nomorBooking =
                $awalan
                . '-'
                . now()->format('Ymd')
                . '-'
                . strtoupper(
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

    /**
     * Mengubah tanggal untuk notifikasi.
     */
    private function formatTanggalNotifikasi(
        string $tanggal
    ): string {
        return Carbon::parse(
            $tanggal
        )
            ->locale('id')
            ->translatedFormat(
                'd M Y'
            );
    }
}
