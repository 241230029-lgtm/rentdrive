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
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class IdentitasController extends Controller
{
    /**
     * Menampilkan identitas berdasarkan transaksi booking.
     */
    public function index(Request $request): Response
    {
        $kataPencarian = trim(
            (string) $request->query('cari', '')
        );

        $filterStatus = trim(
            (string) $request->query('status', '')
        );

        $statusDiizinkan = [
            '',
            IdentitasSewa::STATUS_MENUNGGU_VERIFIKASI,
            IdentitasSewa::STATUS_TERVERIFIKASI,
            IdentitasSewa::STATUS_DITOLAK,
        ];

        if (
            ! in_array(
                $filterStatus,
                $statusDiizinkan,
                true
            )
        ) {
            $filterStatus = '';
        }

        $transaksis = Sewa::query()
            ->with([
                'user:id,name,email',
                'kendaraan:id,nama_kendaraan,merek',
                'identitasSewa',
            ])
            ->whereHas('identitasSewa')
            ->when(
                $filterStatus !== '',
                function ($query) use (
                    $filterStatus
                ): void {
                    $query->whereHas(
                        'identitasSewa',
                        function ($subQuery) use (
                            $filterStatus
                        ): void {
                            $subQuery->where(
                                'status_verifikasi',
                                $filterStatus
                            );
                        }
                    );
                }
            )
            ->when(
                $kataPencarian !== '',
                function ($query) use (
                    $kataPencarian
                ): void {
                    $query->where(
                        function ($subQuery) use (
                            $kataPencarian
                        ): void {
                            $subQuery
                                ->where(
                                    'nomor_booking',
                                    'like',
                                    '%' . $kataPencarian . '%'
                                )
                                ->orWhereHas(
                                    'user',
                                    function ($userQuery) use (
                                        $kataPencarian
                                    ): void {
                                        $userQuery
                                            ->where(
                                                'name',
                                                'like',
                                                '%' . $kataPencarian . '%'
                                            )
                                            ->orWhere(
                                                'email',
                                                'like',
                                                '%' . $kataPencarian . '%'
                                            );
                                    }
                                )
                                ->orWhereHas(
                                    'identitasSewa',
                                    function ($identitasQuery) use (
                                        $kataPencarian
                                    ): void {
                                        $identitasQuery
                                            ->where(
                                                'nama_pengguna',
                                                'like',
                                                '%' . $kataPencarian . '%'
                                            )
                                            ->orWhere(
                                                'nik',
                                                'like',
                                                '%' . $kataPencarian . '%'
                                            )
                                            ->orWhere(
                                                'nomor_sim',
                                                'like',
                                                '%' . $kataPencarian . '%'
                                            )
                                            ->orWhere(
                                                'no_telepon',
                                                'like',
                                                '%' . $kataPencarian . '%'
                                            );
                                    }
                                );
                        }
                    );
                }
            )
            ->orderByDesc('id')
            ->get()
            ->map(function (Sewa $sewa): array {
                $identitas = $sewa->identitasSewa;

                return [
                    /*
                     * ID utama merupakan ID transaksi sewa.
                     */
                    'id' =>
                        $sewa->id,

                    'sewa_id' =>
                        $sewa->id,

                    'nomor_booking' =>
                        $sewa->nomor_booking,

                    /*
                     * Nama utama merupakan nama orang yang
                     * akan menggunakan kendaraan.
                     */
                    'name' =>
                        $identitas?->nama_pengguna
                        ?? '-',

                    'nama_pengguna' =>
                        $identitas?->nama_pengguna,

                    /*
                     * Pemilik akun dapat berbeda dengan
                     * pengguna kendaraan.
                     */
                    'nama_pelanggan' =>
                        $sewa->user?->name,

                    'email' =>
                        $sewa->user?->email,

                    'nik' =>
                        $identitas?->nik,

                    'nomor_sim' =>
                        $identitas?->nomor_sim,

                    'no_telepon' =>
                        $identitas?->no_telepon,

                    'alamat' =>
                        $identitas?->alamat,

                    'status_identitas' =>
                        $identitas?->status_verifikasi
                        ?? 'belum_dilengkapi',

                    'alasan_penolakan' =>
                        $identitas?->alasan_penolakan,

                    'identitas_dikirim_pada' =>
                        $identitas
                            ?->dikirim_pada
                            ?->toIso8601String(),

                    'identitas_diperiksa_pada' =>
                        $identitas
                            ?->diperiksa_pada
                            ?->toIso8601String(),

                    /*
                     * Admin mengakses dokumen melalui
                     * controller privat berdasarkan sewa_id.
                     */
                    'dokumen' => [
                        'memiliki_ktp' =>
                            filled(
                                $identitas?->dokumen_ktp
                            ),

                        'memiliki_sim' =>
                            filled(
                                $identitas?->dokumen_sim
                            ),

                        'url_ktp' =>
                            filled(
                                $identitas?->dokumen_ktp
                            )
                                ? route(
                                    'admin.identitas.dokumen',
                                    [
                                        'sewaId' =>
                                            $sewa->id,

                                        'jenis' =>
                                            'ktp',
                                    ]
                                )
                                : null,

                        'url_sim' =>
                            filled(
                                $identitas?->dokumen_sim
                            )
                                ? route(
                                    'admin.identitas.dokumen',
                                    [
                                        'sewaId' =>
                                            $sewa->id,

                                        'jenis' =>
                                            'sim',
                                    ]
                                )
                                : null,
                    ],

                    /*
                     * Tetap menggunakan array bookings agar
                     * halaman React lama tidak langsung rusak.
                     */
                    'bookings' => [
                        [
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
                                    ]
                                    : null,
                        ],
                    ],
                ];
            })
            ->values();

        return Inertia::render(
            'Admin/VerifikasiIdentitas',
            [
                /*
                 * Nama prop pelanggans dipertahankan agar
                 * frontend lama masih dapat membaca data.
                 */
                'pelanggans' =>
                    $transaksis,

                'transaksis' =>
                    $transaksis,

                'filter' => [
                    'cari' =>
                        $kataPencarian,

                    'status' =>
                        $filterStatus,
                ],
            ]
        );
    }

    /**
     * Menampilkan dokumen KTP atau SIM milik
     * satu transaksi secara privat.
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

        $jenis = strtolower(
            trim($jenis)
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
                'user:id,name',
                'identitasSewa',
            ])
            ->findOrFail($sewaId);

        $identitas =
            $sewa->identitasSewa;

        abort_if(
            ! $identitas,
            404,
            'Data identitas transaksi belum tersedia.'
        );

        $pathDokumen =
            $jenis === 'ktp'
                ? $identitas->dokumen_ktp
                : $identitas->dokumen_sim;

        abort_if(
            blank($pathDokumen),
            404,
            'Dokumen belum tersedia.'
        );

        abort_unless(
            Storage::disk('local')
                ->exists($pathDokumen),
            404,
            'File dokumen tidak ditemukan.'
        );

        $lokasiAbsolut =
            Storage::disk('local')
                ->path($pathDokumen);

        $ekstensi = pathinfo(
            $pathDokumen,
            PATHINFO_EXTENSION
        );

        $namaPengguna = preg_replace(
            '/[^A-Za-z0-9_-]/',
            '-',
            $identitas->nama_pengguna
        );

        $namaFile =
            strtoupper($jenis)
            . '-'
            . $sewa->nomor_booking
            . '-'
            . $namaPengguna
            . '.'
            . $ekstensi;

        return response()->file(
            $lokasiAbsolut,
            [
                'Content-Disposition' =>
                    'inline; filename="'
                    . $namaFile
                    . '"',

                'Cache-Control' =>
                    'private, no-store, no-cache, must-revalidate, max-age=0',

                'Pragma' =>
                    'no-cache',

                'Expires' =>
                    '0',

                'X-Content-Type-Options' =>
                    'nosniff',
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
        $data = $request->validated();

        $admin = $request->user();

        $hasil = DB::transaction(
            function () use (
                $sewaId,
                $data,
                $admin,
                $request
            ): array {
                $sewa = Sewa::query()
                    ->with([
                        'user:id,name,email',
                        'kendaraan:id,nama_kendaraan,merek',
                    ])
                    ->whereKey($sewaId)
                    ->lockForUpdate()
                    ->firstOrFail();

                $identitas =
                    IdentitasSewa::query()
                        ->where(
                            'sewa_id',
                            $sewa->id
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                if (
                    $identitas->status_verifikasi !==
                    IdentitasSewa::STATUS_MENUNGGU_VERIFIKASI
                ) {
                    throw ValidationException::withMessages([
                        'aksi' =>
                            'Identitas transaksi ini sudah pernah diproses atau belum dikirim.',
                    ]);
                }

                if (
                    $sewa->status !==
                    'menunggu_verifikasi_identitas'
                ) {
                    throw ValidationException::withMessages([
                        'aksi' =>
                            'Status booking tidak sedang menunggu verifikasi identitas.',
                    ]);
                }

                if (! $identitas->lengkap()) {
                    throw ValidationException::withMessages([
                        'aksi' =>
                            'Data identitas transaksi belum lengkap.',
                    ]);
                }

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

                    /*
                     * Hanya booking ini yang dilanjutkan
                     * menuju pembayaran.
                     */
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
                            'Admin menyetujui identitas pengguna '
                            . $identitas->nama_pengguna
                            . ' untuk booking '
                            . $sewa->nomor_booking
                            . '.',

                        'alamat_ip' =>
                            $request->ip(),
                    ]);

                    return [
                        'aksi' =>
                            'setujui',

                        'sewa' =>
                            $sewa,

                        'identitas' =>
                            $identitas,
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

                /*
                 * Hanya booking ini yang dikembalikan
                 * untuk diperbaiki pelanggan.
                 */
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
                        'Admin menolak identitas pengguna '
                        . $identitas->nama_pengguna
                        . ' untuk booking '
                        . $sewa->nomor_booking
                        . '. Keterangan: '
                        . $data['alasan_penolakan'],

                    'alamat_ip' =>
                        $request->ip(),
                ]);

                return [
                    'aksi' =>
                        'tolak',

                    'sewa' =>
                        $sewa,

                    'identitas' =>
                        $identitas,
                ];
            }
        );

        /** @var Sewa $sewa */
        $sewa = $hasil['sewa'];

        /** @var IdentitasSewa $identitas */
        $identitas = $hasil['identitas'];

        $pelanggan = $sewa->user;

        if (
            $hasil['aksi'] ===
            'setujui'
        ) {
            $pelanggan->notify(
                new NotifikasiTransaksi(
                    judul:
                        'Identitas Booking Disetujui',

                    pesan:
                        'Identitas pengguna '
                        . $identitas->nama_pengguna
                        . ' untuk booking '
                        . $sewa->nomor_booking
                        . ' telah disetujui. '
                        . 'Silakan lanjutkan pembayaran.',

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
                        'nama_pengguna' =>
                            $identitas
                                ->nama_pengguna,

                        'status_baru' =>
                            'menunggu_pembayaran',

                        'kendaraan' =>
                            $sewa->kendaraan
                                ?->nama_kendaraan,
                    ],
                )
            );

            return back()->with(
                'success',
                'Identitas booking berhasil disetujui. Pelanggan dapat melanjutkan pembayaran.'
            );
        }

        $pelanggan->notify(
            new NotifikasiTransaksi(
                judul:
                    'Identitas Booking Perlu Diperbaiki',

                pesan:
                    'Identitas pengguna '
                    . $identitas->nama_pengguna
                    . ' untuk booking '
                    . $sewa->nomor_booking
                    . ' belum dapat disetujui. '
                    . 'Keterangan: '
                    . $identitas->alasan_penolakan,

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
                    'nama_pengguna' =>
                        $identitas
                            ->nama_pengguna,

                    'status_baru' =>
                        'identitas_ditolak',

                    'kendaraan' =>
                        $sewa->kendaraan
                            ?->nama_kendaraan,
                ],
            )
        );

        return back()->with(
            'success',
            'Identitas booking ditolak dan pelanggan telah diminta memperbaiki dokumen.'
        );
    }
}
