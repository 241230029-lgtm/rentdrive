<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Membuat tabel identitas untuk setiap transaksi sewa.
     *
     * Setiap booking mempunyai dokumen KTP dan SIM sendiri,
     * sehingga dokumen booking sebelumnya tidak digunakan
     * secara otomatis pada booking berikutnya.
     */
    public function up(): void
    {
        Schema::create(
            'identitas_sewas',
            function (Blueprint $table): void {
                $table->id();

                $table->foreignId('sewa_id')
                    ->unique()
                    ->constrained('sewas')
                    ->cascadeOnDelete();

                /*
                 * Data pengguna kendaraan.
                 * Pengguna kendaraan dapat berbeda dari
                 * pemilik akun yang melakukan booking.
                 */
                $table->string(
                    'nama_pengguna',
                    150
                );

                $table->string(
                    'nik',
                    30
                );

                $table->string(
                    'nomor_sim',
                    50
                );

                $table->string(
                    'no_telepon',
                    30
                );

                $table->text('alamat');

                /*
                 * Dokumen disimpan pada disk local/private.
                 */
                $table->string(
                    'dokumen_ktp'
                );

                $table->string(
                    'dokumen_sim'
                );

                /*
                 * Status:
                 * - menunggu_verifikasi
                 * - terverifikasi
                 * - ditolak
                 */
                $table->string(
                    'status_verifikasi',
                    40
                )->default(
                    'menunggu_verifikasi'
                );

                $table->timestamp(
                    'dikirim_pada'
                )->nullable();

                $table->timestamp(
                    'diperiksa_pada'
                )->nullable();

                $table->foreignId(
                    'diperiksa_oleh'
                )
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();

                $table->text(
                    'alasan_penolakan'
                )->nullable();

                $table->timestamps();

                $table->index(
                    'status_verifikasi'
                );

                $table->index(
                    'dikirim_pada'
                );
            }
        );
    }

    /**
     * Menghapus tabel ketika migration di-rollback.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'identitas_sewas'
        );
    }
};
