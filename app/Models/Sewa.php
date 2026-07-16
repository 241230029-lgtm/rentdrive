<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Sewa extends Model
{
    /**
     * Status transaksi yang masih memakai kuota kendaraan.
     */
    public const STATUS_MEMAKAI_KUOTA = [
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

    public const STATUS_MENUNGGU_IDENTITAS =
        'menunggu_identitas';

    public const STATUS_MENUNGGU_VERIFIKASI_IDENTITAS =
        'menunggu_verifikasi_identitas';

    public const STATUS_IDENTITAS_DITOLAK =
        'identitas_ditolak';

    /**
     * Status pembayaran denda.
     */
    public const DENDA_TIDAK_ADA =
        'tidak_ada';

    public const DENDA_BELUM_DIBAYAR =
        'belum_dibayar';

    public const DENDA_MENUNGGU_VERIFIKASI =
        'menunggu_verifikasi';

    public const DENDA_DITOLAK =
        'ditolak';

    public const DENDA_LUNAS =
        'lunas';

    /**
     * Metode pembayaran.
     */
    public const METODE_CASH =
        'cash';

    public const METODE_TRANSFER =
        'transfer';

    /**
     * Kolom yang dapat diisi melalui model.
     */
    protected $fillable = [
        'nomor_booking',
        'user_id',
        'kendaraan_id',
        'jenis_booking',
        'tanggal_mulai',
        'tanggal_selesai',
        'total_harga',

        /*
         * Pembayaran transaksi utama.
         */
        'metode_pembayaran',
        'bukti_pembayaran',
        'pembayaran_diterima_pada',
        'pembayaran_diterima_oleh',

        /*
         * Pengembalian kendaraan.
         */
        'tanggal_kembali_aktual',
        'kondisi_kendaraan_kembali',
        'foto_kondisi_kembali',
        'kilometer_kembali',
        'denda_keterlambatan',
        'denda_kerusakan',
        'total_denda',

        /*
         * Pembayaran denda.
         */
        'status_pembayaran_denda',
        'metode_pembayaran_denda',
        'bukti_pembayaran_denda',
        'alasan_penolakan_pembayaran_denda',
        'denda_dibayar_pada',
        'denda_diperiksa_pada',
        'denda_diperiksa_oleh',

        /*
         * Penolakan transaksi.
         */
        'alasan_penolakan',
        'jenis_penolakan',
        'kategori_penolakan',
        'ditolak_oleh',
        'ditolak_pada',

        'status',
    ];

    /**
     * Konversi tipe data.
     */
    protected function casts(): array
    {
        return [
            'tanggal_mulai' =>
                'date',

            'tanggal_selesai' =>
                'date',

            'tanggal_kembali_aktual' =>
                'date',

            'pembayaran_diterima_pada' =>
                'datetime',

            'denda_dibayar_pada' =>
                'datetime',

            'denda_diperiksa_pada' =>
                'datetime',

            'ditolak_pada' =>
                'datetime',

            'total_harga' =>
                'integer',

            'kilometer_kembali' =>
                'integer',

            'denda_keterlambatan' =>
                'integer',

            'denda_kerusakan' =>
                'integer',

            'total_denda' =>
                'integer',
        ];
    }

    /**
     * Pemilik akun transaksi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }

    /**
     * Kendaraan yang digunakan.
     */
    public function kendaraan(): BelongsTo
    {
        return $this->belongsTo(
            Kendaraan::class
        );
    }

    /**
     * Identitas pengguna kendaraan pada transaksi.
     */
    public function identitasSewa(): HasOne
    {
        return $this->hasOne(
            IdentitasSewa::class
        );
    }

    /**
     * Admin yang melakukan penolakan transaksi.
     */
    public function adminPenolak(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'ditolak_oleh'
        );
    }

    /**
     * Admin yang menerima pembayaran utama Walk-In.
     */
    public function penerimaPembayaran(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'pembayaran_diterima_oleh'
        );
    }

    /**
     * Admin yang memeriksa pembayaran denda.
     */
    public function pemeriksaPembayaranDenda(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'denda_diperiksa_oleh'
        );
    }

    /**
     * Booking sedang menunggu identitas.
     */
    public function menungguIdentitas(): bool
    {
        return $this->status ===
            self::STATUS_MENUNGGU_IDENTITAS;
    }

    /**
     * Identitas sedang diperiksa admin.
     */
    public function menungguVerifikasiIdentitas(): bool
    {
        return $this->status ===
            self::STATUS_MENUNGGU_VERIFIKASI_IDENTITAS;
    }

    /**
     * Identitas transaksi ditolak.
     */
    public function identitasDitolak(): bool
    {
        return $this->status ===
            self::STATUS_IDENTITAS_DITOLAK;
    }

    /**
     * Transaksi memerlukan pengiriman identitas.
     */
    public function membutuhkanIdentitas(): bool
    {
        return in_array(
            $this->status,
            [
                self::STATUS_MENUNGGU_IDENTITAS,
                self::STATUS_IDENTITAS_DITOLAK,
            ],
            true
        );
    }

    /**
     * Transaksi masih memakai kuota kendaraan.
     */
    public function memakaiKuotaKendaraan(): bool
    {
        return in_array(
            $this->status,
            self::STATUS_MEMAKAI_KUOTA,
            true
        );
    }

    /**
     * Identitas transaksi telah disetujui.
     */
    public function identitasTransaksiTerverifikasi(): bool
    {
        return $this->identitasSewa
            ?->terverifikasi() ?? false;
    }

    /**
     * Transaksi mempunyai denda yang belum lunas.
     */
    public function memilikiDendaBelumLunas(): bool
    {
        return (int) $this->total_denda > 0
            && in_array(
                $this->status_pembayaran_denda,
                [
                    self::DENDA_BELUM_DIBAYAR,
                    self::DENDA_MENUNGGU_VERIFIKASI,
                    self::DENDA_DITOLAK,
                ],
                true
            );
    }

    /**
     * Pembayaran denda sedang diperiksa admin.
     */
    public function dendaMenungguVerifikasi(): bool
    {
        return $this->status_pembayaran_denda ===
            self::DENDA_MENUNGGU_VERIFIKASI;
    }

    /**
     * Denda sudah dinyatakan lunas.
     */
    public function dendaLunas(): bool
    {
        return $this->status_pembayaran_denda ===
            self::DENDA_LUNAS;
    }

    /**
     * Transaksi berasal dari input langsung admin.
     */
    public function bookingWalkIn(): bool
    {
        return $this->jenis_booking ===
            'walk_in';
    }
}
