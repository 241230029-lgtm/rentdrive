<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan informasi pembayaran transaksi utama
     * serta pembayaran denda pengembalian.
     */
    public function up(): void
    {
        Schema::table(
            'sewas',
            function (Blueprint $table): void {
                /*
                 * Pembayaran transaksi utama.
                 *
                 * Digunakan terutama untuk booking walk-in:
                 * - cash
                 * - transfer
                 */
                $table->string(
                    'metode_pembayaran',
                    30
                )->nullable();

                $table->timestamp(
                    'pembayaran_diterima_pada'
                )->nullable();

                $table->foreignId(
                    'pembayaran_diterima_oleh'
                )
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();

                /*
                 * Status pembayaran denda:
                 * - tidak_ada
                 * - belum_dibayar
                 * - menunggu_verifikasi
                 * - ditolak
                 * - lunas
                 */
                $table->string(
                    'status_pembayaran_denda',
                    40
                )->default('tidak_ada');

                /*
                 * Metode pembayaran denda:
                 * - cash
                 * - transfer
                 */
                $table->string(
                    'metode_pembayaran_denda',
                    30
                )->nullable();

                /*
                 * Bukti transfer denda disimpan pada
                 * storage/app/public.
                 */
                $table->string(
                    'bukti_pembayaran_denda'
                )->nullable();

                $table->text(
                    'alasan_penolakan_pembayaran_denda'
                )->nullable();

                /*
                 * Waktu pelanggan mengirim pembayaran denda.
                 */
                $table->timestamp(
                    'denda_dibayar_pada'
                )->nullable();

                /*
                 * Waktu admin memeriksa pembayaran denda.
                 */
                $table->timestamp(
                    'denda_diperiksa_pada'
                )->nullable();

                $table->foreignId(
                    'denda_diperiksa_oleh'
                )
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();

                $table->index(
                    'status_pembayaran_denda'
                );

                $table->index(
                    'metode_pembayaran'
                );

                $table->index(
                    'metode_pembayaran_denda'
                );
            }
        );
    }

    /**
     * Menghapus kolom ketika migration di-rollback.
     */
    public function down(): void
    {
        Schema::table(
            'sewas',
            function (Blueprint $table): void {
                $table->dropConstrainedForeignId(
                    'pembayaran_diterima_oleh'
                );

                $table->dropConstrainedForeignId(
                    'denda_diperiksa_oleh'
                );

                $table->dropIndex([
                    'status_pembayaran_denda',
                ]);

                $table->dropIndex([
                    'metode_pembayaran',
                ]);

                $table->dropIndex([
                    'metode_pembayaran_denda',
                ]);

                $table->dropColumn([
                    'metode_pembayaran',
                    'pembayaran_diterima_pada',
                    'status_pembayaran_denda',
                    'metode_pembayaran_denda',
                    'bukti_pembayaran_denda',
                    'alasan_penolakan_pembayaran_denda',
                    'denda_dibayar_pada',
                    'denda_diperiksa_pada',
                ]);
            }
        );
    }
};
