<?php

namespace App\Services;

use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\PerpanjanganSewa;
use App\Models\Sewa;
use App\Models\User;
use App\Notifications\NotifikasiTransaksi;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Throwable;

class PerpanjanganSewaService
{
    /**
     * Status sewa yang masih menggunakan kuota kendaraan.
     */
    private const STATUS_MEMAKAI_KUOTA = [
        'menunggu_konfirmasi_admin',
        'menunggu_identitas',
        'menunggu_verifikasi_identitas',
        'identitas_ditolak',
        'menunggu_pembayaran',
        'menunggu_verifikasi_pembayaran',
        'ditolak_pembayaran',
        'disetujui_operasional',
        'sedang_berlangsung',
        'menunggu_verifikasi_pengembalian',
    ];

    /**
     * Status transaksi yang dapat mengajukan perpanjangan.
     *
     * Status disetujui_operasional tetap diperbolehkan untuk
     * mengantisipasi transaksi yang belum diubah otomatis
     * menjadi sedang_berlangsung.
     */
    private const STATUS_DAPAT_DIPERPANJANG = [
        'disetujui_operasional',
        'sedang_berlangsung',
    ];

    /**
     * Status pembayaran denda yang masih dianggap belum lunas.
     */
    private const STATUS_DENDA_BELUM_LUNAS = [
        'belum_dibayar',
        'menunggu_verifikasi',
        'ditolak',
    ];

    /**
     * Mengajukan permintaan perpanjangan rental.
     */
    public function ajukan(
        int $sewaId,
        array $data,
        User $pelanggan,
        string $alamatIp
    ): PerpanjanganSewa {
        $perpanjangan = DB::transaction(
            function () use (
                $sewaId,
                $data,
                $pelanggan,
                $alamatIp
            ): PerpanjanganSewa {
                $sewa = Sewa::query()
                    ->with([
                        'kendaraan',
                    ])
                    ->where('id', $sewaId)
                    ->where(
                        'user_id',
                        $pelanggan->id
                    )
                    ->lockForUpdate()
                    ->firstOrFail();

                /*
                 * Perpanjangan hanya dapat dilakukan pada
                 * transaksi yang sudah disetujui atau berjalan.
                 */
                if (
                    ! in_array(
                        $sewa->status,
                        self::STATUS_DAPAT_DIPERPANJANG,
                        true
                    )
                ) {
                    throw ValidationException::withMessages([
                        'perpanjangan' =>
                            'Perpanjangan hanya dapat diajukan pada transaksi rental yang sudah disetujui atau sedang berlangsung.',
                    ]);
                }

                if (! $sewa->kendaraan) {
                    throw ValidationException::withMessages([
                        'perpanjangan' =>
                            'Data kendaraan pada transaksi tidak ditemukan.',
                    ]);
                }

                /*
                 * Pelanggan dengan denda belum lunas tidak
                 * dapat mengajukan perpanjangan.
                 */
                if (
                    $this->pelangganMemilikiDendaBelumLunas(
                        $pelanggan->id
                    )
                ) {
                    throw ValidationException::withMessages([
                        'perpanjangan' =>
                            'Perpanjangan tidak dapat diajukan karena Anda masih memiliki tagihan denda yang belum dilunasi.',
                    ]);
                }

                /*
                 * Mencegah dua permintaan aktif pada transaksi
                 * yang sama.
                 */
                $sudahMemilikiPermintaanAktif =
                    PerpanjanganSewa::query()
                        ->where(
                            'sewa_id',
                            $sewa->id
                        )
                        ->where(
                            'status',
                            PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN
                        )
                        ->lockForUpdate()
                        ->exists();

                if ($sudahMemilikiPermintaanAktif) {
                    throw ValidationException::withMessages([
                        'perpanjangan' =>
                            'Transaksi ini masih memiliki permintaan perpanjangan yang menunggu persetujuan admin.',
                    ]);
                }

                $tanggalSelesaiLama =
                    Carbon::parse(
                        $sewa->tanggal_selesai
                    )->startOfDay();

                $tanggalSelesaiBaru =
                    Carbon::parse(
                        $data[
                            'tanggal_selesai_baru'
                        ]
                    )->startOfDay();

                /*
                 * Transaksi yang sudah melewati tanggal selesai
                 * tidak dapat diperpanjang.
                 */
                if (
                    now()
                        ->startOfDay()
                        ->greaterThan(
                            $tanggalSelesaiLama
                        )
                ) {
                    throw ValidationException::withMessages([
                        'perpanjangan' =>
                            'Masa rental sudah berakhir sehingga tidak dapat diperpanjang.',
                    ]);
                }

                if (
                    ! $tanggalSelesaiBaru
                        ->greaterThan(
                            $tanggalSelesaiLama
                        )
                ) {
                    throw ValidationException::withMessages([
                        'tanggal_selesai_baru' =>
                            'Tanggal selesai baru harus setelah tanggal selesai rental saat ini.',
                    ]);
                }

                $jumlahHariTambahan =
                    (int) $tanggalSelesaiLama
                        ->diffInDays(
                            $tanggalSelesaiBaru
                        );

                if ($jumlahHariTambahan < 1) {
                    throw ValidationException::withMessages([
                        'tanggal_selesai_baru' =>
                            'Durasi tambahan minimal satu hari.',
                    ]);
                }

                /*
                 * Batas tambahan 30 hari digunakan untuk
                 * mencegah pengajuan yang tidak wajar.
                 */
                if ($jumlahHariTambahan > 30) {
                    throw ValidationException::withMessages([
                        'tanggal_selesai_baru' =>
                            'Perpanjangan maksimal 30 hari dalam satu pengajuan.',
                    ]);
                }

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
                        'perpanjangan' =>
                            'Kendaraan sedang tidak aktif atau menjalani perbaikan sehingga perpanjangan belum dapat diproses.',
                    ]);
                }

