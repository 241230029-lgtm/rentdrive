<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan alur verifikasi identitas pelanggan.
     *
     * Dokumen identitas baru diminta setelah booking
     * mendapatkan persetujuan awal dari admin.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('status_identitas', 40)
                ->default('belum_dilengkapi');

            $table->timestamp('identitas_dikirim_pada')
                ->nullable();

            $table->timestamp('identitas_diperiksa_pada')
                ->nullable();

            $table->foreignId('identitas_diperiksa_oleh')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('alasan_penolakan_identitas')
                ->nullable();
        });

        /*
         * Mengubah status sewa menjadi string.
         *
         * Ini diperlukan agar status baru seperti:
         * - menunggu_identitas
         * - menunggu_verifikasi_identitas
         * - identitas_ditolak
         *
         * dapat digunakan pada SQLite maupun MySQL.
         */
        $this->ubahStatusSewaMenjadiString();
    }

    /**
     * Menghapus penambahan ketika migration di-rollback.
     */
    public function down(): void
    {
        /*
         * Kembalikan status identitas ke status pembayaran
         * agar tidak ada status yang kehilangan konteks.
         */
        DB::table('sewas')
            ->whereIn('status', [
                'menunggu_identitas',
                'menunggu_verifikasi_identitas',
                'identitas_ditolak',
            ])
            ->update([
                'status' => 'menunggu_pembayaran',
            ]);

        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId(
                'identitas_diperiksa_oleh'
            );

            $table->dropColumn([
                'status_identitas',
                'identitas_dikirim_pada',
                'identitas_diperiksa_pada',
                'alasan_penolakan_identitas',
            ]);
        });
    }

    /**
     * Mengganti kolom status dari ENUM menjadi VARCHAR
     * tanpa menghilangkan nilai status yang sudah tersimpan.
     */
    private function ubahStatusSewaMenjadiString(): void
    {
        if (! Schema::hasTable('sewas')) {
            return;
        }

        if (! Schema::hasColumn('sewas', 'status')) {
            return;
        }

        /*
         * Mencegah proses dijalankan ulang apabila kolom
         * sementara masih tersedia.
         */
        if (
            Schema::hasColumn(
                'sewas',
                'status_sebelum_identitas'
            )
        ) {
            return;
        }

        Schema::table('sewas', function (Blueprint $table): void {
            $table->renameColumn(
                'status',
                'status_sebelum_identitas'
            );
        });

        Schema::table('sewas', function (Blueprint $table): void {
            $table->string('status', 80)
                ->default('menunggu_konfirmasi_admin');
        });

        /*
         * Salin semua status lama ke kolom status baru.
         */
        DB::table('sewas')->update([
            'status' => DB::raw(
                'status_sebelum_identitas'
            ),
        ]);

        Schema::table('sewas', function (Blueprint $table): void {
            $table->dropColumn(
                'status_sebelum_identitas'
            );
        });
    }
};
