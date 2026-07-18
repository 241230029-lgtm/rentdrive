<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VerifikasiIdentitasRequest;
use App\Models\IdentitasSewa;
use App\Models\LogAktivitas;
use App\Models\Sewa;
use App\Notifications\NotifikasiTransaksi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class IdentitasController extends Controller
{
    /**
     * Menampilkan identitas per transaksi sewa.
     */
    public function index(Request $request): Response
    {
        $daftarIdentitas = Sewa::query()
            ->with([
                'user:id,name,email',
                'kendaraan:id,nama_kendaraan,merek',
                'identitasSewa',
            ])
            ->whereHas('identitasSewa')
            ->orderByRaw(
                "
                CASE
                    WHEN status = 'menunggu_verifikasi_identitas' THEN 1
                    WHEN status = 'identitas_ditolak' THEN 2
                    ELSE 3
                END
                "
            )
            ->orderByDesc('id')
            ->get()
            ->map(function (Sewa $sewa): array {
                $identitas = $sewa->identitasSewa;

                if (! $identitas) {
                    return [];
                }

                /*
                 * Dokumen wajib dibaca dari identitas_sewas,
                 * bukan dari kolom dokumen pada users.
                 */
                $ktpTersedia =
                    filled($identitas->dokumen_ktp)
                    && Storage::disk('local')->exists(
                        $identitas->dokumen_ktp
                    );

                $simTersedia =
                    filled($identitas->dokumen_sim)
                    && Storage::disk('local')->exists(
                        $identitas->dokumen_sim
                    );

                return [
                    /*
                     * ID yang dikirim ke frontend adalah ID sewa.
                     * Route verifikasi dan dokumen juga memakai sewaId.
                     */
                    'id' =>
                        $sewa->id,

                    'sewa_id' =>
                        $sewa->id,

                    'identitas_id' =>
                        $identitas->id,

                    /*
                     * Data pengguna kendaraan untuk transaksi ini.
                     */
                    'name' =>
                        $identitas->nama_pengguna,

                    'nama_pengguna' =>
                        $identitas->nama_pengguna,

                    'email' =>
                        $sewa->user?->email,

                    'no_telepon' =>
                        $identitas->no_telepon,

                    'alamat' =>
                        $identitas->alamat,

                    'nik' =>
                        $identitas->nik,

                    'nomor_sim' =>
                        $identitas->nomor_sim,

                    /*
                     * Status identitas transaksi.
                     */
                    'status_identitas' =>
                        $identitas->status_verifikasi,

                    'identitas_dikirim_pada' =>
                        $identitas->dikirim_pada
                            ?->toIso8601String(),

                    'identitas_diperiksa_pada' =>
                        $identitas->diperiksa_pada
                            ?->toIso8601String(),

                    'alasan_penolakan_identitas' =>
                        $identitas->alasan_penolakan,

                    /*
                     * Status fisik file diperiksa langsung
                     * pada disk private local.
                     */
                    'memiliki_ktp' =>
                        $ktpTersedia,

                    'memiliki_sim' =>
                        $simTersedia,

                    /*
                     * URL dibuat relatif agar mengikuti host
                     * dan port aplikasi yang sedang dibuka.
                     */
                    'url_ktp' =>
                        $ktpTersedia
                            ? route(
                                'admin.identitas.dokumen',
                                [
                                    'sewaId' =>
                                        $sewa->id,

                                    'jenis' =>
                                        'ktp',
                                ],
                                false
                            )
                            : null,

                    'url_sim' =>
                        $simTersedia
                            ? route(
                                'admin.identitas.dokumen',
                                [
                                    'sewaId' =>
                                        $sewa->id,

                                    'jenis' =>
                                        'sim',
                                ],
                                false
                            )
                            : null,

                    /*
                     * Frontend saat ini membaca transaksi
                     * melalui array bookings.
                     */
                    'bookings' => [
                        [
                            'id' =>
                                $sewa->id,

                            'nomor_booking' =>
                                $sewa->nomor_booking,

                            'jenis_booking' =>
                                $sewa->jenis_booking,

                            'status' =>
                                $sewa->status,

                            'tanggal_mulai' =>
                                $sewa->tanggal_mulai
                                    ?->format('Y-m-d'),

                            'tanggal_selesai' =>
                                $sewa->tanggal_selesai
                                    ?->format('Y-m-d'),

                            'total_harga' =>
                                (int) ($sewa->total_harga ?? 0),

                            'kendaraan' =>
                                $sewa->kendaraan
                                    ? [
                                        'id' =>
                                            $sewa->kendaraan->id,

                                        'nama_kendaraan' =>
                                            $sewa
                                                ->kendaraan
                                                ->nama_kendaraan,

                                        'merek' =>
                                            $sewa
                                                ->kendaraan
                                                ->merek,
                                    ]
                                    : null,
                        ],
                    ],

                    /*
                     * Alias untuk kompatibilitas komponen lain.
                     */
                    'booking' => [
                        'id' =>
                            $sewa->id,

                        'nomor_booking' =>
                            $sewa->nomor_booking,

                        'jenis_booking' =>
                            $sewa->jenis_booking,

                        'status' =>
                            $sewa->status,

                        'tanggal_mulai' =>
                            $sewa->tanggal_mulai
                                ?->format('Y-m-d'),

                        'tanggal_selesai' =>
                            $sewa->tanggal_selesai
                                ?->format('Y-m-d'),

                        'total_harga' =>
                            (int) ($sewa->total_harga ?? 0),

                        'kendaraan' =>
                            $sewa->kendaraan
                                ? [
                                    'id' =>
                                        $sewa->kendaraan->id,

                                    'nama_kendaraan' =>
                                        $sewa
                                            ->kendaraan
                                            ->nama_kendaraan,

                                    'merek' =>
                                        $sewa
                                            ->kendaraan
                                            ->merek,
                                ]
                                : null,
                    ],

                    'dapat_diverifikasi' =>
                        $sewa->status ===
                            'menunggu_verifikasi_identitas'
                        && $identitas->status_verifikasi ===
                            IdentitasSewa::STATUS_MENUNGGU_VERIFIKASI,
                ];
            })
            ->filter(
                fn (array $item): bool =>
                    count($item) > 0
            )
            ->values();

        return Inertia::render(
            'Admin/VerifikasiIdentitas',
            [
                /*
                 * Nama prop dipertahankan supaya tidak perlu
                 * mengubah frontend yang sudah dibuat.
                 */
                'pelanggans' =>
                    $daftarIdentitas,

                'sewaTerpilih' =>
                    $request->integer('sewa')
                    ?: null,
            ]
        );
    }

    /**
     * Menampilkan KTP atau SIM secara private.
     *
     * Dokumen ditampilkan inline sehingga dapat dibuka
     * melalui modal pada halaman Verifikasi Identitas.
     */
    public function dokumen(
        Request $request,
        int $sewaId,
        string $jenis
    ): BinaryFileResponse {
        abort_unless(
            $request->user()?->role === 'admin',
            403,
            'Anda tidak memiliki akses ke dokumen ini.'
        );

        abort_unless(
            in_array(
                $jenis,
                [
                    'ktp',
                    'sim',
                ],
                true
            ),
            404
        );

        $sewa = Sewa::query()
            ->with([
                'identitasSewa',
            ])
            ->findOrFail($sewaId);

        $identitas =
            $sewa->identitasSewa;

        abort_if(
            ! $identitas,
            404,
            'Data identitas transaksi tidak ditemukan.'
        );

        $path =
            $jenis === 'ktp'
                ? $identitas->dokumen_ktp
                : $identitas->dokumen_sim;

        abort_if(
            blank($path),
            404,
            'Dokumen belum tersedia.'
        );

        abort_unless(
            Storage::disk('local')->exists($path),
            404,
            'File dokumen tidak ditemukan.'
        );

        $ekstensi =
            pathinfo(
                $path,
                PATHINFO_EXTENSION
            );

        $namaFile =
            strtoupper($jenis)
            . '-'
            . Str::slug(
                $identitas->nama_pengguna
            )
            . '-'
            . $sewa->nomor_booking
            . (
                $ekstensi
                    ? ".{$ekstensi}"
                    : ''
            );

        return response()->file(
            Storage::disk('local')->path($path),
            [
                'Content-Disposition' =>
                    'inline; filename="'
                    . $namaFile
                    . '"',

                'Cache-Control' =>
                    'private, no-store, max-age=0',

                'Pragma' =>
                    'no-cache',
            ]
        );
    }

    /**
     * Menyetujui atau menolak identitas satu transaksi.
     */
    public function verifikasi(
        VerifikasiIdentitasRequest $request,
        int $sewaId
    ): RedirectResponse {
        $data =
            $request->validated();

        $hasil = DB::transaction(
            function () use (
                $request,
                $sewaId,
                $data
            ): array {
                $sewa = Sewa::query()
                    ->with([
                        'user',
                        'kendaraan',
                        'identitasSewa',
                    ])
                    ->lockForUpdate()
                    ->findOrFail($sewaId);

                $identitas =
                    $sewa->identitasSewa;

                if (! $identitas) {
                    throw ValidationException::withMessages([
                        'identitas' =>
                            'Data identitas transaksi tidak ditemukan.',
                    ]);
                }

                if (
                    $sewa->status !==
                        'menunggu_verifikasi_identitas'
                    || $identitas->status_verifikasi !==
                        IdentitasSewa::STATUS_MENUNGGU_VERIFIKASI
                ) {
                    throw ValidationException::withMessages([
                        'identitas' =>
                            'Identitas ini sudah pernah diproses atau tidak berada pada tahap verifikasi.',
                    ]);
                }

                $admin =
                    $request->user();

                if (
                    $data['aksi'] ===
                    'setujui'
                ) {
                    $identitas->update([
                        'status_verifikasi' =>
                            IdentitasSewa::STATUS_TERVERIFIKASI,

                        'diperiksa_pada' =>
                            now(),

                        'diperiksa_oleh' =>
                            $admin->id,

                        'alasan_penolakan' =>
                            null,
                    ]);

                    $sewa->update([
                        'status' =>
                            'menunggu_pembayaran',
                    ]);

                    LogAktivitas::query()->create([
                        'user_id' =>
                            $admin->id,

                        'jenis_aktivitas' =>
                            'Persetujuan Identitas',

                        'deskripsi' =>
                            'Admin menyetujui identitas transaksi '
                            . $sewa->nomor_booking
                            . ' atas nama '
                            . $identitas->nama_pengguna
                            . '.',

                        'alamat_ip' =>
                            $request->ip(),
                    ]);

                    return [
                        'aksi' =>
                            'setujui',

                        'sewa' =>
                            $sewa->fresh([
                                'user',
                                'kendaraan',
                                'identitasSewa',
                            ]),
                    ];
                }

                $identitas->update([
                    'status_verifikasi' =>
                        IdentitasSewa::STATUS_DITOLAK,

                    'diperiksa_pada' =>
                        now(),

                    'diperiksa_oleh' =>
                        $admin->id,

                    'alasan_penolakan' =>
                        $data['alasan_penolakan'],
                ]);

                $sewa->update([
                    'status' =>
                        'identitas_ditolak',
                ]);

                LogAktivitas::query()->create([
                    'user_id' =>
                        $admin->id,

                    'jenis_aktivitas' =>
                        'Penolakan Identitas',

                    'deskripsi' =>
                        'Admin menolak identitas transaksi '
                        . $sewa->nomor_booking
                        . ' atas nama '
                        . $identitas->nama_pengguna
                        . '. Keterangan: '
                        . $data['alasan_penolakan']
                        . '.',

                    'alamat_ip' =>
                        $request->ip(),
                ]);

                return [
                    'aksi' =>
                        'tolak',

                    'sewa' =>
                        $sewa->fresh([
                            'user',
                            'kendaraan',
                            'identitasSewa',
                        ]),
                ];
            }
        );

        /** @var Sewa $sewa */
        $sewa =
            $hasil['sewa'];

        if ($sewa->user) {
            if (
                $hasil['aksi'] ===
                'setujui'
            ) {
                $sewa->user->notify(
                    new NotifikasiTransaksi(
                        judul:
                            'Identitas Disetujui',

                        pesan:
                            'Identitas untuk booking '
                            . $sewa->nomor_booking
                            . ' telah disetujui. Silakan lanjutkan pembayaran rental.',

                        jenis:
                            'identitas_disetujui',

                        url:
                            '/pelanggan/pembayaran/'
                            . $sewa->id,

                        sewaId:
                            $sewa->id,

                        nomorBooking:
                            $sewa->nomor_booking,

                        dataTambahan: [
                            'status_baru' =>
                                'menunggu_pembayaran',

                            'kendaraan' =>
                                $sewa->kendaraan
                                    ?->nama_kendaraan,
                        ],
                    )
                );
            } else {
                $sewa->user->notify(
                    new NotifikasiTransaksi(
                        judul:
                            'Identitas Perlu Diperbaiki',

                        pesan:
                            'Identitas untuk booking '
                            . $sewa->nomor_booking
                            . ' belum dapat disetujui. Keterangan: '
                            . $sewa
                                ->identitasSewa
                                ?->alasan_penolakan
                            . '. Silakan perbaiki dan kirim kembali identitas transaksi.',

                        jenis:
                            'identitas_ditolak',

                        url:
                            '/pelanggan/identitas/'
                            . $sewa->id,

                        sewaId:
                            $sewa->id,

                        nomorBooking:
                            $sewa->nomor_booking,

                        dataTambahan: [
                            'status_baru' =>
                                'identitas_ditolak',

                            'alasan_penolakan' =>
                                $sewa
                                    ->identitasSewa
                                    ?->alasan_penolakan,
                        ],
                    )
                );
            }
        }

        return redirect()
            ->route(
                'admin.identitas.index',
                [
                    'sewa' =>
                        $sewa->id,
                ]
            )
            ->with(
                'success',
                $hasil['aksi'] === 'setujui'
                    ? 'Identitas transaksi berhasil disetujui. Pelanggan dapat melanjutkan pembayaran.'
                    : 'Identitas transaksi berhasil ditolak dan pelanggan telah menerima pemberitahuan.'
            );
    }
}