                /*
                 * Periode tambahan dimulai satu hari setelah
                 * tanggal selesai lama.
                 */
                $tanggalMulaiTambahan =
                    $tanggalSelesaiLama
                        ->copy()
                        ->addDay();

                /*
                 * Menghitung transaksi lain yang menggunakan
                 * kendaraan pada periode tambahan.
                 */
                $jumlahBookingBentrok =
                    Sewa::query()
                        ->where(
                            'kendaraan_id',
                            $kendaraan->id
                        )
                        ->where(
                            'id',
                            '!=',
                            $sewa->id
                        )
                        ->whereIn(
                            'status',
                            self::STATUS_MEMAKAI_KUOTA
                        )
                        ->whereDate(
                            'tanggal_mulai',
                            '<=',
                            $tanggalSelesaiBaru
                                ->toDateString()
                        )
                        ->whereDate(
                            'tanggal_selesai',
                            '>=',
                            $tanggalMulaiTambahan
                                ->toDateString()
                        )
                        ->count();

                $jumlahUnit = max(
                    1,
                    (int) $kendaraan->jumlah_unit
                );

                if (
                    $jumlahBookingBentrok
                    >= $jumlahUnit
                ) {
                    throw ValidationException::withMessages([
                        'tanggal_selesai_baru' =>
                            'Kendaraan tidak tersedia sampai tanggal yang diajukan. Pilih tanggal lain atau hubungi admin.',
                    ]);
                }

                $hargaPerHari = max(
                    0,
                    (int) $kendaraan
                        ->harga_per_hari
                );

                $biayaTambahan =
                    $jumlahHariTambahan
                    * $hargaPerHari;

                $perpanjangan =
                    PerpanjanganSewa::query()
                        ->create([
                            'sewa_id' =>
                                $sewa->id,

                            'tanggal_selesai_lama' =>
                                $tanggalSelesaiLama
                                    ->toDateString(),

                            'tanggal_selesai_baru' =>
                                $tanggalSelesaiBaru
                                    ->toDateString(),

                            'jumlah_hari_tambahan' =>
                                $jumlahHariTambahan,

                            'harga_per_hari' =>
                                $hargaPerHari,

                            'biaya_tambahan' =>
                                $biayaTambahan,

                            'alasan_pengajuan' =>
                                $data[
                                    'alasan_pengajuan'
                                ],

                            'status' =>
                                PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN,

                            'diajukan_pada' =>
                                now(),

                            'diproses_pada' =>
                                null,

                            'diproses_oleh' =>
                                null,

                            'alasan_penolakan' =>
                                null,
                        ]);

