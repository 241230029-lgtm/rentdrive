<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan data pembayaran biaya perpanjangan.
     */
    public function up(): void
    {
        Schema::table(
            'perpanjangan_sewas',
            function (Blueprint $table): void {
                /*
                 * Metode pembayaran pelanggan.
                 * Saat ini pembayaran pelanggan menggunakan transfer.
                 */
                $table
                    ->string(
                        'metode_pembayaran',
                        30
                    )
                    ->nullable()
                    ->after('status');

                /*
                 * Bukti pembayaran disimpan secara private
                 * pada disk local.
                 */
                $table
                    ->string(
                        'bukti_pembayaran'
                    )
                    ->nullable()
                    ->after('metode_pembayaran');

                /*
                 * Waktu pelanggan mengirim pembayaran.
                 */
                $table
                    ->timestamp(
                        'dibayar_pada'
                    )
                    ->nullable()
                    ->after('bukti_pembayaran');

                /*
                 * Data pemeriksaan pembayaran oleh admin.
                 */
                $table
                    ->timestamp(
                        'pembayaran_diperiksa_pada'
                    )
                    ->nullable()
                    ->after('dibayar_pada');

                $table
                    ->foreignId(
                        'pembayaran_diperiksa_oleh'
                    )
                    ->nullable()
                    ->after(
                        'pembayaran_diperiksa_pada'
                    )
                    ->constrained('users')
                    ->nullOnDelete();

                /*
                 * Diisi ketika bukti pembayaran ditolak.
                 */
                $table
                    ->text(
                        'alasan_penolakan_pembayaran'
                    )
                    ->nullable()
                    ->after(
                        'pembayaran_diperiksa_oleh'
                    );

                /*
                 * Tanggal selesai dan total harga transaksi
                 * baru diterapkan setelah pembayaran disetujui.
                 */
                $table
                    ->timestamp(
                        'diterapkan_pada'
                    )
                    ->nullable()
                    ->after(
                        'alasan_penolakan_pembayaran'
                    );

                $table->index([
                    'status',
                    'dibayar_pada',
                ]);
            }
        );

        /*
         * Pengajuan yang sebelumnya langsung dianggap
         * disetujui sekarang harus melewati pembayaran.
         *
         * Termasuk pengajuan lama yang sudah dibuat sebelum
         * alur pembayaran ini ditambahkan.
         */
        DB::table('perpanjangan_sewas')
            ->where(
                'status',
                'disetujui'
            )
            ->update([
                'status' =>
                    'menunggu_pembayaran',

                'updated_at' =>
                    now(),
            ]);
    }

    /**
     * Menghapus kolom pembayaran perpanjangan.
     */
    public function down(): void
    {
        /*
         * Mengembalikan status pembayaran menjadi status
         * lama apabila migration dibatalkan.
         */
        DB::table('perpanjangan_sewas')
            ->whereIn(
                'status',
                [
                    'menunggu_pembayaran',
                    'menunggu_verifikasi_pembayaran',
                    'pembayaran_ditolak',
                    'selesai',
                ]
            )
            ->update([
                'status' =>
                    'disetujui',

                'updated_at' =>
                    now(),
            ]);

        Schema::table(
            'perpanjangan_sewas',
            function (Blueprint $table): void {
                $table->dropIndex([
                    'status',
                    'dibayar_pada',
                ]);

                $table->dropConstrainedForeignId(
                    'pembayaran_diperiksa_oleh'
                );

                $table->dropColumn([
                    'metode_pembayaran',
                    'bukti_pembayaran',
                    'dibayar_pada',
                    'pembayaran_diperiksa_pada',
                    'alasan_penolakan_pembayaran',
                    'diterapkan_pada',
                ]);
            }
        );
    }
};
