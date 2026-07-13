<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan detail penolakan dan memperluas status transaksi.
     */
    public function up(): void
    {
        Schema::table('sewas', function (Blueprint $table) {
            $table
                ->string('jenis_penolakan')
                ->nullable()
                ->after('alasan_penolakan');

            $table
                ->string('kategori_penolakan')
                ->nullable()
                ->after('jenis_penolakan');

            $table
                ->foreignId('ditolak_oleh')
                ->nullable()
                ->after('kategori_penolakan')
                ->constrained('users')
                ->nullOnDelete();

            $table
                ->timestamp('ditolak_pada')
                ->nullable()
                ->after('ditolak_oleh');
        });

        /*
         * Sintaks ALTER TABLE MODIFY ENUM hanya didukung MySQL.
         *
         * Pengujian Laravel menggunakan SQLite in-memory,
         * sehingga perubahan ENUM harus dilewati saat driver
         * database yang digunakan bukan MySQL.
         */
        if (
            DB::connection()->getDriverName() ===
            'mysql'
        ) {
            DB::statement(<<<'SQL'
                ALTER TABLE `sewas`
                MODIFY `status` ENUM(
                    'menunggu_konfirmasi_admin',
                    'ditolak_booking',
                    'menunggu_pembayaran',
                    'menunggu_verifikasi_pembayaran',
                    'ditolak_pembayaran',
                    'disetujui_operasional',
                    'sedang_berlangsung',
                    'menunggu_verifikasi_pengembalian',
                    'selesai',
                    'dibatalkan'
                )
                NOT NULL
                DEFAULT 'menunggu_konfirmasi_admin'
            SQL);
        }
    }

    /**
     * Mengembalikan struktur tabel ke kondisi sebelum migration.
     */
    public function down(): void
    {
        /*
         * Status tambahan dikonversi terlebih dahulu menjadi
         * status lama sebelum definisi ENUM dipulihkan.
         */
        DB::table('sewas')
            ->whereIn('status', [
                'menunggu_konfirmasi_admin',
                'ditolak_booking',
            ])
            ->update([
                'status' =>
                    'dibatalkan',
            ]);

        /*
         * Pemulihan ENUM hanya dijalankan pada MySQL.
         * SQLite tidak mendukung ALTER TABLE MODIFY ENUM.
         */
        if (
            DB::connection()->getDriverName() ===
            'mysql'
        ) {
            DB::statement(<<<'SQL'
                ALTER TABLE `sewas`
                MODIFY `status` ENUM(
                    'menunggu_pembayaran',
                    'menunggu_verifikasi_pembayaran',
                    'ditolak_pembayaran',
                    'disetujui_operasional',
                    'sedang_berlangsung',
                    'menunggu_verifikasi_pengembalian',
                    'selesai',
                    'dibatalkan'
                )
                NOT NULL
                DEFAULT 'menunggu_pembayaran'
            SQL);
        }

        Schema::table('sewas', function (Blueprint $table) {
            $table->dropConstrainedForeignId(
                'ditolak_oleh'
            );

            $table->dropColumn([
                'jenis_penolakan',
                'kategori_penolakan',
                'ditolak_pada',
            ]);
        });
    }
};
