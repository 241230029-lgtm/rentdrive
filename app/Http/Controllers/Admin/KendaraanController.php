<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreKendaraanRequest;
use App\Http\Requests\Admin\UpdateKendaraanRequest;
use App\Models\Kendaraan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class KendaraanController extends Controller
{
    /**
     * Menampilkan seluruh kendaraan untuk admin.
     */
    public function index(): Response
    {
        $kendaraans = Kendaraan::query()
            ->withCount('sewas')
            ->latest()
            ->get([
                'id',
                'nama_kendaraan',
                'merek',
                'warna',
                'tahun_pembuatan',
                'transmisi',
                'kapasitas_penumpang',
                'harga_per_hari',
                'jumlah_unit',
                'foto_kendaraan',
                'fasilitas',
                'deskripsi_kendaraan',
                'plat_nomor',
                'status',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render(
            'Admin/KelolaKendaraan',
            [
                'kendaraans' =>
                    $kendaraans,
            ]
        );
    }

    /**
     * Menyimpan kendaraan baru.
     */
    public function store(
        StoreKendaraanRequest $request
    ): RedirectResponse {
        $data = $request->validated();

        unset(
            $data['foto_kendaraan']
        );

        $fotoBaru = null;

        if (
            $request->hasFile(
                'foto_kendaraan'
            )
        ) {
            $fotoBaru = $request
                ->file('foto_kendaraan')
                ->store(
                    'kendaraan',
                    'public'
                );

            $data['foto_kendaraan'] =
                $fotoBaru;
        }

        try {
            Kendaraan::create($data);
        } catch (Throwable $exception) {
            if ($fotoBaru !== null) {
                Storage::disk('public')
                    ->delete($fotoBaru);
            }

            throw $exception;
        }

        return back()->with(
            'success',
            'Data kendaraan berhasil ditambahkan.'
        );
    }

    /**
     * Memperbarui kendaraan.
     */
    public function update(
        UpdateKendaraanRequest $request,
        int $id
    ): RedirectResponse {
        $kendaraan = Kendaraan::query()
            ->findOrFail($id);

        $data = $request->validated();

        unset(
            $data['foto_kendaraan']
        );

        $fotoLama =
            $kendaraan->foto_kendaraan;

        $fotoBaru = null;

        if (
            $request->hasFile(
                'foto_kendaraan'
            )
        ) {
            $fotoBaru = $request
                ->file('foto_kendaraan')
                ->store(
                    'kendaraan',
                    'public'
                );

            $data['foto_kendaraan'] =
                $fotoBaru;
        }

        try {
            $kendaraan->update($data);
        } catch (Throwable $exception) {
            if ($fotoBaru !== null) {
                Storage::disk('public')
                    ->delete($fotoBaru);
            }

            throw $exception;
        }

        if (
            $fotoBaru !== null &&
            $fotoLama !== null &&
            Storage::disk('public')
                ->exists($fotoLama)
        ) {
            Storage::disk('public')
                ->delete($fotoLama);
        }

        return back()->with(
            'success',
            'Data kendaraan berhasil diperbarui.'
        );
    }

    /**
     * Menghapus kendaraan yang belum memiliki transaksi.
     *
     * Kendaraan yang sudah memiliki riwayat transaksi
     * tidak dihapus agar integritas data tetap terjaga.
     * Kendaraan tersebut akan dinonaktifkan.
     */
    public function destroy(
        int $id
    ): RedirectResponse {
        $kendaraan = Kendaraan::query()
            ->findOrFail($id);

        if (
            $kendaraan
                ->sewas()
                ->exists()
        ) {
            $kendaraan->update([
                'status' =>
                    'tidak_aktif',
            ]);

            return back()->with(
                'success',
                'Kendaraan memiliki riwayat transaksi sehingga tidak dihapus. Status kendaraan berhasil dinonaktifkan.'
            );
        }

        $fotoKendaraan =
            $kendaraan->foto_kendaraan;

        $kendaraan->delete();

        if (
            $fotoKendaraan !== null &&
            Storage::disk('public')
                ->exists($fotoKendaraan)
        ) {
            Storage::disk('public')
                ->delete($fotoKendaraan);
        }

        return back()->with(
            'success',
            'Data kendaraan berhasil dihapus.'
        );
    }
}
