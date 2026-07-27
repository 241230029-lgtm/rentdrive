<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sewas', function (Blueprint $table) {
            $table->id();

            $table->string('nomor_booking')->unique();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('kendaraan_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('jenis_booking', 20)
                ->default('online');

            // Waktu kontrak dan biaya utama
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->integer('total_harga');

            $table->string('bukti_pembayaran')->nullable();

            // Data pengembalian aktual
            $table->date('tanggal_kembali_aktual')->nullable();

            $table->text('kondisi_kendaraan_kembali')->nullable();

            $table->string('foto_kondisi_kembali')->nullable();

            $table->integer('kilometer_kembali')->nullable();

            $table->integer('denda_keterlambatan')->default(0);

            $table->integer('denda_kerusakan')->default(0);

            $table->integer('total_denda')->default(0);

            $table->text('alasan_penolakan')->nullable();

            /*
             * Menggunakan string agar kompatibel
             * dengan SQLite dan MySQL.
             */
            $table->string('status', 80)
                ->default('menunggu_konfirmasi_admin');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sewas');
    }
};
