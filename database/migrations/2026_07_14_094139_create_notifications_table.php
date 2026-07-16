<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Membuat tabel penyimpanan notifikasi.
     *
     * Tabel ini menggunakan sistem notifikasi bawaan Laravel.
     * Notifikasi dapat diterima oleh pelanggan, admin, maupun owner.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            /*
             * Laravel menggunakan UUID sebagai ID notifikasi.
             */
            $table->uuid('id')->primary();

            /*
             * Menyimpan nama class notifikasi.
             */
            $table->string('type');

            /*
             * Menentukan pengguna penerima notifikasi.
             *
             * Kolom yang dibuat:
             * - notifiable_type
             * - notifiable_id
             */
            $table->morphs('notifiable');

            /*
             * Menyimpan judul, pesan, tautan, jenis notifikasi,
             * nomor booking, dan informasi pendukung lainnya.
             */
            $table->text('data');

            /*
             * Null berarti notifikasi belum dibaca.
             * Berisi waktu berarti notifikasi sudah dibaca.
             */
            $table->timestamp('read_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Menghapus tabel notifikasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
