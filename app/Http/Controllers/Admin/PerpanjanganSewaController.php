<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VerifikasiPerpanjanganSewaRequest;
use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use App\Models\PerpanjanganSewa;
use App\Models\Sewa;
use App\Notifications\NotifikasiTransaksi;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class PerpanjanganSewaController extends Controller
{
    /**
     * Status transaksi yang masih menggunakan
     * ketersediaan kendaraan.
     */
    private const STATUS_MEMAKAI_KUOTA = [
        'menunggu_konfirmasi_admin',
        'menunggu_identitas',
        'menunggu_verifikasi_identitas',
        'identitas_ditolak',
        'menunggu_pembayaran',
        'menunggu_verifikasi_pembayaran',
        'ditolak_pembayaran',
        'disetujui_operasional',
        'sedang_berlangsung',
        'menunggu_verifikasi_pengembalian',
    ];

    /**
     * Status transaksi yang masih dapat diperpanjang.
     */
    private const STATUS_SEWA_DAPAT_DIPERPANJANG = [
        'disetujui_operasional',
        'sedang_berlangsung',
    ];

    /**
     * Menampilkan seluruh pengajuan dan pembayaran
     * perpanjangan rental.
     */
    public function index(Request $request): Response
    {
        $daftarPerpanjangan = PerpanjanganSewa::query()
            ->with([
                'sewa.user:id,name,email,no_telepon',
                'sewa.kendaraan:id,nama_kendaraan,merek,foto_kendaraan,harga_per_hari,jumlah_unit,status',
                'adminPemroses:id,name,email',
                'adminPemeriksaPembayaran:id,name,email',
            ])
            ->orderByRaw(
                "
                CASE status
                    WHEN 'menunggu_verifikasi_pembayaran' THEN 1
                    WHEN 'menunggu_persetujuan' THEN 2
                    WHEN 'pembayaran_ditolak' THEN 3
                    WHEN 'menunggu_pembayaran' THEN 4
                    WHEN 'ditolak' THEN 5
                    WHEN 'selesai' THEN 6
                    WHEN 'disetujui' THEN 7
                    ELSE 8
                END
                "
            )
            ->orderByDesc('diajukan_pada')
            ->orderByDesc('id')
            ->get()
            ->map(function (
                PerpanjanganSewa $perpanjangan
            ): array {
                $sewa = $perpanjangan->sewa;

                $buktiPembayaranTersedia =
                    filled(
                        $perpanjangan->bukti_pembayaran
                    )
                    && Storage::disk('local')->exists(
                        $perpanjangan->bukti_pembayaran
                    );

                return [
                    'id' =>
                        $perpanjangan->id,

                    'sewa_id' =>
                        $perpanjangan->sewa_id,

                    'tanggal_selesai_lama' =>
                        $perpanjangan
                            ->tanggal_selesai_lama
                            ?->format('Y-m-d'),

                    'tanggal_selesai_baru' =>
                        $perpanjangan
                            ->tanggal_selesai_baru
                            ?->format('Y-m-d'),

                    'jumlah_hari_tambahan' =>
                        (int) $perpanjangan
                            ->jumlah_hari_tambahan,

                    'harga_per_hari' =>
                        (int) $perpanjangan
                            ->harga_per_hari,

                    'biaya_tambahan' =>
                        (int) $perpanjangan
                            ->biaya_tambahan,

                    'alasan_pengajuan' =>
                        $perpanjangan
                            ->alasan_pengajuan,

                    'status' =>
                        $perpanjangan->status,

                    'diajukan_pada' =>
                        $perpanjangan
                            ->diajukan_pada
                            ?->toIso8601String(),

                    'diproses_pada' =>
                        $perpanjangan
                            ->diproses_pada
                            ?->toIso8601String(),

                    'alasan_penolakan' =>
                        $perpanjangan
                            ->alasan_penolakan,

                    /*
                     * Data pembayaran.
                     */
                    'metode_pembayaran' =>
                        $perpanjangan
                            ->metode_pembayaran,

                    'bukti_pembayaran_tersedia' =>
                        $buktiPembayaranTersedia,

                    'url_bukti_pembayaran' =>
                        $buktiPembayaranTersedia
                            ? '/admin/perpanjangan/'
                                . $perpanjangan->id
                                . '/bukti'
                            : null,

                    'dibayar_pada' =>
                        $perpanjangan
                            ->dibayar_pada
                            ?->toIso8601String(),

                    'pembayaran_diperiksa_pada' =>
                        $perpanjangan
                            ->pembayaran_diperiksa_pada
                            ?->toIso8601String(),

                    'alasan_penolakan_pembayaran' =>
                        $perpanjangan
                            ->alasan_penolakan_pembayaran,

                    'diterapkan_pada' =>
                        $perpanjangan
                            ->diterapkan_pada
                            ?->toIso8601String(),

                    /*
                     * Hak aksi admin.
                     */
                    'boleh_diverifikasi' =>
                        $perpanjangan->status ===
                            PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN,

                    'boleh_verifikasi_pembayaran' =>
                        $perpanjangan
                            ->bolehMemverifikasiPembayaran(),

                    /*
                     * Admin keputusan pengajuan.
                     */
                    'admin_pemroses' =>
                        $perpanjangan->adminPemroses
                            ? [
                                'id' =>
                                    $perpanjangan
                                        ->adminPemroses
                                        ->id,

                                'name' =>
                                    $perpanjangan
                                        ->adminPemroses
                                        ->name,

                                'email' =>
                                    $perpanjangan
                                        ->adminPemroses
                                        ->email,
                            ]
                            : null,

                    /*
                     * Admin pemeriksa pembayaran.
                     */
                    'admin_pemeriksa_pembayaran' =>
                        $perpanjangan
                            ->adminPemeriksaPembayaran
                            ? [
                                'id' =>
                                    $perpanjangan
                                        ->adminPemeriksaPembayaran
                                        ->id,

                                'name' =>
                                    $perpanjangan
                                        ->adminPemeriksaPembayaran
                                        ->name,

                                'email' =>
                                    $perpanjangan
                                        ->adminPemeriksaPembayaran
                                        ->email,
                            ]
                            : null,

                    /*
                     * Transaksi utama.
                     */
                    'sewa' =>
                        $sewa
                            ? [
                                'id' =>
                                    $sewa->id,

                                'nomor_booking' =>
                                    $sewa
                                        ->nomor_booking,

                                'jenis_booking' =>
                                    $sewa
                                        ->jenis_booking,

                                'tanggal_mulai' =>
                                    $sewa
                                        ->tanggal_mulai
                                        ?->format('Y-m-d'),

                                'tanggal_selesai' =>
                                    $sewa
                                        ->tanggal_selesai
                                        ?->format('Y-m-d'),

                                'total_harga' =>
                                    (int) (
                                        $sewa
                                            ->total_harga
                                        ?? 0
                                    ),

                                'estimasi_total_baru' =>
                                    (int) (
                                        $sewa
                                            ->total_harga
                                        ?? 0
                                    )
                                    + (
                                        $perpanjangan
                                            ->status ===
                                            PerpanjanganSewa::STATUS_SELESAI
                                            ? 0
                                            : (int) $perpanjangan
                                                ->biaya_tambahan
                                    ),

                                'status' =>
                                    $sewa->status,

                                'pelanggan' =>
                                    $sewa->user
                                        ? [
                                            'id' =>
                                                $sewa
                                                    ->user
                                                    ->id,

                                            'name' =>
                                                $sewa
                                                    ->user
                                                    ->name,

                                            'email' =>
                                                $sewa
                                                    ->user
                                                    ->email,

                                            'no_telepon' =>
                                                $sewa
                                                    ->user
                                                    ->no_telepon,
                                        ]
                                        : null,

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

                                            'harga_per_hari' =>
                                                (int) (
                                                    $sewa
                                                        ->kendaraan
                                                        ->harga_per_hari
                                                    ?? 0
                                                ),
                                        ]
                                        : null,
                            ]
                            : null,
                ];
            })
            ->values();

        /*
         * Status proses pembayaran yang belum selesai.
         */
        $statusPembayaranAktif = [
            PerpanjanganSewa::STATUS_MENUNGGU_PEMBAYARAN,
            PerpanjanganSewa::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN,
            PerpanjanganSewa::STATUS_PEMBAYARAN_DITOLAK,
            PerpanjanganSewa::STATUS_DISETUJUI_LAMA,
        ];

        $ringkasan = [
            'total' =>
                $daftarPerpanjangan
                    ->count(),

            /*
             * Dipertahankan untuk kompatibilitas
             * halaman frontend lama.
             */
            'menunggu' =>
                $daftarPerpanjangan
                    ->whereIn(
                        'status',
                        array_merge(
                            [
                                PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN,
                            ],
                            $statusPembayaranAktif
                        )
                    )
                    ->count(),

            'disetujui' =>
                $daftarPerpanjangan
                    ->where(
                        'status',
                        PerpanjanganSewa::STATUS_SELESAI
                    )
                    ->count(),

            'ditolak' =>
                $daftarPerpanjangan
                    ->where(
                        'status',
                        PerpanjanganSewa::STATUS_DITOLAK
                    )
                    ->count(),

            /*
             * Ringkasan alur baru.
             */
            'menunggu_persetujuan' =>
                $daftarPerpanjangan
                    ->where(
                        'status',
                        PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN
                    )
                    ->count(),

            'menunggu_pembayaran' =>
                $daftarPerpanjangan
                    ->where(
                        'status',
                        PerpanjanganSewa::STATUS_MENUNGGU_PEMBAYARAN
                    )
                    ->count(),

            'menunggu_verifikasi_pembayaran' =>
                $daftarPerpanjangan
                    ->where(
                        'status',
                        PerpanjanganSewa::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN
                    )
                    ->count(),

            'pembayaran_ditolak' =>
                $daftarPerpanjangan
                    ->where(
                        'status',
                        PerpanjanganSewa::STATUS_PEMBAYARAN_DITOLAK
                    )
                    ->count(),

            'selesai' =>
                $daftarPerpanjangan
                    ->where(
                        'status',
                        PerpanjanganSewa::STATUS_SELESAI
                    )
                    ->count(),

            'nominal_menunggu' =>
                (int) $daftarPerpanjangan
                    ->whereIn(
                        'status',
                        $statusPembayaranAktif
                    )
                    ->sum(
                        'biaya_tambahan'
                    ),

            'nominal_disetujui' =>
                (int) $daftarPerpanjangan
                    ->where(
                        'status',
                        PerpanjanganSewa::STATUS_SELESAI
                    )
                    ->sum(
                        'biaya_tambahan'
                    ),
        ];

        return Inertia::render(
            'Admin/PerpanjanganRental',
            [
                'daftarPerpanjangan' =>
                    $daftarPerpanjangan,

                'ringkasan' =>
                    $ringkasan,

                'perpanjanganTerpilih' =>
                    $request->integer(
                        'perpanjangan'
                    )
                    ?: null,
            ]
        );
    }

    /**
     * Menyetujui atau menolak pengajuan awal.
     *
     * Persetujuan belum memperbarui tanggal selesai
     * maupun total harga transaksi.
     */
    public function verifikasi(
        VerifikasiPerpanjanganSewaRequest $request,
        int $perpanjanganId
    ): RedirectResponse {
        $data = $request->validated();

        $hasil = DB::transaction(
            function () use (
                $request,
                $perpanjanganId,
                $data
            ): array {
                $perpanjangan =
                    PerpanjanganSewa::query()
                        ->with([
                            'sewa.user',
                            'sewa.kendaraan',
                        ])
                        ->lockForUpdate()
                        ->findOrFail(
                            $perpanjanganId
                        );

                if (
                    $perpanjangan->status !==
                    PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN
                ) {
                    throw ValidationException::withMessages([
                        'perpanjangan' =>
                            'Permintaan perpanjangan ini sudah pernah diproses.',
                    ]);
                }

                $sewa = Sewa::query()
                    ->with([
                        'user',
                        'kendaraan',
                    ])
                    ->lockForUpdate()
                    ->findOrFail(
                        $perpanjangan->sewa_id
                    );

                $admin = $request->user();

                /*
                 * Penolakan pengajuan awal.
                 */
                if (
                    $data['aksi'] ===
                    'tolak'
                ) {
                    $perpanjangan->update([
                        'status' =>
                            PerpanjanganSewa::STATUS_DITOLAK,

                        'diproses_pada' =>
                            now(),

                        'diproses_oleh' =>
                            $admin->id,

                        'alasan_penolakan' =>
                            $data[
                                'alasan_penolakan'
                            ],
                    ]);

                    $this->catatLog(
                        userId:
                            $admin->id,

                        jenis:
                            'Penolakan Perpanjangan Rental',

                        deskripsi:
                            'Admin menolak pengajuan perpanjangan booking '
                            . $sewa->nomor_booking
                            . '. Keterangan: '
                            . $data[
                                'alasan_penolakan'
                            ]
                            . '.',

                        alamatIp:
                            $request->ip()
                    );

                    return [
                        'aksi' =>
                            'tolak_pengajuan',

                        'perpanjangan' =>
                            $perpanjangan
                                ->fresh(),

                        'sewa' =>
                            $sewa,
                    ];
                }

                $this->pastikanSewaDapatDiperpanjang(
                    $sewa,
                    $perpanjangan
                );

                $this->pastikanKetersediaan(
                    sewa:
                        $sewa,

                    perpanjangan:
                        $perpanjangan
                );

                /*
                 * Pengajuan disetujui, tetapi tanggal
                 * dan total transaksi belum diterapkan.
                 */
                $perpanjangan->update([
                    'status' =>
                        PerpanjanganSewa::STATUS_MENUNGGU_PEMBAYARAN,

                    'diproses_pada' =>
                        now(),

                    'diproses_oleh' =>
                        $admin->id,

                    'alasan_penolakan' =>
                        null,

                    'metode_pembayaran' =>
                        null,

                    'bukti_pembayaran' =>
                        null,

                    'dibayar_pada' =>
                        null,

                    'pembayaran_diperiksa_pada' =>
                        null,

                    'pembayaran_diperiksa_oleh' =>
                        null,

                    'alasan_penolakan_pembayaran' =>
                        null,

                    'diterapkan_pada' =>
                        null,
                ]);

                $this->catatLog(
                    userId:
                        $admin->id,

                    jenis:
                        'Persetujuan Pengajuan Perpanjangan',

                    deskripsi:
                        'Admin menyetujui pengajuan perpanjangan booking '
                        . $sewa->nomor_booking
                        . ' selama '
                        . $perpanjangan
                            ->jumlah_hari_tambahan
                        . ' hari dengan tagihan Rp'
                        . number_format(
                            (int) $perpanjangan
                                ->biaya_tambahan,
                            0,
                            ',',
                            '.'
                        )
                        . '. Pelanggan harus menyelesaikan pembayaran terlebih dahulu.',

                    alamatIp:
                        $request->ip()
                );

                return [
                    'aksi' =>
                        'setujui_pengajuan',

                    'perpanjangan' =>
                        $perpanjangan
                            ->fresh(),

                    'sewa' =>
                        $sewa,
                ];
            }
        );

        $this->kirimNotifikasiKePelanggan(
            aksi:
                $hasil['aksi'],

            sewa:
                $hasil['sewa'],

            perpanjangan:
                $hasil['perpanjangan']
        );

        return redirect()
            ->route(
                'admin.perpanjangan.index',
                [
                    'perpanjangan' =>
                        $hasil[
                            'perpanjangan'
                        ]->id,
                ]
            )
            ->with(
                'success',
                $hasil['aksi'] ===
                    'setujui_pengajuan'
                    ? 'Pengajuan perpanjangan disetujui. Pelanggan harus menyelesaikan pembayaran biaya tambahan.'
                    : 'Pengajuan perpanjangan berhasil ditolak.'
            );
    }

    /**
     * Menyetujui atau menolak bukti pembayaran
     * biaya perpanjangan.
     */
    public function verifikasiPembayaran(
        Request $request,
        int $perpanjanganId
    ): RedirectResponse {
        $data = $request->validate(
            [
                'aksi' => [
                    'required',
                    Rule::in([
                        'setujui',
                        'tolak',
                    ]),
                ],

                'alasan_penolakan_pembayaran' => [
                    'nullable',
                    'required_if:aksi,tolak',
                    'string',
                    'min:10',
                    'max:1000',
                ],
            ],
            [
                'aksi.required' =>
                    'Aksi pembayaran wajib dipilih.',

                'aksi.in' =>
                    'Aksi pembayaran tidak valid.',

                'alasan_penolakan_pembayaran.required_if' =>
                    'Alasan penolakan pembayaran wajib diisi.',

                'alasan_penolakan_pembayaran.min' =>
                    'Alasan penolakan pembayaran minimal 10 karakter.',

                'alasan_penolakan_pembayaran.max' =>
                    'Alasan penolakan pembayaran maksimal 1.000 karakter.',
            ]
        );

        $hasil = DB::transaction(
            function () use (
                $request,
                $perpanjanganId,
                $data
            ): array {
                $perpanjangan =
                    PerpanjanganSewa::query()
                        ->with([
                            'sewa.user',
                            'sewa.kendaraan',
                        ])
                        ->lockForUpdate()
                        ->findOrFail(
                            $perpanjanganId
                        );

                if (
                    ! $perpanjangan
                        ->bolehMemverifikasiPembayaran()
                ) {
                    throw ValidationException::withMessages([
                        'pembayaran_perpanjangan' =>
                            'Pembayaran ini tidak lagi berada pada status yang dapat diverifikasi.',
                    ]);
                }

                if (
                    blank(
                        $perpanjangan
                            ->bukti_pembayaran
                    )
                    || ! Storage::disk('local')
                        ->exists(
                            $perpanjangan
                                ->bukti_pembayaran
                        )
                ) {
                    throw ValidationException::withMessages([
                        'pembayaran_perpanjangan' =>
                            'File bukti pembayaran tidak ditemukan.',
                    ]);
                }

                $sewa = Sewa::query()
                    ->with([
                        'user',
                        'kendaraan',
                    ])
                    ->lockForUpdate()
                    ->findOrFail(
                        $perpanjangan->sewa_id
                    );

                $admin = $request->user();

                /*
                 * Pembayaran ditolak.
                 */
                if (
                    $data['aksi'] ===
                    'tolak'
                ) {
                    $perpanjangan->update([
                        'status' =>
                            PerpanjanganSewa::STATUS_PEMBAYARAN_DITOLAK,

                        'pembayaran_diperiksa_pada' =>
                            now(),

                        'pembayaran_diperiksa_oleh' =>
                            $admin->id,

                        'alasan_penolakan_pembayaran' =>
                            $data[
                                'alasan_penolakan_pembayaran'
                            ],
                    ]);

                    $this->catatLog(
                        userId:
                            $admin->id,

                        jenis:
                            'Penolakan Pembayaran Perpanjangan',

                        deskripsi:
                            'Admin menolak pembayaran perpanjangan booking '
                            . $sewa->nomor_booking
                            . '. Keterangan: '
                            . $data[
                                'alasan_penolakan_pembayaran'
                            ]
                            . '.',

                        alamatIp:
                            $request->ip()
                    );

                    return [
                        'aksi' =>
                            'tolak_pembayaran',

                        'perpanjangan' =>
                            $perpanjangan
                                ->fresh(),

                        'sewa' =>
                            $sewa,
                    ];
                }

                /*
                 * Pemeriksaan ulang sebelum tanggal baru
                 * diterapkan ke transaksi utama.
                 */
                $this->pastikanSewaDapatDiperpanjang(
                    $sewa,
                    $perpanjangan
                );

                $this->pastikanKetersediaan(
                    sewa:
                        $sewa,

                    perpanjangan:
                        $perpanjangan
                );

                $totalHargaBaru =
                    max(
                        0,
                        (int) $sewa
                            ->total_harga
                    )
                    + max(
                        0,
                        (int) $perpanjangan
                            ->biaya_tambahan
                    );

                /*
                 * Tanggal dan total transaksi baru
                 * diterapkan setelah pembayaran disetujui.
                 */
                $sewa->update([
                    'tanggal_selesai' =>
                        $perpanjangan
                            ->tanggal_selesai_baru
                            ->format('Y-m-d'),

                    'total_harga' =>
                        $totalHargaBaru,
                ]);

                $perpanjangan->update([
                    'status' =>
                        PerpanjanganSewa::STATUS_SELESAI,

                    'pembayaran_diperiksa_pada' =>
                        now(),

                    'pembayaran_diperiksa_oleh' =>
                        $admin->id,

                    'alasan_penolakan_pembayaran' =>
                        null,

                    'diterapkan_pada' =>
                        now(),
                ]);

                $this->catatLog(
                    userId:
                        $admin->id,

                    jenis:
                        'Persetujuan Pembayaran Perpanjangan',

                    deskripsi:
                        'Admin menyetujui pembayaran perpanjangan booking '
                        . $sewa->nomor_booking
                        . ' sebesar Rp'
                        . number_format(
                            (int) $perpanjangan
                                ->biaya_tambahan,
                            0,
                            ',',
                            '.'
                        )
                        . '. Tanggal selesai diperbarui menjadi '
                        . $perpanjangan
                            ->tanggal_selesai_baru
                            ->format('d-m-Y')
                        . '.',

                    alamatIp:
                        $request->ip()
                );

                return [
                    'aksi' =>
                        'setujui_pembayaran',

                    'perpanjangan' =>
                        $perpanjangan
                            ->fresh(),

                    'sewa' =>
                        $sewa->fresh([
                            'user',
                            'kendaraan',
                        ]),
                ];
            }
        );

        $this->kirimNotifikasiKePelanggan(
            aksi:
                $hasil['aksi'],

            sewa:
                $hasil['sewa'],

            perpanjangan:
                $hasil['perpanjangan']
        );

        return redirect()
            ->route(
                'admin.perpanjangan.index',
                [
                    'perpanjangan' =>
                        $hasil[
                            'perpanjangan'
                        ]->id,
                ]
            )
            ->with(
                'success',
                $hasil['aksi'] ===
                    'setujui_pembayaran'
                    ? 'Pembayaran perpanjangan disetujui. Tanggal dan total transaksi telah diperbarui.'
                    : 'Pembayaran perpanjangan ditolak. Pelanggan dapat mengirim ulang bukti pembayaran.'
            );
    }

    /**
     * Menampilkan bukti pembayaran private
     * kepada admin.
     */
    public function buktiPembayaran(
        Request $request,
        int $perpanjanganId
    ): BinaryFileResponse {
        abort_unless(
            $request->user()?->role ===
                'admin',
            403
        );

        $perpanjangan =
            PerpanjanganSewa::query()
                ->findOrFail(
                    $perpanjanganId
                );

        $path =
            $perpanjangan
                ->bukti_pembayaran;

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
                ->path($path),
            [
                'Content-Disposition' =>
                    'inline',

                'Cache-Control' =>
                    'private, no-store, max-age=0',

                'Pragma' =>
                    'no-cache',
            ]
        );
    }

    /**
     * Memastikan transaksi masih memenuhi aturan
     * dasar perpanjangan.
     */
    private function pastikanSewaDapatDiperpanjang(
        Sewa $sewa,
        PerpanjanganSewa $perpanjangan
    ): void {
        if (
            ! in_array(
                $sewa->status,
                self::STATUS_SEWA_DAPAT_DIPERPANJANG,
                true
            )
        ) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Transaksi tidak lagi berada pada status yang dapat diperpanjang.',
            ]);
        }

        if (
            blank(
                $sewa->tanggal_selesai
            )
        ) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Tanggal selesai transaksi tidak ditemukan.',
            ]);
        }

        $tanggalSelesaiSekarang =
            Carbon::parse(
                $sewa->tanggal_selesai
            )->startOfDay();

        $tanggalSelesaiLama =
            Carbon::parse(
                $perpanjangan
                    ->tanggal_selesai_lama
            )->startOfDay();

        /*
         * Mencegah biaya atau tanggal diterapkan dua kali.
         */
        if (
            ! $tanggalSelesaiSekarang
                ->equalTo(
                    $tanggalSelesaiLama
                )
        ) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Tanggal selesai transaksi telah berubah. Muat ulang data dan periksa apakah perpanjangan sudah pernah diterapkan.',
            ]);
        }

        if (
            now()
                ->startOfDay()
                ->greaterThan(
                    $tanggalSelesaiSekarang
                )
        ) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Masa rental telah berakhir sehingga perpanjangan tidak dapat diterapkan.',
            ]);
        }

        if (
            ! $sewa->kendaraan
        ) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Data kendaraan tidak ditemukan.',
            ]);
        }
    }

    /**
     * Memeriksa ulang ketersediaan kendaraan.
     */
    private function pastikanKetersediaan(
        Sewa $sewa,
        PerpanjanganSewa $perpanjangan
    ): void {
        $kendaraan =
            Kendaraan::query()
                ->lockForUpdate()
                ->findOrFail(
                    $sewa->kendaraan_id
                );

        if (
            in_array(
                $kendaraan->status,
                [
                    'perbaikan',
                    'tidak_aktif',
                ],
                true
            )
        ) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Kendaraan sedang tidak aktif atau menjalani perbaikan.',
            ]);
        }

        $tanggalSelesaiLama =
            Carbon::parse(
                $perpanjangan
                    ->tanggal_selesai_lama
            )->startOfDay();

        $tanggalSelesaiBaru =
            Carbon::parse(
                $perpanjangan
                    ->tanggal_selesai_baru
            )->startOfDay();

        $tanggalMulaiTambahan =
            $tanggalSelesaiLama
                ->copy()
                ->addDay();

        if (
            $tanggalSelesaiBaru
                ->lessThan(
                    $tanggalMulaiTambahan
                )
        ) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Tanggal selesai baru tidak valid.',
            ]);
        }

        $jumlahBookingBentrok =
            Sewa::query()
                ->where(
                    'kendaraan_id',
                    $kendaraan->id
                )
                ->where(
                    'id',
                    '!=',
                    $sewa->id
                )
                ->whereIn(
                    'status',
                    self::STATUS_MEMAKAI_KUOTA
                )
                ->whereDate(
                    'tanggal_mulai',
                    '<=',
                    $tanggalSelesaiBaru
                        ->toDateString()
                )
                ->whereDate(
                    'tanggal_selesai',
                    '>=',
                    $tanggalMulaiTambahan
                        ->toDateString()
                )
                ->count();

        $jumlahUnit =
            max(
                1,
                (int) $kendaraan
                    ->jumlah_unit
            );

        if (
            $jumlahBookingBentrok >=
            $jumlahUnit
        ) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Perpanjangan tidak dapat diproses karena seluruh unit kendaraan sudah digunakan pada periode tambahan.',
            ]);
        }
    }

    /**
     * Mencatat aktivitas admin.
     */
    private function catatLog(
        int $userId,
        string $jenis,
        string $deskripsi,
        ?string $alamatIp
    ): void {
        LogAktivitas::query()->create([
            'user_id' =>
                $userId,

            'jenis_aktivitas' =>
                $jenis,

            'deskripsi' =>
                $deskripsi,

            'alamat_ip' =>
                $alamatIp,
        ]);
    }

    /**
     * Mengirim hasil keputusan kepada pelanggan.
     */
    private function kirimNotifikasiKePelanggan(
        string $aksi,
        Sewa $sewa,
        PerpanjanganSewa $perpanjangan
    ): void {
        try {
            $pelanggan =
                $sewa->user;

            if (! $pelanggan) {
                return;
            }

            if (
                $aksi ===
                'setujui_pengajuan'
            ) {
                $pelanggan->notify(
                    new NotifikasiTransaksi(
                        judul:
                            'Perpanjangan Rental Disetujui',

                        pesan:
                            'Pengajuan perpanjangan booking '
                            . $sewa->nomor_booking
                            . ' disetujui. Selesaikan pembayaran sebesar Rp'
                            . number_format(
                                (int) $perpanjangan
                                    ->biaya_tambahan,
                                0,
                                ',',
                                '.'
                            )
                            . ' agar tanggal selesai baru dapat diterapkan.',

                        jenis:
                            'perpanjangan_menunggu_pembayaran',

                        url:
                            '/pelanggan/perpanjangan/'
                            . $sewa->id,

                        sewaId:
                            $sewa->id,

                        nomorBooking:
                            $sewa->nomor_booking,

                        dataTambahan: [
                            'perpanjangan_id' =>
                                $perpanjangan->id,

                            'biaya_tambahan' =>
                                (int) $perpanjangan
                                    ->biaya_tambahan,

                            'status_baru' =>
                                PerpanjanganSewa::STATUS_MENUNGGU_PEMBAYARAN,
                        ],
                    )
                );

                return;
            }

            if (
                $aksi ===
                'tolak_pengajuan'
            ) {
                $pelanggan->notify(
                    new NotifikasiTransaksi(
                        judul:
                            'Pengajuan Perpanjangan Ditolak',

                        pesan:
                            'Pengajuan perpanjangan booking '
                            . $sewa->nomor_booking
                            . ' ditolak. Keterangan: '
                            . $perpanjangan
                                ->alasan_penolakan
                            . '.',

                        jenis:
                            'perpanjangan_ditolak',

                        url:
                            '/pelanggan/perpanjangan/'
                            . $sewa->id,

                        sewaId:
                            $sewa->id,

                        nomorBooking:
                            $sewa->nomor_booking,

                        dataTambahan: [
                            'perpanjangan_id' =>
                                $perpanjangan->id,

                            'alasan_penolakan' =>
                                $perpanjangan
                                    ->alasan_penolakan,

                            'status_baru' =>
                                PerpanjanganSewa::STATUS_DITOLAK,
                        ],
                    )
                );

                return;
            }

            if (
                $aksi ===
                'setujui_pembayaran'
            ) {
                $pelanggan->notify(
                    new NotifikasiTransaksi(
                        judul:
                            'Pembayaran Perpanjangan Disetujui',

                        pesan:
                            'Pembayaran perpanjangan booking '
                            . $sewa->nomor_booking
                            . ' telah disetujui. Tanggal selesai baru menjadi '
                            . $perpanjangan
                                ->tanggal_selesai_baru
                                ->format('d-m-Y')
                            . ' dan total transaksi menjadi Rp'
                            . number_format(
                                (int) $sewa
                                    ->total_harga,
                                0,
                                ',',
                                '.'
                            )
                            . '.',

                        jenis:
                            'pembayaran_perpanjangan_disetujui',

                        url:
                            '/pelanggan/perpanjangan/'
                            . $sewa->id,

                        sewaId:
                            $sewa->id,

                        nomorBooking:
                            $sewa->nomor_booking,

                        dataTambahan: [
                            'perpanjangan_id' =>
                                $perpanjangan->id,

                            'tanggal_selesai_baru' =>
                                $perpanjangan
                                    ->tanggal_selesai_baru
                                    ->format('Y-m-d'),

                            'total_harga_baru' =>
                                (int) $sewa
                                    ->total_harga,

                            'status_baru' =>
                                PerpanjanganSewa::STATUS_SELESAI,
                        ],
                    )
                );

                return;
            }

            if (
                $aksi ===
                'tolak_pembayaran'
            ) {
                $pelanggan->notify(
                    new NotifikasiTransaksi(
                        judul:
                            'Pembayaran Perpanjangan Ditolak',

                        pesan:
                            'Pembayaran perpanjangan booking '
                            . $sewa->nomor_booking
                            . ' ditolak. Keterangan: '
                            . $perpanjangan
                                ->alasan_penolakan_pembayaran
                            . '. Silakan kirim ulang bukti pembayaran.',

                        jenis:
                            'pembayaran_perpanjangan_ditolak',

                        url:
                            '/pelanggan/perpanjangan/'
                            . $sewa->id,

                        sewaId:
                            $sewa->id,

                        nomorBooking:
                            $sewa->nomor_booking,

                        dataTambahan: [
                            'perpanjangan_id' =>
                                $perpanjangan->id,

                            'alasan_penolakan_pembayaran' =>
                                $perpanjangan
                                    ->alasan_penolakan_pembayaran,

                            'status_baru' =>
                                PerpanjanganSewa::STATUS_PEMBAYARAN_DITOLAK,
                        ],
                    )
                );
            }
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
