<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\UploadBuktiPembayaranRequest;
use App\Models\Sewa;
use App\Models\User;
use App\Notifications\NotifikasiTransaksi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class PembayaranController extends Controller
{
    /**
     * Menampilkan halaman pembayaran khusus milik pelanggan.
     *
     * Halaman ini digunakan untuk:
     * - melihat instruksi pembayaran dummy;
     * - mengunggah atau mengunggah ulang bukti;
     * - melihat bukti yang sudah dikirim;
     * - melihat hasil verifikasi admin.
     */
    public function show(
        Request $request,
        int $id
    ): Response|RedirectResponse {
        $sewa = Sewa::query()
            ->with([
                'kendaraan:id,nama_kendaraan,merek,foto_kendaraan,harga_per_hari',
            ])
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        /*
         * Pembayaran walk-in dicatat langsung oleh admin dan tidak
         * menggunakan alur upload bukti pembayaran pelanggan.
         */
        if (
            $sewa->jenis_booking === 'walk_in' ||
            $sewa->bukti_pembayaran === 'WALK_IN_CASH'
        ) {
            return redirect()
                ->route('pelanggan.riwayat', [
                    'sewa' => $sewa->id,
                ])
                ->with(
                    'error',
                    'Transaksi walk-in tidak memerlukan pembayaran online.'
                );
        }

        /*
         * Halaman pembayaran baru dapat dibuka setelah booking
         * disetujui oleh admin.
         */
        $statusYangMemilikiDetailPembayaran = [
            'menunggu_pembayaran',
            'ditolak_pembayaran',
            'menunggu_verifikasi_pembayaran',
            'disetujui_operasional',
            'sedang_berlangsung',
            'menunggu_verifikasi_pengembalian',
            'selesai',
        ];

        if (
            ! in_array(
                $sewa->status,
                $statusYangMemilikiDetailPembayaran,
                true
            )
        ) {
            return redirect()
                ->route('pelanggan.riwayat', [
                    'sewa' => $sewa->id,
                ])
                ->with(
                    'error',
                    'Halaman pembayaran belum tersedia untuk status booking ini.'
                );
        }

        $dapatMengunggah = in_array(
            $sewa->status,
            [
                'menunggu_pembayaran',
                'ditolak_pembayaran',
            ],
            true
        );

        $statusPembayaran = match ($sewa->status) {
            'menunggu_pembayaran' => 'belum_dibayar',
            'ditolak_pembayaran' => 'ditolak',
            'menunggu_verifikasi_pembayaran' => 'menunggu_verifikasi',
            default => 'disetujui',
        };

        $buktiPembayaran = null;

        if (
            $sewa->bukti_pembayaran &&
            $sewa->bukti_pembayaran !== 'WALK_IN_CASH'
        ) {
Storage::url(
    $sewa->kendaraan->foto_kendaraan );
        }

        return Inertia::render('Pelanggan/Pembayaran', [
            /*
             * Data transaksi yang aman untuk pelanggan.
             * Informasi jumlah unit, stok, plat nomor, dan kondisi
             * operasional internal tidak dikirim ke browser.
             */
            'pembayaran' => [
                'id' => $sewa->id,
                'nomor_booking' => $sewa->nomor_booking,
                'jenis_booking' => $sewa->jenis_booking,
                'tanggal_mulai' => $sewa->tanggal_mulai
                    ?->format('Y-m-d'),
                'tanggal_selesai' => $sewa->tanggal_selesai
                    ?->format('Y-m-d'),
                'total_harga' => (int) $sewa->total_harga,
                'status_transaksi' => $sewa->status,
                'status_pembayaran' => $statusPembayaran,
                'dapat_mengunggah' => $dapatMengunggah,
                'bukti_pembayaran' => $buktiPembayaran,
                'alasan_penolakan' =>
                    $sewa->status === 'ditolak_pembayaran'
                        ? $sewa->alasan_penolakan
                        : null,
                'terakhir_diperbarui' => $sewa->updated_at
                    ?->toIso8601String(),
                'kendaraan' => $sewa->kendaraan
                    ? [
                        'id' => $sewa->kendaraan->id,
                        'nama_kendaraan' =>
                            $sewa->kendaraan->nama_kendaraan,
                        'merek' => $sewa->kendaraan->merek,
                        'foto_kendaraan' =>
                            $sewa->kendaraan->foto_kendaraan
                                ? Storage::url(
                                    $sewa->bukti_pembayaran
                                )
                                : null,
                        'harga_per_hari' =>
                            (int) $sewa->kendaraan->harga_per_hari,
                    ]
                    : null,
            ],

            /*
             * Konfigurasi dummy dari config/rentdrive.php.
             */
            'informasiPembayaran' => [
                'mode_demo' => (bool) config(
                    'rentdrive.payment.is_demo',
                    true
                ),
                'nama_bank' => config(
                    'rentdrive.payment.bank_name',
                    'BANK DEMO'
                ),
                'nomor_rekening' => config(
                    'rentdrive.payment.bank_account',
                    '1234567890'
                ),
                'atas_nama' => config(
                    'rentdrive.payment.bank_holder',
                    'RENTDRIVE DEMO'
                ),
                'batas_waktu_jam' => (int) config(
                    'rentdrive.payment.deadline_hours',
                    24
                ),
            ],
        ]);
    }

    /**
     * Menyimpan bukti pembayaran pelanggan.
     *
     * Setelah bukti berhasil disimpan, seluruh admin menerima
     * notifikasi yang mengarah langsung ke transaksi terkait.
     */
    public function store(
        UploadBuktiPembayaranRequest $request,
        int $id
    ): RedirectResponse {
        $data = $request->validated();

        $fileBaru = null;
        $fileLama = null;
        $unggahUlang = false;

        try {
            DB::transaction(function () use (
                $request,
                $id,
                $data,
                &$fileBaru,
                &$fileLama,
                &$unggahUlang
            ): void {
                $sewa = Sewa::query()
                    ->with([
                        'user:id,name,email',
                        'kendaraan:id,nama_kendaraan,merek',
                    ])
                    ->where('id', $id)
                    ->where('user_id', $request->user()->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if (
                    $sewa->jenis_booking === 'walk_in' ||
                    $sewa->bukti_pembayaran === 'WALK_IN_CASH'
                ) {
                    throw new RuntimeException(
                        'Transaksi walk-in tidak menggunakan pembayaran online.'
                    );
                }

                if (
                    ! in_array(
                        $sewa->status,
                        [
                            'menunggu_pembayaran',
                            'ditolak_pembayaran',
                        ],
                        true
                    )
                ) {
                    throw new RuntimeException(
                        'Bukti pembayaran tidak dapat diunggah pada status transaksi ini.'
                    );
                }

                $unggahUlang =
                    $sewa->status === 'ditolak_pembayaran';

                $fileLama = $sewa->bukti_pembayaran;

                $fileBaru = $data['bukti_pembayaran']->store(
                    'bukti_pembayaran',
                    'public'
                );

                $sewa->update([
                    'bukti_pembayaran' => $fileBaru,
                    'status' => 'menunggu_verifikasi_pembayaran',
                    'alasan_penolakan' => null,
                    'jenis_penolakan' => null,
                    'kategori_penolakan' => null,
                    'ditolak_oleh' => null,
                    'ditolak_pada' => null,
                ]);

                $daftarAdmin = User::query()
                    ->where('role', 'admin')
                    ->get();

                if ($daftarAdmin->isNotEmpty()) {
                    Notification::send(
                        $daftarAdmin,
                        new NotifikasiTransaksi(
                            judul: $unggahUlang
                                ? 'Bukti Pembayaran Diunggah Ulang'
                                : 'Bukti Pembayaran Baru',
                            pesan:
                                $sewa->user->name
                                . ($unggahUlang
                                    ? ' mengunggah ulang bukti pembayaran untuk booking '
                                    : ' mengunggah bukti pembayaran untuk booking ')
                                . $sewa->nomor_booking
                                . ' menggunakan '
                                . ($sewa->kendaraan?->nama_kendaraan
                                    ?? 'kendaraan RentDrive')
                                . '.',
                            jenis: 'pembayaran_baru',
                            url:
                                '/admin/booking?sewa='
                                . $sewa->id
                                . '&detail=pembayaran',
                            sewaId: $sewa->id,
                            nomorBooking: $sewa->nomor_booking,
                            dataTambahan: [
                                'nama_pelanggan' =>
                                    $sewa->user->name,
                                'kendaraan' =>
                                    $sewa->kendaraan?->nama_kendaraan,
                                'unggah_ulang' => $unggahUlang,
                                'status_baru' =>
                                    'menunggu_verifikasi_pembayaran',
                            ],
                        )
                    );
                }
            });
        } catch (Throwable $exception) {
            /*
             * File baru harus dihapus apabila transaksi database gagal.
             */
            if ($fileBaru) {
                Storage::disk('public')->delete($fileBaru);
            }

            if ($exception instanceof RuntimeException) {
                return back()->with(
                    'error',
                    $exception->getMessage()
                );
            }

            throw $exception;
        }

        /*
         * Bukti lama baru dihapus setelah seluruh proses berhasil.
         */
        if (
            $fileLama &&
            $fileLama !== 'WALK_IN_CASH' &&
            $fileLama !== $fileBaru
        ) {
            Storage::disk('public')->delete($fileLama);
        }

        return redirect()
            ->route('pelanggan.pembayaran.show', [
                'id' => $id,
            ])
            ->with(
                'success',
                $unggahUlang
                    ? 'Bukti pembayaran berhasil diunggah ulang dan sedang menunggu verifikasi admin.'
                    : 'Bukti pembayaran berhasil dikirim dan sedang menunggu verifikasi admin.'
            );
    }
}
