<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\StoreIdentitasRequest;
use App\Models\IdentitasSewa;
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
use Throwable;

class IdentitasController extends Controller
{
    /**
     * Menampilkan identitas khusus satu transaksi.
     */
    public function show(
        Request $request,
        int $sewaId
    ): Response|RedirectResponse {
        $user = $request->user();

        $sewa = Sewa::query()
            ->with([
                'kendaraan:id,nama_kendaraan,merek,foto_kendaraan',
                'identitasSewa',
            ])
            ->whereKey($sewaId)
            ->where(
                'user_id',
                $user->id
            )
            ->firstOrFail();

        if (
            ! in_array(
                $sewa->status,
                [
                    'menunggu_identitas',
                    'identitas_ditolak',
                    'menunggu_verifikasi_identitas',
                ],
                true
            )
        ) {
            return redirect()
                ->route(
                    'pelanggan.riwayat'
                )
                ->with(
                    'error',
                    'Transaksi ini tidak sedang berada pada tahap verifikasi identitas.'
                );
        }

        $identitas =
            $sewa->identitasSewa;

        return Inertia::render(
            'Pelanggan/Identitas',
            [
                'sewa' => [
                    'id' =>
                        $sewa->id,

                    'nomor_booking' =>
                        $sewa->nomor_booking,

                    'status' =>
                        $sewa->status,

                    'tanggal_mulai' =>
                        $sewa->tanggal_mulai
                            ?->format('Y-m-d'),

                    'tanggal_selesai' =>
                        $sewa->tanggal_selesai
                            ?->format('Y-m-d'),

                    'total_harga' =>
                        (int) $sewa->total_harga,

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
                 * Identitas berasal dari booking ini,
                 * bukan dari akun pelanggan.
                 */
                'identitas' => [
                    'nama_pengguna' =>
                        $identitas
                            ?->nama_pengguna,

                    'nik' =>
                        $identitas
                            ?->nik,

                    'nomor_sim' =>
                        $identitas
                            ?->nomor_sim,

                    'no_telepon' =>
                        $identitas
                            ?->no_telepon,

                    'alamat' =>
                        $identitas
                            ?->alamat,

                    'status' =>
                        $identitas
                            ?->status_verifikasi
                        ?? 'belum_dilengkapi',

                    'memiliki_ktp' =>
                        filled(
                            $identitas
                                ?->dokumen_ktp
                        ),

                    'memiliki_sim' =>
                        filled(
                            $identitas
                                ?->dokumen_sim
                        ),

                    'alasan_penolakan' =>
                        $identitas
                            ?->alasan_penolakan,

                    'dikirim_pada' =>
                        $identitas
                            ?->dikirim_pada
                            ?->toIso8601String(),

                    'diperiksa_pada' =>
                        $identitas
                            ?->diperiksa_pada
                            ?->toIso8601String(),
                ],

                'boleh_mengirim' =>
                    in_array(
                        $sewa->status,
                        [
                            'menunggu_identitas',
                            'identitas_ditolak',
                        ],
                        true
                    ),
            ]
        );
    }

    /**
     * Menyimpan identitas khusus satu transaksi.
     */
    public function store(
        StoreIdentitasRequest $request,
        int $sewaId
    ): RedirectResponse {
        $data = $request->validated();

        $user = $request->user();

        $pathKtpBaru = null;
        $pathSimBaru = null;

        $pathKtpLama = null;
        $pathSimLama = null;

        try {
            /*
             * Dokumen disimpan pada disk privat.
             */
            if (
                $request->hasFile(
                    'dokumen_ktp'
                )
            ) {
                $pathKtpBaru = $request
                    ->file('dokumen_ktp')
                    ->store(
                        'dokumen_identitas/sewa/'
                        . $sewaId
                        . '/ktp',
                        'local'
                    );
            }

            if (
                $request->hasFile(
                    'dokumen_sim'
                )
            ) {
                $pathSimBaru = $request
                    ->file('dokumen_sim')
                    ->store(
                        'dokumen_identitas/sewa/'
                        . $sewaId
                        . '/sim',
                        'local'
                    );
            }

            $hasil = DB::transaction(
                function () use (
                    $user,
                    $sewaId,
                    $data,
                    $pathKtpBaru,
                    $pathSimBaru,
                    &$pathKtpLama,
                    &$pathSimLama
                ): array {
                    $sewa = Sewa::query()
                        ->with([
                            'kendaraan:id,nama_kendaraan,merek',
                        ])
                        ->whereKey($sewaId)
                        ->where(
                            'user_id',
                            $user->id
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                    if (
                        ! in_array(
                            $sewa->status,
                            [
                                'menunggu_identitas',
                                'identitas_ditolak',
                            ],
                            true
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'identitas' =>
                                'Identitas tidak dapat dikirim pada status transaksi ini.',
                        ]);
                    }

                    $identitas =
                        IdentitasSewa::query()
                            ->where(
                                'sewa_id',
                                $sewa->id
                            )
                            ->lockForUpdate()
                            ->first();

                    $pathKtpLama =
                        $identitas
                            ?->dokumen_ktp;

                    $pathSimLama =
                        $identitas
                            ?->dokumen_sim;

                    $pathKtpYangDisimpan =
                        $pathKtpBaru
                        ?? $pathKtpLama;

                    $pathSimYangDisimpan =
                        $pathSimBaru
                        ?? $pathSimLama;

                    if (
                        blank(
                            $pathKtpYangDisimpan
                        ) ||
                        blank(
                            $pathSimYangDisimpan
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'identitas' =>
                                'Foto KTP dan SIM wajib dilengkapi untuk booking ini.',
                        ]);
                    }

                    $payload = [
                        'nama_pengguna' =>
                            $data['nama_pengguna'],

                        'nik' =>
                            $data['nik'],

                        'nomor_sim' =>
                            $data['nomor_sim'],

                        'no_telepon' =>
                            $data['no_telepon'],

                        'alamat' =>
                            $data['alamat'],

                        'dokumen_ktp' =>
                            $pathKtpYangDisimpan,

                        'dokumen_sim' =>
                            $pathSimYangDisimpan,

                        'status_verifikasi' =>
                            IdentitasSewa::STATUS_MENUNGGU_VERIFIKASI,

                        'dikirim_pada' =>
                            now(),

                        'diperiksa_pada' =>
                            null,

                        'diperiksa_oleh' =>
                            null,

                        'alasan_penolakan' =>
                            null,
                    ];

                    if ($identitas) {
                        $identitas->update(
                            $payload
                        );
                    } else {
                        $identitas =
                            $sewa
                                ->identitasSewa()
                                ->create(
                                    $payload
                                );
                    }

                    /*
                     * Hanya booking yang sedang diproses
                     * yang berubah status.
                     */
                    $sewa->update([
                        'status' =>
                            'menunggu_verifikasi_identitas',
                    ]);

                    $sewa->refresh();

                    return [
                        'sewa' =>
                            $sewa,

                        'identitas' =>
                            $identitas,
                    ];
                }
            );
        } catch (Throwable $exception) {
            if ($pathKtpBaru) {
                Storage::disk('local')
                    ->delete(
                        $pathKtpBaru
                    );
            }

            if ($pathSimBaru) {
                Storage::disk('local')
                    ->delete(
                        $pathSimBaru
                    );
            }

            throw $exception;
        }

        /*
         * Hapus dokumen lama setelah database
         * berhasil diperbarui.
         */
        if (
            $pathKtpBaru &&
            $pathKtpLama &&
            $pathKtpBaru !==
                $pathKtpLama
        ) {
            Storage::disk('local')
                ->delete(
                    $pathKtpLama
                );
        }

        if (
            $pathSimBaru &&
            $pathSimLama &&
            $pathSimBaru !==
                $pathSimLama
        ) {
            Storage::disk('local')
                ->delete(
                    $pathSimLama
                );
        }

        /** @var Sewa $sewa */
        $sewa = $hasil['sewa'];

        /** @var IdentitasSewa $identitas */
        $identitas = $hasil['identitas'];

        /*
         * Beri tahu admin bahwa satu booking
         * membutuhkan pemeriksaan identitas.
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
                        'Identitas Booking Perlu Diverifikasi',

                    pesan:
                        $identitas
                            ->nama_pengguna
                        . ' telah mengirim identitas untuk booking '
                        . $sewa
                            ->nomor_booking
                        . '.',

                    jenis:
                        'identitas_baru',

                    url:
                        '/admin/identitas?sewa='
                        . $sewa->id,

                    sewaId:
                        $sewa->id,

                    nomorBooking:
                        $sewa->nomor_booking,

                    dataTambahan: [
                        'nama_pelanggan' =>
                            $user->name,

                        'nama_pengguna' =>
                            $identitas
                                ->nama_pengguna,

                        'status_baru' =>
                            'menunggu_verifikasi_identitas',

                        'kendaraan' =>
                            $sewa->kendaraan
                                ?->nama_kendaraan,
                    ],
                )
            );
        }

        return redirect()
            ->route(
                'pelanggan.identitas.show',
                $sewa->id
            )
            ->with(
                'success',
                'Identitas booking berhasil dikirim dan sedang menunggu pemeriksaan admin.'
            );
    }
}
