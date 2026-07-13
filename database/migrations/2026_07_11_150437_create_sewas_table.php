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
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('kendaraan_id')->constrained()->onDelete('cascade');
        $table->enum('jenis_booking', ['online', 'walk_in'])->default('online');

        // Logika Waktu kontrak & Biaya Utama
        $table->date('tanggal_mulai');
        $table->date('tanggal_selesai');
        $table->integer('total_harga');
        $table->string('bukti_pembayaran')->nullable(); // Dummy payment file

        // Data Pengembalian Aktual (Pemeriksaan Lapangan oleh Admin)
        $table->date('tanggal_kembali_aktual')->nullable();
        $table->text('kondisi_kendaraan_kembali')->nullable();
        $table->string('foto_kondisi_kembali')->nullable();
        $table->integer('kilometer_kembali')->nullable();
        $table->integer('denda_keterlambatan')->default(0);
        $table->integer('denda_kerusakan')->default(0);
        $table->integer('total_denda')->default(0);
        $table->text('alasan_penolakan')->nullable(); // Jika Admin menolak transaksi

        // Alur Kendali Status Terintegrasi (RBAC)
        $table->enum('status', [
            'menunggu_pembayaran',
            'menunggu_verifikasi_pembayaran',
            'ditolak_pembayaran',
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
            'selesai',
            'dibatalkan'
        ])->default('menunggu_pembayaran');

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
