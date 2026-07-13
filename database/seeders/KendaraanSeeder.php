<?php

namespace Database\Seeders;

use App\Models\Kendaraan;
use Illuminate\Database\Seeder;

class KendaraanSeeder extends Seeder
{
    public function run(): void
    {
        // Data Dummy Mobil
        Kendaraan::create([
            'nama_kendaraan' => 'Avanza Veloz',
            'merek' => 'Toyota',
            'warna' => 'Hitam Metalik',
            'tahun_pembuatan' => 2023,
            'transmisi' => 'otomatis',
            'kapasitas_penumpang' => 7,
            'harga_per_hari' => 400000,
            'jumlah_unit' => 3, // Logika multi-unit: Ada 3 unit Avanza tersedia
            'foto_kendaraan' => 'avanza.jpg',
            'fasilitas' => 'AC Double Blower, Airbag, Bluetooth Audio, Charger USB',
            'deskripsi_kendaraan' => 'Mobil keluarga yang sangat nyaman, irit bahan bakar, dan cocok untuk perjalanan jauh maupun dalam kota.',
            'plat_nomor' => 'KB 1234 AA',
            'status' => 'tersedia',
        ]);

        // Data Dummy Motor
        Kendaraan::create([
            'nama_kendaraan' => 'Vario 160 CC',
            'merek' => 'Honda',
            'warna' => 'Putih Matte',
            'tahun_pembuatan' => 2024,
            'transmisi' => 'otomatis',
            'kapasitas_penumpang' => 2,
            'harga_per_hari' => 90000,
            'jumlah_unit' => 5, // Logika multi-unit: Ada 5 unit Vario tersedia
            'foto_kendaraan' => 'vario.jpg',
            'fasilitas' => 'Keyless System, Bagasi Luas, Rem CBS, Charger HP',
            'deskripsi_kendaraan' => 'Motor matic bertenaga besar, lincah untuk membelah kemacetan kota, dan sangat hemat bahan bakar.',
            'plat_nomor' => 'KB 5678 BB',
            'status' => 'tersedia',
        ]);
    }
}