                LogAktivitas::query()->create([
                    'user_id' =>
                        $pelanggan->id,

                    'jenis_aktivitas' =>
                        'Pengajuan Perpanjangan Rental',

                    'deskripsi' =>
                        'Pelanggan mengajukan perpanjangan booking '
                        . $sewa->nomor_booking
                        . ' dari tanggal '
                        . $tanggalSelesaiLama
                            ->format('d-m-Y')
                        . ' menjadi '
                        . $tanggalSelesaiBaru
                            ->format('d-m-Y')
                        . ' selama '
                        . $jumlahHariTambahan
                        . ' hari dengan estimasi biaya tambahan Rp'
                        . number_format(
                            $biayaTambahan,
                            0,
                            ',',
                            '.'
                        )
                        . '.',

                    'alamat_ip' =>
                        $alamatIp,
                ]);

                return $perpanjangan->fresh();
            }
        );

        /*
         * Notifikasi dikirim setelah transaksi database
         * berhasil disimpan.
         */
        $this->kirimNotifikasiAdmin(
            $perpanjangan,
            $pelanggan
        );

        return $perpanjangan;
    }

    /**
     * Memeriksa seluruh denda pelanggan yang belum lunas.
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
                self::STATUS_DENDA_BELUM_LUNAS
            )
            ->exists();
    }

    /**
     * Mengirim notifikasi permintaan baru kepada admin.
     */
    private function kirimNotifikasiAdmin(
        PerpanjanganSewa $perpanjangan,
        User $pelanggan
    ): void {
        try {
            $perpanjangan->load([
                'sewa.kendaraan',
            ]);

            $sewa =
                $perpanjangan->sewa;

            if (! $sewa) {
                return;
            }

            $daftarAdmin = User::query()
                ->where(
                    'role',
                    'admin'
                )
                ->get();

            if ($daftarAdmin->isEmpty()) {
                return;
            }

            Notification::send(
                $daftarAdmin,
                new NotifikasiTransaksi(
                    judul:
                        'Permintaan Perpanjangan Rental',

                    pesan:
                        $pelanggan->name
                        . ' mengajukan perpanjangan booking '
                        . $sewa->nomor_booking
                        . ' selama '
                        . $perpanjangan
                            ->jumlah_hari_tambahan
                        . ' hari sampai '
                        . Carbon::parse(
                            $perpanjangan
                                ->tanggal_selesai_baru
                        )->format('d-m-Y')
                        . '.',

                    jenis:
                        'perpanjangan_baru',

                    url:
                        '/admin/perpanjangan?perpanjangan='
                        . $perpanjangan->id,

                    sewaId:
                        $sewa->id,

                    nomorBooking:
                        $sewa->nomor_booking,

                    dataTambahan: [
                        'perpanjangan_id' =>
                            $perpanjangan->id,

                        'nama_pelanggan' =>
                            $pelanggan->name,

                        'kendaraan' =>
                            $sewa->kendaraan
                                ?->nama_kendaraan,

                        'tanggal_selesai_lama' =>
                            $perpanjangan
                                ->tanggal_selesai_lama
                                ?->format('Y-m-d'),

                        'tanggal_selesai_baru' =>
                            $perpanjangan
                                ->tanggal_selesai_baru
                                ?->format('Y-m-d'),

                        'jumlah_hari_tambahan' =>
                            $perpanjangan
                                ->jumlah_hari_tambahan,

                        'biaya_tambahan' =>
                            $perpanjangan
                                ->biaya_tambahan,

                        'status_baru' =>
                            PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN,
                    ],
                )
            );
        } catch (Throwable $exception) {
            /*
             * Kegagalan notifikasi tidak membatalkan
             * pengajuan yang sudah tersimpan.
             */
            report($exception);
        }
    }
}
