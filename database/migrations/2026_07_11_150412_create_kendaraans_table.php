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
    Schema::create('kendaraans', function (Blueprint $table) {
        $table->id();
        $table->string('nama_kendaraan');
        $table->string('merek');
        $table->string('warna');
        $table->year('tahun_pembuatan');
        $table->enum('transmisi', ['manual', 'otomatis']);
        $table->integer('kapasitas_penumpang');
        $table->integer('harga_per_hari');
        $table->integer('jumlah_unit')->default(1); // Melacak kapasitas/stok multi-unit
        $table->string('foto_kendaraan')->nullable();
        $table->text('fasilitas')->nullable();
        $table->text('deskripsi_kendaraan')->nullable();
        $table->string('plat_nomor')->unique(); // Kebutuhan internal Admin/Owner
        // Status internal operasional backend
        $table->enum('status', ['tersedia', 'perbaikan', 'tidak_aktif'])->default('tersedia');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kendaraans');
    }
};
