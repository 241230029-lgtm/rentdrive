<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Membuat tabel permintaan perpanjangan rental.
     */
    public function up(): void
    {
        Schema::create(
            'perpanjangan_sewas',
            function (Blueprint $table): void {
                $table->id();

                /*
                 * Transaksi sewa yang diperpanjang.
                 */
                $table
                    ->foreignId('sewa_id')
                    ->constrained('sewas')
                    ->cascadeOnDelete();

                /*
                 * Tanggal sebelum dan sesudah perpanjangan.
                 */
                $table->date(
                    'tanggal_selesai_lama'
                );

                $table->date(
                    'tanggal_selesai_baru'
                );

                /*
                 * Rincian perhitungan biaya tambahan.
                 */
                $table->unsignedInteger(
                    'jumlah_hari_tambahan'
                );

                $table->unsignedBigInteger(
                    'harga_per_hari'
                );

                $table->unsignedBigInteger(
                    'biaya_tambahan'
                );

                /*
                 * Keterangan pengajuan pelanggan.
                 */
                $table->text(
                    'alasan_pengajuan'
                );

                /*
                 * Status:
                 * - menunggu_persetujuan
                 * - disetujui
                 * - ditolak
                 */
                $table
                    ->string(
                        'status',
                        40
                    )
                    ->default(
                        'menunggu_persetujuan'
                    );

                /*
                 * Waktu permintaan diajukan.
                 */
                $table
                    ->timestamp(
                        'diajukan_pada'
                    )
                    ->nullable();

                /*
                 * Data admin yang memproses permintaan.
                 */
                $table
                    ->timestamp(
                        'diproses_pada'
                    )
                    ->nullable();

                $table
                    ->foreignId(
                        'diproses_oleh'
                    )
                    ->nullable()
                    ->constrained(
                        'users'
                    )
                    ->nullOnDelete();

                /*
                 * Diisi ketika permintaan ditolak.
                 */
                $table
                    ->text(
                        'alasan_penolakan'
                    )
                    ->nullable();

                $table->timestamps();

                /*
                 * Mempercepat pencarian permintaan aktif
                 * berdasarkan transaksi dan status.
                 */
                $table->index([
                    'sewa_id',
                    'status',
                ]);

                $table->index(
                    'diajukan_pada'
                );
            }
        );
    }

    /**
     * Menghapus tabel perpanjangan rental.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'perpanjangan_sewas'
        );
    }
};
