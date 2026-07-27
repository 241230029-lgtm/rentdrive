<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menghapus nomor NIK dan nomor SIM karena data tersebut
     * tidak lagi digunakan pada identitas pelanggan maupun admin.
     */
    public function up(): void
    {
        $kolomDihapus = array_values(array_filter([
            Schema::hasColumn('identitas_sewas', 'nik')
                ? 'nik'
                : null,
            Schema::hasColumn('identitas_sewas', 'nomor_sim')
                ? 'nomor_sim'
                : null,
        ]));

        if ($kolomDihapus === []) {
            return;
        }

        Schema::table(
            'identitas_sewas',
            function (Blueprint $table) use ($kolomDihapus): void {
                $table->dropColumn($kolomDihapus);
            }
        );
    }

    /**
     * Mengembalikan kolom ketika migration di-rollback.
     */
    public function down(): void
    {
        $tambahNik = ! Schema::hasColumn(
            'identitas_sewas',
            'nik'
        );

        $tambahNomorSim = ! Schema::hasColumn(
            'identitas_sewas',
            'nomor_sim'
        );

        if (! $tambahNik && ! $tambahNomorSim) {
            return;
        }

        Schema::table(
            'identitas_sewas',
            function (Blueprint $table) use (
                $tambahNik,
                $tambahNomorSim
            ): void {
                if ($tambahNik) {
                    $table->string('nik', 30)->nullable();
                }

                if ($tambahNomorSim) {
                    $table->string('nomor_sim', 50)->nullable();
                }
            }
        );
    }
};
