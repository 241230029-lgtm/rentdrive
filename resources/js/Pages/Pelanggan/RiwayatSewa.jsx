import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';

const informasiStatus = {
    menunggu_konfirmasi_admin: {
        label: 'Menunggu Konfirmasi Admin',
        kelas:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
        keterangan:
            'Permintaan booking sedang diperiksa oleh admin.',
    },

    ditolak_booking: {
        label: 'Booking Ditolak',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        keterangan:
            'Permintaan booking tidak dapat dilanjutkan.',
    },

    menunggu_pembayaran: {
        label: 'Menunggu Pembayaran',
        kelas:
            'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
        keterangan:
            'Booking telah disetujui. Silakan unggah bukti pembayaran.',
    },

    menunggu_verifikasi_pembayaran: {
        label: 'Menunggu Verifikasi',
        kelas:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        keterangan:
            'Bukti pembayaran sedang diperiksa oleh admin.',
    },

    ditolak_pembayaran: {
        label: 'Pembayaran Ditolak',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        keterangan:
            'Bukti pembayaran perlu diperbaiki dan diunggah kembali.',
    },

    disetujui_operasional: {
        label: 'Booking Disetujui',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        keterangan:
            'Pembayaran telah disetujui dan booking siap diproses.',
    },

    sedang_berlangsung: {
        label: 'Sedang Berlangsung',
        kelas:
            'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        keterangan:
            'Kendaraan sedang berada dalam masa penyewaan.',
    },

    menunggu_verifikasi_pengembalian: {
        label: 'Verifikasi Pengembalian',
        kelas:
            'border-violet-500/30 bg-violet-500/10 text-violet-300',
        keterangan:
            'Data pengembalian sedang diperiksa oleh admin.',
    },

    selesai: {
        label: 'Selesai',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        keterangan:
            'Proses penyewaan telah selesai.',
    },

    dibatalkan: {
        label: 'Dibatalkan',
        kelas:
            'border-slate-500/30 bg-slate-500/10 text-slate-300',
        keterangan:
            'Transaksi booking telah dibatalkan.',
    },
};

const labelKategoriPenolakan = {
    kendaraan_diservis:
        'Kendaraan sedang diservis',

    stok_tidak_tersedia:
        'Kendaraan tidak tersedia',

    jadwal_bertabrakan:
        'Jadwal kendaraan bertabrakan',

    kendaraan_tidak_aktif:
        'Kendaraan tidak aktif',

    data_tidak_sesuai:
        'Data booking tidak sesuai',

    bukti_tidak_jelas:
        'Bukti pembayaran tidak jelas',

    nominal_tidak_sesuai:
        'Nominal pembayaran tidak sesuai',

    bukti_tidak_valid:
        'Bukti pembayaran tidak valid',

    rekening_tidak_sesuai:
        'Rekening tujuan tidak sesuai',

    lainnya:
        'Alasan lainnya',
};

const formatTanggal = (tanggal) => {
    if (!tanggal) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(
        new Date(`${tanggal}T00:00:00`)
    );
};

const formatTanggalWaktu = (tanggal) => {
    if (!tanggal) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(tanggal));
};

const formatHarga = (harga) => {
    return Number(
        harga ?? 0
    ).toLocaleString('id-ID');
};

