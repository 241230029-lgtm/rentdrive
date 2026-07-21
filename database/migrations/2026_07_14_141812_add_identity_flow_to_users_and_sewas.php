<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status_identitas', 40)->default('belum_dilengkapi');
            $table->timestamp('identitas_dikirim_pada')->nullable();
            $table->timestamp('identitas_diperiksa_pada')->nullable();

            $table->foreignId('identitas_diperiksa_oleh')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('alasan_penolakan_identitas')->nullable();
        });

        // Ubah ENUM menjadi VARCHAR
        DB::statement("
            ALTER TABLE sewas
            MODIFY status VARCHAR(80)
            NOT NULL
            DEFAULT 'menunggu_konfirmasi_admin'
        ");
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('identitas_diperiksa_oleh');

            $table->dropColumn([
                'status_identitas',
                'identitas_dikirim_pada',
                'identitas_diperiksa_pada',
                'alasan_penolakan_identitas',
            ]);
        });

        DB::statement("
            ALTER TABLE sewas
            MODIFY status ENUM(
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
        ");
    }
};