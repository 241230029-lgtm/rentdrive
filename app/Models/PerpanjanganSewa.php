<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerpanjanganSewa extends Model
{
    /**
     * Pelanggan baru mengajukan perpanjangan dan
     * masih menunggu keputusan awal admin.
     */
    public const STATUS_MENUNGGU_PERSETUJUAN =
        'menunggu_persetujuan';

    /**
     * Admin menyetujui permintaan awal dan pelanggan
     * harus membayar biaya tambahan.
     */
    public const STATUS_MENUNGGU_PEMBAYARAN =
        'menunggu_pembayaran';

    /**
     * Pelanggan sudah mengirim bukti pembayaran dan
     * menunggu pemeriksaan admin.
     */
    public const STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN =
        'menunggu_verifikasi_pembayaran';

    /**
     * Bukti pembayaran belum dapat disetujui dan
     * pelanggan dapat mengirim ulang.
     */
    public const STATUS_PEMBAYARAN_DITOLAK =
        'pembayaran_ditolak';

    /**
     * Pembayaran disetujui, tanggal selesai baru dan
     * biaya tambahan sudah diterapkan ke transaksi.
     */
    public const STATUS_SELESAI =
        'selesai';

    /**
     * Permintaan awal perpanjangan ditolak admin.
     */
    public const STATUS_DITOLAK =
        'ditolak';

    /**
     * Status lama sebelum fitur pembayaran ditambahkan.
     * Dipertahankan sementara untuk kompatibilitas data.
     */
    public const STATUS_DISETUJUI_LAMA =
        'disetujui';

    /**
     * Status yang masih dianggap sebagai satu proses aktif.
     * Selama berada pada status ini, pelanggan tidak boleh
     * mengajukan perpanjangan baru untuk transaksi yang sama.
     */
    public const STATUS_PROSES_AKTIF = [
        self::STATUS_MENUNGGU_PERSETUJUAN,
        self::STATUS_MENUNGGU_PEMBAYARAN,
        self::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN,
        self::STATUS_PEMBAYARAN_DITOLAK,
        self::STATUS_DISETUJUI_LAMA,
    ];

    /**
     * Kolom yang dapat diisi melalui mass assignment.
     */
    protected $fillable = [
        'sewa_id',

        /*
         * Rincian pengajuan.
         */
        'tanggal_selesai_lama',
        'tanggal_selesai_baru',
        'jumlah_hari_tambahan',
        'harga_per_hari',
        'biaya_tambahan',
        'alasan_pengajuan',
        'status',

        /*
         * Pemeriksaan awal admin.
         */
        'diajukan_pada',
        'diproses_pada',
        'diproses_oleh',
        'alasan_penolakan',

        /*
         * Pembayaran biaya perpanjangan.
         */
        'metode_pembayaran',
        'bukti_pembayaran',
        'dibayar_pada',
        'pembayaran_diperiksa_pada',
        'pembayaran_diperiksa_oleh',
        'alasan_penolakan_pembayaran',

        /*
         * Waktu tanggal baru dan biaya tambahan
         * diterapkan pada transaksi utama.
         */
        'diterapkan_pada',
    ];

    /**
     * Konversi tipe data model.
     */
    protected function casts(): array
    {
        return [
            'tanggal_selesai_lama' =>
                'date',

            'tanggal_selesai_baru' =>
                'date',

            'jumlah_hari_tambahan' =>
                'integer',

            'harga_per_hari' =>
                'integer',

            'biaya_tambahan' =>
                'integer',

            'diajukan_pada' =>
                'datetime',

            'diproses_pada' =>
                'datetime',

            'dibayar_pada' =>
                'datetime',

            'pembayaran_diperiksa_pada' =>
                'datetime',

            'diterapkan_pada' =>
                'datetime',
        ];
    }

    /**
     * Transaksi sewa yang diperpanjang.
     */
    public function sewa(): BelongsTo
    {
        return $this->belongsTo(
            Sewa::class
        );
    }

    /**
     * Admin yang memberi keputusan awal terhadap
     * permintaan perpanjangan.
     */
    public function adminPemroses(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'diproses_oleh'
        );
    }

    /**
     * Admin yang memeriksa pembayaran perpanjangan.
     */
    public function adminPemeriksaPembayaran(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'pembayaran_diperiksa_oleh'
        );
    }

    /**
     * Permintaan masih menunggu persetujuan awal.
     */
    public function menungguPersetujuan(): bool
    {
        return $this->status ===
            self::STATUS_MENUNGGU_PERSETUJUAN;
    }

    /**
     * Permintaan sudah disetujui dan harus dibayar.
     */
    public function menungguPembayaran(): bool
    {
        return $this->status ===
            self::STATUS_MENUNGGU_PEMBAYARAN;
    }

    /**
     * Bukti pembayaran sedang diperiksa admin.
     */
    public function menungguVerifikasiPembayaran(): bool
    {
        return $this->status ===
            self::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN;
    }

    /**
     * Pembayaran perpanjangan ditolak.
     */
    public function pembayaranDitolak(): bool
    {
        return $this->status ===
            self::STATUS_PEMBAYARAN_DITOLAK;
    }

    /**
     * Proses perpanjangan telah selesai.
     */
    public function selesai(): bool
    {
        return $this->status ===
            self::STATUS_SELESAI;
    }

    /**
     * Permintaan awal ditolak.
     */
    public function ditolak(): bool
    {
        return $this->status ===
            self::STATUS_DITOLAK;
    }

    /**
     * Perpanjangan masih berada dalam proses aktif.
     */
    public function masihDalamProses(): bool
    {
        return in_array(
            $this->status,
            self::STATUS_PROSES_AKTIF,
            true
        );
    }

    /**
     * Pelanggan diperbolehkan mengirim pembayaran.
     */
    public function bolehMengirimPembayaran(): bool
    {
        return in_array(
            $this->status,
            [
                self::STATUS_MENUNGGU_PEMBAYARAN,
                self::STATUS_PEMBAYARAN_DITOLAK,
            ],
            true
        );
    }

    /**
     * Admin diperbolehkan memverifikasi pembayaran.
     */
    public function bolehMemverifikasiPembayaran(): bool
    {
        return $this->status ===
            self::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN
            && filled(
                $this->bukti_pembayaran
            );
    }
}
