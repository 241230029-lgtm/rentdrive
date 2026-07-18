<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\StorePembayaranPerpanjanganRequest;
use App\Http\Requests\Pelanggan\StorePerpanjanganSewaRequest;
use App\Models\LogAktivitas;
use App\Models\PerpanjanganSewa;
use App\Models\Sewa;
use App\Models\User;
use App\Notifications\NotifikasiTransaksi;
use App\Services\PerpanjanganSewaService;
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

class PerpanjanganSewaController extends Controller
{
    public function __construct(
        private readonly PerpanjanganSewaService $service
    ) {
    }

    /**
     * Menampilkan halaman perpanjangan dan pembayaran
     * biaya tambahan perpanjangan.
     */
    public function show(
        Request $request,
        int $id
    ): Response {
        $pelanggan = $request->user();

        $sewa = Sewa::query()
            ->with([
                'kendaraan:id,nama_kendaraan,merek,foto_kendaraan,harga_per_hari',
            ])
            ->where('id', $id)
            ->where(
                'user_id',
                $pelanggan->id
            )
            ->firstOrFail();

        $perpanjanganTerakhir =
            PerpanjanganSewa::query()
                ->where(
                    'sewa_id',
                    $sewa->id
                )
                ->latest('id')
                ->first();

        $memilikiDendaBelumLunas =
            Sewa::query()
                ->where(
                    'user_id',
                    $pelanggan->id
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

        /*
         * Semua status berikut dianggap satu proses aktif.
         * Pelanggan tidak boleh membuat pengajuan baru
         * selama pembayaran sebelumnya belum selesai.
         */
        $memilikiProsesAktif =
            PerpanjanganSewa::query()
                ->where(
                    'sewa_id',
                    $sewa->id
                )
                ->whereIn(
                    'status',
                    PerpanjanganSewa::STATUS_PROSES_AKTIF
                )
                ->exists();

        $statusDapatDiperpanjang =
            in_array(
                $sewa->status,
                [
                    'disetujui_operasional',
                    'sedang_berlangsung',
                ],
                true
            );

        $masaRentalBelumBerakhir =
            $sewa->tanggal_selesai
            && now()
                ->startOfDay()
                ->lessThanOrEqualTo(
                    $sewa->tanggal_selesai
                        ->copy()
                        ->startOfDay()
                );

        $bolehMengajukan =
            $statusDapatDiperpanjang
            && $masaRentalBelumBerakhir
            && ! $memilikiDendaBelumLunas
            && ! $memilikiProsesAktif;

        $alasanTidakDapatMengajukan =
            $this->tentukanAlasanTidakDapatMengajukan(
                statusDapatDiperpanjang:
                    $statusDapatDiperpanjang,

                masaRentalBelumBerakhir:
                    $masaRentalBelumBerakhir,

                memilikiDendaBelumLunas:
                    $memilikiDendaBelumLunas,

                memilikiProsesAktif:
                    $memilikiProsesAktif,

                perpanjanganTerakhir:
                    $perpanjanganTerakhir
            );

        return Inertia::render(
            'Pelanggan/PerpanjanganSewa',
            [
                'sewa' => [
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

                    'total_harga' =>
                        (int) (
                            $sewa->total_harga
                            ?? 0
                        ),

                    'status' =>
                        $sewa->status,

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
                ],

                'perpanjanganTerakhir' =>
                    $this->transformPerpanjangan(
                        $perpanjanganTerakhir
                    ),

                'bolehMengajukan' =>
                    $bolehMengajukan,

                'memilikiDendaBelumLunas' =>
                    $memilikiDendaBelumLunas,

                'memilikiProsesAktif' =>
                    $memilikiProsesAktif,

                'alasanTidakDapatMengajukan' =>
                    $alasanTidakDapatMengajukan,
            ]
        );
    }

    /**
     * Menyimpan pengajuan perpanjangan baru.
     */
    public function store(
        StorePerpanjanganSewaRequest $request,
        int $id
    ): RedirectResponse {
        /*
         * Pengamanan tambahan agar request langsung
         * tidak dapat membuat pengajuan kedua.
         */
        $memilikiProsesAktif =
            PerpanjanganSewa::query()
                ->where(
                    'sewa_id',
                    $id
                )
                ->whereIn(
                    'status',
                    PerpanjanganSewa::STATUS_PROSES_AKTIF
                )
                ->exists();

        if ($memilikiProsesAktif) {
            throw ValidationException::withMessages([
                'perpanjangan' =>
                    'Transaksi ini masih mempunyai proses perpanjangan yang belum selesai. Selesaikan pembayaran atau tunggu keputusan admin.',
            ]);
        }

        $perpanjangan =
            $this->service->ajukan(
                sewaId:
                    $id,

                data:
                    $request->validated(),

                pelanggan:
                    $request->user(),

                alamatIp:
                    $request->ip()
            );

        return redirect()
            ->route(
                'pelanggan.perpanjangan.show',
                [
                    'id' =>
                        $perpanjangan->sewa_id,
                ]
            )
            ->with(
                'success',
                'Permintaan perpanjangan berhasil dikirim dan sedang menunggu persetujuan admin.'
            );
    }

    /**
     * Menyimpan pembayaran biaya tambahan perpanjangan.
     */
    public function storePembayaran(
        StorePembayaranPerpanjanganRequest $request,
        int $perpanjanganId
    ): RedirectResponse {
        $pelanggan =
            $request->user();

        $perpanjangan =
            PerpanjanganSewa::query()
                ->with([
                    'sewa.user',
                    'sewa.kendaraan',
                ])
                ->where(
                    'id',
                    $perpanjanganId
                )
                ->whereHas(
                    'sewa',
                    function ($query) use (
                        $pelanggan
                    ): void {
                        $query->where(
                            'user_id',
                            $pelanggan->id
                        );
                    }
                )
                ->firstOrFail();

        if (
            ! $perpanjangan
                ->bolehMengirimPembayaran()
        ) {
            throw ValidationException::withMessages([
                'pembayaran_perpanjangan' =>
                    'Pembayaran perpanjangan ini sudah dikirim, sudah selesai, atau belum disetujui admin.',
            ]);
        }

        if (
            (int) $perpanjangan
                ->biaya_tambahan <= 0
        ) {
            throw ValidationException::withMessages([
                'pembayaran_perpanjangan' =>
                    'Nominal biaya tambahan perpanjangan tidak valid.',
            ]);
        }

        $file =
            $request->file(
                'bukti_pembayaran'
            );

        $pathBaru =
            $file->store(
                'pembayaran_perpanjangan/'
                . $perpanjangan->id,
                'local'
            );

        $pathLama =
            $perpanjangan
                ->bukti_pembayaran;

        try {
            DB::transaction(
                function () use (
                    $request,
                    $perpanjanganId,
                    $pelanggan,
                    $pathBaru
                ): void {
                    $perpanjanganTerkunci =
                        PerpanjanganSewa::query()
                            ->with([
                                'sewa',
                            ])
                            ->lockForUpdate()
                            ->findOrFail(
                                $perpanjanganId
                            );

                    if (
                        ! $perpanjanganTerkunci
                            ->bolehMengirimPembayaran()
                    ) {
                        throw ValidationException::withMessages([
                            'pembayaran_perpanjangan' =>
                                'Status pembayaran perpanjangan telah berubah. Muat ulang halaman.',
                        ]);
                    }

                    $perpanjanganTerkunci->update([
                        'metode_pembayaran' =>
                            'transfer',

                        'bukti_pembayaran' =>
                            $pathBaru,

                        'dibayar_pada' =>
                            now(),

                        'pembayaran_diperiksa_pada' =>
                            null,

                        'pembayaran_diperiksa_oleh' =>
                            null,

                        'alasan_penolakan_pembayaran' =>
                            null,

                        'status' =>
                            PerpanjanganSewa::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN,
                    ]);

                    LogAktivitas::query()->create([
                        'user_id' =>
                            $pelanggan->id,

                        'jenis_aktivitas' =>
                            'Pembayaran Perpanjangan Rental',

                        'deskripsi' =>
                            'Pelanggan mengirim bukti pembayaran perpanjangan booking '
                            . (
                                $perpanjanganTerkunci
                                    ->sewa
                                    ?->nomor_booking
                                ?? '-'
                            )
                            . ' sebesar Rp'
                            . number_format(
                                (int) $perpanjanganTerkunci
                                    ->biaya_tambahan,
                                0,
                                ',',
                                '.'
                            )
                            . '.',

                        'alamat_ip' =>
                            $request->ip(),
                    ]);
                }
            );
        } catch (Throwable $exception) {
            Storage::disk('local')
                ->delete($pathBaru);

            throw $exception;
        }

        /*
         * File lama dihapus setelah transaksi berhasil.
         */
        if (
            filled($pathLama)
            && $pathLama !== $pathBaru
            && Storage::disk('local')
                ->exists($pathLama)
        ) {
            Storage::disk('local')
                ->delete($pathLama);
        }

        $perpanjangan =
            $perpanjangan->fresh([
                'sewa.user',
                'sewa.kendaraan',
            ]);

        $this->kirimNotifikasiPembayaranKeAdmin(
            $perpanjangan,
            $pelanggan
        );

        return redirect()
            ->route(
                'pelanggan.perpanjangan.show',
                [
                    'id' =>
                        $perpanjangan->sewa_id,
                ]
            )
            ->with(
                'success',
                'Bukti pembayaran perpanjangan berhasil dikirim dan sedang menunggu verifikasi admin.'
            );
    }

    /**
     * Menampilkan bukti pembayaran private milik
     * pelanggan yang sedang login.
     */
    public function buktiPembayaran(
        Request $request,
        int $perpanjanganId
    ): BinaryFileResponse {
        $perpanjangan =
            PerpanjanganSewa::query()
                ->where(
                    'id',
                    $perpanjanganId
                )
                ->whereHas(
                    'sewa',
                    function ($query) use (
                        $request
                    ): void {
                        $query->where(
                            'user_id',
                            $request->user()->id
                        );
                    }
                )
                ->firstOrFail();

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
     * Mengubah model perpanjangan menjadi data frontend.
     */
    private function transformPerpanjangan(
        ?PerpanjanganSewa $perpanjangan
    ): ?array {
        if (! $perpanjangan) {
            return null;
        }

        $buktiTersedia =
            filled(
                $perpanjangan
                    ->bukti_pembayaran
            )
            && Storage::disk('local')
                ->exists(
                    $perpanjangan
                        ->bukti_pembayaran
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

            'alasan_penolakan' =>
                $perpanjangan
                    ->alasan_penolakan,

            'diajukan_pada' =>
                $perpanjangan
                    ->diajukan_pada
                    ?->toIso8601String(),

            'diproses_pada' =>
                $perpanjangan
                    ->diproses_pada
                    ?->toIso8601String(),

            /*
             * Data pembayaran.
             */
            'metode_pembayaran' =>
                $perpanjangan
                    ->metode_pembayaran,

            'memiliki_bukti_pembayaran' =>
                $buktiTersedia,

            'url_bukti_pembayaran' =>
                $buktiTersedia
                    ? route(
                        'pelanggan.perpanjangan.bukti',
                        [
                            'perpanjanganId' =>
                                $perpanjangan->id,
                        ],
                        false
                    )
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

            'boleh_membayar' =>
                $perpanjangan
                    ->bolehMengirimPembayaran(),

            'menunggu_verifikasi_pembayaran' =>
                $perpanjangan
                    ->menungguVerifikasiPembayaran(),

            'proses_selesai' =>
                $perpanjangan
                    ->selesai(),
        ];
    }

    /**
     * Menentukan alasan form pengajuan baru tidak tampil.
     */
    private function tentukanAlasanTidakDapatMengajukan(
        bool $statusDapatDiperpanjang,
        bool $masaRentalBelumBerakhir,
        bool $memilikiDendaBelumLunas,
        bool $memilikiProsesAktif,
        ?PerpanjanganSewa $perpanjanganTerakhir
    ): ?string {
        if ($memilikiDendaBelumLunas) {
            return
                'Anda masih memiliki tagihan denda yang belum lunas. Selesaikan seluruh pembayaran denda sebelum mengajukan perpanjangan.';
        }

        if ($memilikiProsesAktif) {
            return match (
                $perpanjanganTerakhir?->status
            ) {
                PerpanjanganSewa::STATUS_MENUNGGU_PERSETUJUAN =>
                    'Permintaan perpanjangan sedang menunggu persetujuan admin.',

                PerpanjanganSewa::STATUS_MENUNGGU_PEMBAYARAN =>
                    'Permintaan telah disetujui. Selesaikan pembayaran biaya tambahan perpanjangan.',

                PerpanjanganSewa::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN =>
                    'Pembayaran perpanjangan sedang menunggu verifikasi admin.',

                PerpanjanganSewa::STATUS_PEMBAYARAN_DITOLAK =>
                    'Pembayaran perpanjangan ditolak. Kirim ulang bukti pembayaran yang benar.',

                default =>
                    'Proses perpanjangan sebelumnya belum selesai.',
            };
        }

        if (! $masaRentalBelumBerakhir) {
            return
                'Masa rental telah berakhir sehingga transaksi tidak dapat diperpanjang.';
        }

        if (! $statusDapatDiperpanjang) {
            return
                'Perpanjangan hanya tersedia untuk transaksi yang telah disetujui atau sedang berlangsung.';
        }

        return null;
    }

    /**
     * Mengirim notifikasi pembayaran baru kepada admin.
     */
    private function kirimNotifikasiPembayaranKeAdmin(
        PerpanjanganSewa $perpanjangan,
        User $pelanggan
    ): void {
        try {
            $sewa =
                $perpanjangan->sewa;

            if (! $sewa) {
                return;
            }

            $daftarAdmin =
                User::query()
                    ->where(
                        'role',
                        'admin'
                    )
                    ->get();

            if ($daftarAdmin->isEmpty()) {
                return;
            }

            Notification::send(
                $daftarAdmin,
                new NotifikasiTransaksi(
                    judul:
                        'Pembayaran Perpanjangan Baru',

                    pesan:
                        $pelanggan->name
                        . ' mengirim pembayaran perpanjangan booking '
                        . $sewa->nomor_booking
                        . ' sebesar Rp'
                        . number_format(
                            (int) $perpanjangan
                                ->biaya_tambahan,
                            0,
                            ',',
                            '.'
                        )
                        . '.',

                    jenis:
                        'pembayaran_perpanjangan_baru',

                    url:
                        '/admin/perpanjangan?perpanjangan='
                        . $perpanjangan->id,

                    sewaId:
                        $sewa->id,

                    nomorBooking:
                        $sewa->nomor_booking,

                    dataTambahan: [
                        'perpanjangan_id' =>
                            $perpanjangan->id,

                        'nama_pelanggan' =>
                            $pelanggan->name,

                        'biaya_tambahan' =>
                            (int) $perpanjangan
                                ->biaya_tambahan,

                        'status_baru' =>
                            PerpanjanganSewa::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN,
                    ],
                )
            );
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
