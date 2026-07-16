<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VerifikasiPembayaranDendaRequest;
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

class PembayaranDendaController extends Controller
{
    /**
     * Menampilkan seluruh tagihan dan pembayaran denda.
     */
    public function index(Request $request): Response
    {
        $pembayaranDendas = Sewa::query()
            ->with([
                'user:id,name,email,no_telepon',
                'kendaraan:id,nama_kendaraan,merek,foto_kendaraan',
            ])
            ->where(
                'total_denda',
                '>',
                0
            )
            ->orderByRaw(
                "
                CASE status_pembayaran_denda
                    WHEN 'menunggu_verifikasi' THEN 1
                    WHEN 'ditolak' THEN 2
                    WHEN 'belum_dibayar' THEN 3
                    WHEN 'lunas' THEN 4
                    ELSE 5
                END
                "
            )
            ->orderByDesc('denda_dibayar_pada')
            ->orderByDesc('id')
            ->get([
                'id',
                'nomor_booking',
                'user_id',
                'kendaraan_id',
                'jenis_booking',
                'tanggal_mulai',
                'tanggal_selesai',
                'tanggal_kembali_aktual',
                'total_harga',
                'denda_keterlambatan',
                'denda_kerusakan',
                'total_denda',
                'status_pembayaran_denda',
                'metode_pembayaran_denda',
                'bukti_pembayaran_denda',
                'alasan_penolakan_pembayaran_denda',
                'denda_dibayar_pada',
                'denda_diperiksa_pada',
                'denda_diperiksa_oleh',
                'status',
                'created_at',
                'updated_at',
            ])
            ->map(function (Sewa $sewa): array {
                $statusDenda =
                    $this->normalisasiStatusDenda(
                        $sewa
                    );

                $buktiTersedia =
                    filled(
                        $sewa->bukti_pembayaran_denda
                    )
                    && Storage::disk('local')
                        ->exists(
                            $sewa
                                ->bukti_pembayaran_denda
                        );

                return [
                    'id' =>
                        $sewa->id,

                    'nomor_booking' =>
                        $sewa->nomor_booking,

                    'jenis_booking' =>
                        $sewa->jenis_booking,

                    'tanggal_mulai' =>
                        $sewa->tanggal_mulai
                            ?->format('Y-m-d'),

                    'tanggal_selesai' =>
                        $sewa->tanggal_selesai
                            ?->format('Y-m-d'),

                    'tanggal_kembali_aktual' =>
                        $sewa->tanggal_kembali_aktual
                            ?->format('Y-m-d'),

                    'total_harga' =>
                        (int) (
                            $sewa->total_harga
                            ?? 0
                        ),

                    'denda_keterlambatan' =>
                        (int) (
                            $sewa
                                ->denda_keterlambatan
                            ?? 0
                        ),

                    'denda_kerusakan' =>
                        (int) (
                            $sewa->denda_kerusakan
                            ?? 0
                        ),

                    'total_denda' =>
                        (int) (
                            $sewa->total_denda
                            ?? 0
                        ),

                    'status_pembayaran_denda' =>
                        $statusDenda,

                    'metode_pembayaran_denda' =>
                        $sewa
                            ->metode_pembayaran_denda,

                    'memiliki_bukti' =>
                        $buktiTersedia,

                    /*
                     * URL relatif digunakan agar mengikuti
                     * host dan port aplikasi yang sedang dibuka.
                     */
                    'url_bukti' =>
                        $buktiTersedia
                            ? route(
                                'admin.denda.bukti',
                                [
                                    'sewaId' =>
                                        $sewa->id,
                                ],
                                false
                            )
                            : null,

                    'alasan_penolakan' =>
                        $sewa
                            ->alasan_penolakan_pembayaran_denda,

                    'denda_dibayar_pada' =>
                        $sewa->denda_dibayar_pada
                            ?->toIso8601String(),

                    'denda_diperiksa_pada' =>
                        $sewa->denda_diperiksa_pada
                            ?->toIso8601String(),

                    'status_sewa' =>
                        $sewa->status,

                    'created_at' =>
                        $sewa->created_at
                            ?->toIso8601String(),

                    'updated_at' =>
                        $sewa->updated_at
                            ?->toIso8601String(),

                    'boleh_diverifikasi' =>
                        $statusDenda ===
                            Sewa::DENDA_MENUNGGU_VERIFIKASI
                        && $buktiTersedia,

                    'pelanggan' =>
                        $sewa->user
                            ? [
                                'id' =>
                                    $sewa->user->id,

                                'name' =>
                                    $sewa->user->name,

                                'email' =>
                                    $sewa->user->email,

                                'no_telepon' =>
                                    $sewa->user
                                        ->no_telepon,
                            ]
                            : null,

                    'user' =>
                        $sewa->user
                            ? [
                                'id' =>
                                    $sewa->user->id,

                                'name' =>
                                    $sewa->user->name,

                                'email' =>
                                    $sewa->user->email,

                                'no_telepon' =>
                                    $sewa->user
                                        ->no_telepon,
                            ]
                            : null,

                    'kendaraan' =>
                        $sewa->kendaraan
                            ? [
                                'id' =>
                                    $sewa->kendaraan->id,

                                'nama_kendaraan' =>
                                    $sewa->kendaraan
                                        ->nama_kendaraan,

                                'merek' =>
                                    $sewa->kendaraan
                                        ->merek,

                                'foto_kendaraan' =>
                                    $sewa->kendaraan
                                        ->foto_kendaraan,
                            ]
                            : null,
                ];
            })
            ->values();

        $ringkasan = [
            'total_tagihan' =>
                $pembayaranDendas->count(),

            'belum_dibayar' =>
                $pembayaranDendas
                    ->where(
                        'status_pembayaran_denda',
                        Sewa::DENDA_BELUM_DIBAYAR
                    )
                    ->count(),

            'menunggu_verifikasi' =>
                $pembayaranDendas
                    ->where(
                        'status_pembayaran_denda',
                        Sewa::DENDA_MENUNGGU_VERIFIKASI
                    )
                    ->count(),

            'ditolak' =>
                $pembayaranDendas
                    ->where(
                        'status_pembayaran_denda',
                        Sewa::DENDA_DITOLAK
                    )
                    ->count(),

            'lunas' =>
                $pembayaranDendas
                    ->where(
                        'status_pembayaran_denda',
                        Sewa::DENDA_LUNAS
                    )
                    ->count(),

            'nominal_menunggu_verifikasi' =>
                (int) $pembayaranDendas
                    ->where(
                        'status_pembayaran_denda',
                        Sewa::DENDA_MENUNGGU_VERIFIKASI
                    )
                    ->sum('total_denda'),

            'nominal_belum_lunas' =>
                (int) $pembayaranDendas
                    ->filter(
                        fn (array $item): bool =>
                            in_array(
                                $item[
                                    'status_pembayaran_denda'
                                ],
                                [
                                    Sewa::DENDA_BELUM_DIBAYAR,
                                    Sewa::DENDA_MENUNGGU_VERIFIKASI,
                                    Sewa::DENDA_DITOLAK,
                                ],
                                true
                            )
                    )
                    ->sum('total_denda'),
        ];

        return Inertia::render(
            'Admin/VerifikasiPembayaranDenda',
            [
                'pembayaranDendas' =>
                    $pembayaranDendas,

                'ringkasan' =>
                    $ringkasan,

                'sewaTerpilih' =>
                    $request->integer('sewa')
                    ?: null,
            ]
        );
    }