function KartuRiwayat({ sewa }) {
    const unggahForm = useForm({
        bukti_pembayaran: null,
    });

    const status =
        informasiStatus[sewa.status] ?? {
            label:
                sewa.status ?? 'Menunggu',

            kelas:
                'border-amber-500/30 bg-amber-500/10 text-amber-300',

            keterangan:
                'Status transaksi sedang diproses.',
        };

    const dapatUnggahBukti =
        sewa.status ===
            'menunggu_pembayaran' ||
        sewa.status ===
            'ditolak_pembayaran';

    const bookingDitolak =
        sewa.status === 'ditolak_booking';

    const memilikiPenolakan = [
        'ditolak_booking',
        'ditolak_pembayaran',
    ].includes(sewa.status);

    const fotoKendaraan =
        sewa.kendaraan?.foto_kendaraan
            ? `/storage/${sewa.kendaraan.foto_kendaraan}`
            : null;

    const buktiPembayaran =
        sewa.bukti_pembayaran &&
        sewa.bukti_pembayaran !==
            'WALK_IN_CASH'
            ? `/storage/${sewa.bukti_pembayaran}`
            : null;

    const jenisBooking =
        sewa.jenis_booking === 'walk_in'
            ? 'Walk-In'
            : 'Online';

    const kirimBukti = (event) => {
        event.preventDefault();

        unggahForm.post(
            route(
                'pelanggan.sewa.pembayaran.unggah',
                sewa.id
            ),
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    unggahForm.reset();
                },
            }
        );
    };

    return (
        <article className="overflow-hidden rounded-2xl border border-slate-800 bg-[#1E293B] shadow-xl">
            <div className="grid lg:grid-cols-[240px_1fr]">
                {/* FOTO KENDARAAN */}
                <div className="flex min-h-56 items-center justify-center border-b border-slate-800 bg-[#0B1120] lg:border-b-0 lg:border-r">
                    {fotoKendaraan ? (
                        <img
                            src={fotoKendaraan}
                            alt={
                                sewa.kendaraan
                                    ?.nama_kendaraan ??
                                'Kendaraan RentDrive'
                            }
                            className="h-full min-h-56 w-full object-cover"
                        />
                    ) : (
                        <div className="text-center">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="mx-auto h-16 w-16 text-[#06B6D4]"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 13.5 5.5 8h13l2.5 5.5M5 13.5h14M6.5 17.5h.01M17.5 17.5h.01M5 13.5v5h2M19 13.5v5h-2"
                                />
                            </svg>

                            <p className="mt-3 text-xs text-[#64748B]">
                                Armada RentDrive
                            </p>
                        </div>
                    )}
                </div>

                {/* INFORMASI TRANSAKSI */}
                <div className="p-6 sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#06B6D4]">
                                    {sewa.nomor_booking}
                                </p>

                                <span className="rounded-md border border-slate-700 bg-[#0B1120] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                                    {jenisBooking}
                                </span>
                            </div>

                            <h2 className="mt-3 text-xl font-bold text-[#F8FAFC]">
                                {sewa.kendaraan
                                    ?.nama_kendaraan ??
                                    'Kendaraan RentDrive'}
                            </h2>

                            <p className="mt-1 text-sm text-[#94A3B8]">
                                {sewa.kendaraan?.merek ??
                                    'RentDrive'}
                            </p>
                        </div>

                        <span
                            className={`w-fit rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${status.kelas}`}
                        >
                            {status.label}
                        </span>
                    </div>

                    <p className="mt-5 rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-sm leading-6 text-[#94A3B8]">
                        {status.keterangan}
                    </p>

                    {/* RINCIAN TRANSAKSI */}
                    <div className="mt-6 grid gap-4 border-y border-slate-800 py-5 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                Tanggal Mulai
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#F8FAFC]">
                                {formatTanggal(
                                    sewa.tanggal_mulai
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                Tanggal Selesai
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#F8FAFC]">
                                {formatTanggal(
                                    sewa.tanggal_selesai
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                Total Biaya
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#06B6D4]">
                                Rp{' '}
                                {formatHarga(
                                    sewa.total_harga
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                Dibuat
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#F8FAFC]">
                                {formatTanggalWaktu(
                                    sewa.created_at
                                )}
                            </p>
                        </div>
                    </div>

                    {/* INFORMASI PENOLAKAN */}
                    {memilikiPenolakan &&
                        sewa.alasan_penolakan && (
                            <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300">
                                    {sewa.jenis_penolakan ===
                                    'pembayaran'
                                        ? 'Pembayaran Ditolak'
                                        : 'Booking Ditolak'}
                                </p>

                                {sewa.kategori_penolakan && (
                                    <p className="mt-3 font-bold text-rose-200">
                                        {labelKategoriPenolakan[
                                            sewa
                                                .kategori_penolakan
                                        ] ??
                                            sewa
                                                .kategori_penolakan}
                                    </p>
                                )}

                                <p className="mt-2 text-sm leading-7 text-rose-200/80">
                                    {
                                        sewa.alasan_penolakan
                                    }
                                </p>

                                {sewa.ditolak_pada && (
                                    <p className="mt-3 text-xs text-rose-300/60">
                                        Diproses pada{' '}
                                        {formatTanggalWaktu(
                                            sewa.ditolak_pada
                                        )}
                                    </p>
                                )}

                                {bookingDitolak && (
                                    <Link
                                        href={route(
                                            'pelanggan.katalog'
                                        )}
                                        viewTransition
                                        className="mt-5 inline-flex rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400"
                                    >
                                        Pilih Kendaraan Lain
                                    </Link>
                                )}
                            </div>
                        )}

                    {/* TOTAL DENDA */}
                    {Number(
                        sewa.total_denda ?? 0
                    ) > 0 && (
                        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                Rincian Denda
                            </p>

                            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                                <p className="text-amber-200/80">
                                    Keterlambatan
                                    <strong className="mt-1 block text-amber-200">
                                        Rp{' '}
                                        {formatHarga(
                                            sewa
                                                .denda_keterlambatan
                                        )}
                                    </strong>
                                </p>

                                <p className="text-amber-200/80">
                                    Kerusakan
                                    <strong className="mt-1 block text-amber-200">
                                        Rp{' '}
                                        {formatHarga(
                                            sewa
                                                .denda_kerusakan
                                        )}
                                    </strong>
                                </p>

                                <p className="text-amber-200/80">
                                    Total
                                    <strong className="mt-1 block text-amber-200">
                                        Rp{' '}
                                        {formatHarga(
                                            sewa.total_denda
                                        )}
                                    </strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* BUKTI YANG SUDAH DIUNGGAH */}
                    {buktiPembayaran &&
                        !dapatUnggahBukti && (
                            <div className="mt-5 rounded-xl border border-slate-700 bg-[#0B1120] p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-bold text-[#F8FAFC]">
                                            Bukti pembayaran telah
                                            diunggah
                                        </p>

                                        <p className="mt-1 text-xs text-[#64748B]">
                                            Bukti dapat dilihat
                                            selama proses
                                            transaksi.
                                        </p>
                                    </div>

                                    <a
                                        href={
                                            buktiPembayaran
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-fit rounded-xl border border-[#06B6D4]/60 px-4 py-2.5 text-sm font-bold text-[#06B6D4] hover:bg-[#06B6D4]/10"
                                    >
                                        Lihat Bukti
                                    </a>
                                </div>
                            </div>
                        )}

                    {/* FORM PEMBAYARAN */}
                    {dapatUnggahBukti && (
                        <form
                            onSubmit={kirimBukti}
                            className="mt-6 rounded-2xl border border-slate-700 bg-[#0B1120] p-5"
                        >
                            <h3 className="font-bold text-[#F8FAFC]">
                                {sewa.status ===
                                'ditolak_pembayaran'
                                    ? 'Unggah Ulang Bukti Pembayaran'
                                    : 'Unggah Bukti Pembayaran'}
                            </h3>

                            <p className="mt-2 text-xs leading-6 text-[#64748B]">
                                Gunakan gambar JPG, JPEG, PNG,
                                atau WebP dengan ukuran maksimal
                                2 MB.
                            </p>

                            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                        onChange={(
                                            event
                                        ) =>
                                            unggahForm.setData(
                                                'bukti_pembayaran',
                                                event.target
                                                    .files?.[0] ??
                                                    null
                                            )
                                        }
                                        className="block w-full rounded-xl border border-slate-700 bg-[#1E293B] px-3 py-2.5 text-sm text-[#94A3B8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#06B6D4] file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#0B1120]"
                                    />

                                    {unggahForm.errors
                                        .bukti_pembayaran && (
                                        <p className="mt-2 text-xs leading-5 text-rose-400">
                                            {
                                                unggahForm
                                                    .errors
                                                    .bukti_pembayaran
                                            }
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        unggahForm.processing ||
                                        !unggahForm.data
                                            .bukti_pembayaran
                                    }
                                    className="rounded-xl bg-[#06B6D4] px-5 py-3 text-sm font-bold text-[#0B1120] hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {unggahForm.processing
                                        ? 'Mengunggah...'
                                        : sewa.status ===
                                            'ditolak_pembayaran'
                                          ? 'Kirim Ulang Bukti'
                                          : 'Kirim Bukti'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function RiwayatSewa({
    riwayatSewa = [],
    flash,
}) {
    const daftarRiwayat = Array.isArray(
        riwayatSewa
    )
        ? riwayatSewa
        : [];

    return (
        <>
            <Head title="Riwayat Sewa" />

            <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                {/* NOTIFIKASI BERHASIL */}
                {flash?.success && (
                    <div className="mb-7 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm leading-6 text-emerald-300">
                        {flash.success}
                    </div>
                )}

                {/* NOTIFIKASI GAGAL */}
                {flash?.error && (
                    <div className="mb-7 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm leading-6 text-rose-300">
                        {flash.error}
                    </div>
                )}

                {/* HERO RIWAYAT */}
                <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#10192B] px-6 py-10 text-center shadow-2xl">
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#06B6D4]/10 blur-3xl" />

                    <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#06B6D4]">
                            Transaksi Pelanggan
                        </p>

                        <h1 className="mt-4 text-3xl font-extrabold text-[#F8FAFC] sm:text-4xl">
                            Riwayat Penyewaan
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#94A3B8]">
                            Pantau konfirmasi booking,
                            pembayaran, persetujuan admin,
                            penyewaan, pengembalian, dan rincian
                            denda kendaraan.
                        </p>
                    </div>
                </section>

                {/* DAFTAR RIWAYAT */}
                <section className="mt-10">
                    {daftarRiwayat.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-[#1E293B] px-6 py-16 text-center shadow-xl">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#06B6D4]/10">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    className="h-7 w-7 text-[#06B6D4]"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"
                                    />
                                </svg>
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-[#F8FAFC]">
                                Belum ada riwayat penyewaan
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#94A3B8]">
                                Riwayat transaksi akan muncul
                                setelah Anda mengajukan booking
                                melalui halaman katalog.
                            </p>

                            <Link
                                href={route(
                                    'pelanggan.katalog'
                                )}
                                viewTransition
                                className="mt-6 inline-flex rounded-xl bg-[#06B6D4] px-6 py-3 text-sm font-bold text-[#0B1120] hover:bg-[#0891B2]"
                            >
                                Buka Katalog
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {daftarRiwayat.map(
                                (sewa) => (
                                    <KartuRiwayat
                                        key={sewa.id}
                                        sewa={sewa}
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
