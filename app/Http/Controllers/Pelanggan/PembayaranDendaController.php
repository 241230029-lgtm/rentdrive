<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\StorePembayaranDendaRequest;
use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Models\User;
use App\Notifications\NotifikasiTransaksi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class PembayaranDendaController extends Controller
{
    /**
     * Menampilkan halaman pembayaran denda.
     */
    public function show(
        Request $request,
        int $id
    ): Response|RedirectResponse {
        $sewa = Sewa::query()
            ->with([
                'kendaraan:id,nama_kendaraan,merek,foto_kendaraan',
            ])
            ->where(
                'id',
                $id
            )
            ->where(
                'user_id',
                $request->user()->id
            )
            ->firstOrFail();

        if ((int) $sewa->total_denda <= 0) {
            return redirect()
                ->route(
                    'pelanggan.riwayat'
                )
                ->with(
                    'error',
                    'Transaksi ini tidak memiliki tagihan denda.'
                );
        }

        /*
         * Normalisasi transaksi lama yang sudah memiliki
         * denda tetapi status pembayarannya masih tidak_ada.
         */
        if (
            blank(
                $sewa->status_pembayaran_denda
            )
            || $sewa->status_pembayaran_denda ===
                Sewa::DENDA_TIDAK_ADA
        ) {
            $sewa->update([
                'status_pembayaran_denda' =>
                    Sewa::DENDA_BELUM_DIBAYAR,
            ]);

            $sewa->refresh();
        }

        return Inertia::render(
            'Pelanggan/PembayaranDenda',
            [
                'sewa' => [
                    'id' =>
                        $sewa->id,

                    'nomor_booking' =>
                        $sewa->nomor_booking,

                    'tanggal_mulai' =>
                        $sewa->tanggal_mulai
                            ?->format('Y-m-d'),

                    'tanggal_selesai' =>
                        $sewa->tanggal_selesai
                            ?->format('Y-m-d'),

                    'tanggal_kembali_aktual' =>
                        $sewa->tanggal_kembali_aktual
                            ?->format('Y-m-d'),

                    'denda_keterlambatan' =>
                        (int) $sewa
                            ->denda_keterlambatan,

                    'denda_kerusakan' =>
                        (int) $sewa
                            ->denda_kerusakan,

                    'total_denda' =>
                        (int) $sewa
                            ->total_denda,

                    'status_pembayaran_denda' =>
                        $sewa
                            ->status_pembayaran_denda,

                    'metode_pembayaran_denda' =>
                        $sewa
                            ->metode_pembayaran_denda,

                    'memiliki_bukti_pembayaran' =>
                        filled(
                            $sewa
                                ->bukti_pembayaran_denda
                        ),

                    'alasan_penolakan' =>
                        $sewa
                            ->alasan_penolakan_pembayaran_denda,

                    'denda_dibayar_pada' =>
                        $sewa->denda_dibayar_pada
                            ?->toIso8601String(),

                    'denda_diperiksa_pada' =>
                        $sewa->denda_diperiksa_pada
                            ?->toIso8601String(),

                    'kendaraan' =>
                        $sewa->kendaraan
                            ? [
                                'id' =>
                                    $sewa
                                        ->kendaraan
                                        ->id,

                                'nama_kendaraan' =>
                                    $sewa
                                        ->kendaraan
                                        ->nama_kendaraan,

                                'merek' =>
                                    $sewa
                                        ->kendaraan
                                        ->merek,

                                'foto_kendaraan' =>
                                    $sewa
                                        ->kendaraan
                                        ->foto_kendaraan,
                            ]
                            : null,
                ],

                /*
                 * Pembayaran pelanggan dilakukan melalui
                 * transfer dan diverifikasi admin.
                 */
                'rekening' => [
                    'bank' =>
                        'BANK DEMO',

                    'nomor_rekening' =>
                        '1234567890',

                    'nama_penerima' =>
                        'RENTDRIVE DEMO',
                ],

                'boleh_membayar' =>
                    in_array(
                        $sewa
                            ->status_pembayaran_denda,
                        [
                            Sewa::DENDA_BELUM_DIBAYAR,
                            Sewa::DENDA_DITOLAK,
                        ],
                        true
                    ),
            ]
        );
    }

    /**
     * Menyimpan bukti pembayaran denda pelanggan.
     */
    public function store(
        StorePembayaranDendaRequest $request,
        int $id
    ): RedirectResponse {
        $data =
            $request->validated();

        $pathBaru = null;
        $pathLama = null;

        try {
            $pathBaru = $request
                ->file(
                    'bukti_pembayaran_denda'
                )
                ->store(
                    'pembayaran_denda/sewa/'
                    . $id,
                    'local'
                );

            $sewa = DB::transaction(
                function () use (
                    $request,
                    $id,
                    $data,
                    $pathBaru,
                    &$pathLama
                ): Sewa {
                    $sewa = Sewa::query()
                        ->with([
                            'kendaraan:id,nama_kendaraan,merek',
                        ])
                        ->where(
                            'id',
                            $id
                        )
                        ->where(
                            'user_id',
                            $request
                                ->user()
                                ->id
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                    if (
                        (int) $sewa
                            ->total_denda <= 0
                    ) {
                        throw ValidationException::withMessages([
                            'pembayaran_denda' =>
                                'Transaksi ini tidak memiliki tagihan denda.',
                        ]);
                    }

                    if (
                        ! in_array(
                            $sewa
                                ->status_pembayaran_denda,
                            [
                                Sewa::DENDA_BELUM_DIBAYAR,
                                Sewa::DENDA_DITOLAK,
                            ],
                            true
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'pembayaran_denda' =>
                                'Pembayaran denda tidak dapat dikirim pada status saat ini.',
                        ]);
                    }

                    $pathLama =
                        $sewa
                            ->bukti_pembayaran_denda;

                    $sewa->update([
                        'metode_pembayaran_denda' =>
                            $data[
                                'metode_pembayaran_denda'
                            ],

                        'bukti_pembayaran_denda' =>
                            $pathBaru,

                        'status_pembayaran_denda' =>
                            Sewa::DENDA_MENUNGGU_VERIFIKASI,

                        'alasan_penolakan_pembayaran_denda' =>
                            null,

                        'denda_dibayar_pada' =>
                            now(),

                        'denda_diperiksa_pada' =>
                            null,

                        'denda_diperiksa_oleh' =>
                            null,
                    ]);

                    LogAktivitas::query()->create([
                        'user_id' =>
                            $request
                                ->user()
                                ->id,

                        'jenis_aktivitas' =>
                            'Pembayaran Denda Dikirim',

                        'deskripsi' =>
                            'Pelanggan mengirim bukti pembayaran denda untuk booking '
                            . $sewa
                                ->nomor_booking
                            . ' sebesar Rp'
                            . number_format(
                                (int) $sewa
                                    ->total_denda,
                                0,
                                ',',
                                '.'
                            )
                            . '.',

                        'alamat_ip' =>
                            $request->ip(),
                    ]);

                    return $sewa->fresh([
                        'kendaraan',
                    ]);
                }
            );
        } catch (Throwable $exception) {
            if ($pathBaru) {
                Storage::disk('local')
                    ->delete(
                        $pathBaru
                    );
            }

            throw $exception;
        }

        /*
         * Bukti lama baru dihapus setelah database berhasil.
         */
        if (
            $pathLama
            && $pathLama !== $pathBaru
        ) {
            Storage::disk('local')
                ->delete(
                    $pathLama
                );
        }

        /*
         * Mengirim notifikasi kepada seluruh admin.
         */
        $daftarAdmin = User::query()
            ->where(
                'role',
                'admin'
            )
            ->get();

        if (
            $daftarAdmin->isNotEmpty()
        ) {
            Notification::send(
                $daftarAdmin,
                new NotifikasiTransaksi(
                    judul:
                        'Pembayaran Denda Baru',

                    pesan:
                        $request->user()->name
                        . ' mengirim pembayaran denda untuk booking '
                        . $sewa->nomor_booking
                        . ' sebesar Rp'
                        . number_format(
                            (int) $sewa
                                ->total_denda,
                            0,
                            ',',
                            '.'
                        )
                        . '.',

                    jenis:
                        'pembayaran_denda_baru',

                    url:
                        '/admin/denda?sewa='
                        . $sewa->id,

                    sewaId:
                        $sewa->id,

                    nomorBooking:
                        $sewa->nomor_booking,

                    dataTambahan: [
                        'nama_pelanggan' =>
                            $request
                                ->user()
                                ->name,

                        'kendaraan' =>
                            $sewa->kendaraan
                                ?->nama_kendaraan,

                        'total_denda' =>
                            (int) $sewa
                                ->total_denda,

                        'status_baru' =>
                            Sewa::DENDA_MENUNGGU_VERIFIKASI,
                    ],
                )
            );
        }

        return redirect()
            ->route(
                'pelanggan.denda.show',
                $sewa->id
            )
            ->with(
                'success',
                'Bukti pembayaran denda berhasil dikirim dan sedang menunggu verifikasi admin.'
            );
    }

    /**
     * Menampilkan bukti pembayaran denda secara private.
     */
    public function bukti(
        Request $request,
        int $id
    ): BinaryFileResponse {
        $sewa = Sewa::query()
            ->where(
                'id',
                $id
            )
            ->where(
                'user_id',
                $request->user()->id
            )
            ->firstOrFail();

        $path =
            $sewa
                ->bukti_pembayaran_denda;

        abort_if(
            blank($path),
            404,
            'Bukti pembayaran belum tersedia.'
        );

        abort_unless(
            Storage::disk('local')
                ->exists($path),
            404,
            'File bukti pembayaran tidak ditemukan.'
        );

        return response()->file(
            Storage::disk('local')
                ->path($path)
        );
    }
}