    /**
     * Menampilkan bukti pembayaran denda secara privat.
     */
    public function bukti(
        int $sewaId
    ): BinaryFileResponse {
        $sewa = Sewa::query()
            ->where(
                'id',
                $sewaId
            )
            ->where(
                'total_denda',
                '>',
                0
            )
            ->firstOrFail();

        $path =
            $sewa->bukti_pembayaran_denda;

        abort_if(
            blank($path),
            404,
            'Bukti pembayaran denda belum tersedia.'
        );

        abort_unless(
            Storage::disk('local')
                ->exists($path),
            404,
            'File bukti pembayaran denda tidak ditemukan.'
        );

        return response()->file(
            Storage::disk('local')
                ->path($path)
        );
    }

    /**
     * Menyetujui atau menolak pembayaran denda.
     */
    public function verifikasi(
        VerifikasiPembayaranDendaRequest $request,
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
                        'user:id,name,email',
                        'kendaraan:id,nama_kendaraan,merek',
                    ])
                    ->where(
                        'id',
                        $sewaId
                    )
                    ->lockForUpdate()
                    ->firstOrFail();

                if (
                    (int) $sewa->total_denda <= 0
                ) {
                    throw ValidationException::withMessages([
                        'pembayaran_denda' =>
                            'Transaksi ini tidak memiliki tagihan denda.',
                    ]);
                }

                if (
                    $sewa
                        ->status_pembayaran_denda
                    !==
                    Sewa::DENDA_MENUNGGU_VERIFIKASI
                ) {
                    throw ValidationException::withMessages([
                        'pembayaran_denda' =>
                            'Pembayaran denda ini sudah pernah diproses atau belum dikirim pelanggan.',
                    ]);
                }

                if (
                    blank(
                        $sewa
                            ->bukti_pembayaran_denda
                    )
                    || ! Storage::disk('local')
                        ->exists(
                            $sewa
                                ->bukti_pembayaran_denda
                        )
                ) {
                    throw ValidationException::withMessages([
                        'pembayaran_denda' =>
                            'Bukti pembayaran denda tidak ditemukan.',
                    ]);
                }

                $admin =
                    $request->user();

                if (
                    $data['aksi'] ===
                    'setujui'
                ) {
                    $sewa->update([
                        'status_pembayaran_denda' =>
                            Sewa::DENDA_LUNAS,

                        'alasan_penolakan_pembayaran_denda' =>
                            null,

                        'denda_diperiksa_pada' =>
                            now(),

                        'denda_diperiksa_oleh' =>
                            $admin->id,
                    ]);

                    LogAktivitas::query()->create([
                        'user_id' =>
                            $admin->id,

                        'jenis_aktivitas' =>
                            'Persetujuan Pembayaran Denda',

                        'deskripsi' =>
                            'Admin menyetujui pembayaran denda booking '
                            . $sewa->nomor_booking
                            . ' milik pelanggan '
                            . (
                                $sewa->user?->name
                                ?? '-'
                            )
                            . ' sebesar Rp'
                            . number_format(
                                (int) $sewa->total_denda,
                                0,
                                ',',
                                '.'
                            )
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
                            ]),
                    ];
                }

                $sewa->update([
                    'status_pembayaran_denda' =>
                        Sewa::DENDA_DITOLAK,

                    'alasan_penolakan_pembayaran_denda' =>
                        $data[
                            'alasan_penolakan'
                        ],

                    'denda_diperiksa_pada' =>
                        now(),

                    'denda_diperiksa_oleh' =>
                        $admin->id,
                ]);

                LogAktivitas::query()->create([
                    'user_id' =>
                        $admin->id,

                    'jenis_aktivitas' =>
                        'Penolakan Pembayaran Denda',

                    'deskripsi' =>
                        'Admin menolak pembayaran denda booking '
                        . $sewa->nomor_booking
                        . ' milik pelanggan '
                        . (
                            $sewa->user?->name
                            ?? '-'
                        )
                        . '. Keterangan: '
                        . $data[
                            'alasan_penolakan'
                        ]
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
                $masihAdaDenda =
                    Sewa::query()
                        ->where(
                            'user_id',
                            $sewa->user_id
                        )
                        ->where(
                            'total_denda',
                            '>',
                            0
                        )
                        ->whereIn(
                            'status_pembayaran_denda',
                            [
                                Sewa::DENDA_BELUM_DIBAYAR,
                                Sewa::DENDA_MENUNGGU_VERIFIKASI,
                                Sewa::DENDA_DITOLAK,
                            ]
                        )
                        ->exists();

                $pesan =
                    'Pembayaran denda untuk booking '
                    . $sewa->nomor_booking
                    . ' sebesar Rp'
                    . number_format(
                        (int) $sewa->total_denda,
                        0,
                        ',',
                        '.'
                    )
                    . ' telah disetujui.';

                if ($masihAdaDenda) {
                    $pesan .=
                        ' Anda masih memiliki tagihan denda lain yang belum lunas.';
                } else {
                    $pesan .=
                        ' Seluruh tagihan telah lunas dan akun dapat melakukan booking kembali.';
                }

                $sewa->user->notify(
                    new NotifikasiTransaksi(
                        judul:
                            'Pembayaran Denda Disetujui',

                        pesan:
                            $pesan,

                        jenis:
                            'pembayaran_denda_disetujui',

                        url:
                            '/pelanggan/denda/'
                            . $sewa->id,

                        sewaId:
                            $sewa->id,

                        nomorBooking:
                            $sewa->nomor_booking,

                        dataTambahan: [
                            'total_denda' =>
                                (int) $sewa
                                    ->total_denda,

                            'status_baru' =>
                                Sewa::DENDA_LUNAS,

                            'masih_ada_denda' =>
                                $masihAdaDenda,
                        ],
                    )
                );
            } else {
                $sewa->user->notify(
                    new NotifikasiTransaksi(
                        judul:
                            'Pembayaran Denda Ditolak',

                        pesan:
                            'Pembayaran denda untuk booking '
                            . $sewa->nomor_booking
                            . ' belum dapat disetujui. Keterangan: '
                            . $sewa
                                ->alasan_penolakan_pembayaran_denda
                            . '. Silakan kirim kembali bukti pembayaran.',

                        jenis:
                            'pembayaran_denda_ditolak',

                        url:
                            '/pelanggan/denda/'
                            . $sewa->id,

                        sewaId:
                            $sewa->id,

                        nomorBooking:
                            $sewa->nomor_booking,

                        dataTambahan: [
                            'total_denda' =>
                                (int) $sewa
                                    ->total_denda,

                            'status_baru' =>
                                Sewa::DENDA_DITOLAK,

                            'alasan_penolakan' =>
                                $sewa
                                    ->alasan_penolakan_pembayaran_denda,
                        ],
                    )
                );
            }
        }

        return redirect()
            ->route(
                'admin.denda.index',
                [
                    'sewa' =>
                        $sewa->id,
                ]
            )
            ->with(
                'success',
                $hasil['aksi'] === 'setujui'
                    ? 'Pembayaran denda berhasil disetujui.'
                    : 'Pembayaran denda berhasil ditolak dan pelanggan telah menerima keterangan.'
            );
    }

    /**
     * Menormalkan status transaksi lama.
     */
    private function normalisasiStatusDenda(
        Sewa $sewa
    ): string {
        if (
            (int) $sewa->total_denda <= 0
        ) {
            return Sewa::DENDA_TIDAK_ADA;
        }

        if (
            blank(
                $sewa->status_pembayaran_denda
            )
            || $sewa
                ->status_pembayaran_denda ===
                Sewa::DENDA_TIDAK_ADA
        ) {
            return Sewa::DENDA_BELUM_DIBAYAR;
        }

        return $sewa
            ->status_pembayaran_denda;
    }
}
