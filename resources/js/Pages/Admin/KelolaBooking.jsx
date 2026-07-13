import {
    Head,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';
import { useMemo, useState } from 'react';

const daftarStatus = {
    menunggu_konfirmasi_admin: {
        label: 'Menunggu Konfirmasi',
        kelas:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },

    ditolak_booking: {
        label: 'Booking Ditolak',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    menunggu_pembayaran: {
        label: 'Menunggu Pembayaran',
        kelas:
            'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    },

    menunggu_verifikasi_pembayaran: {
        label: 'Verifikasi Pembayaran',
        kelas:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },

    ditolak_pembayaran: {
        label: 'Pembayaran Ditolak',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    disetujui_operasional: {
        label: 'Disetujui',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },

    sedang_berlangsung: {
        label: 'Sedang Berlangsung',
        kelas:
            'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    },

    selesai: {
        label: 'Selesai',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },

    dibatalkan: {
        label: 'Dibatalkan',
        kelas:
            'border-slate-500/30 bg-slate-500/10 text-slate-300',
    },
};

const formatHarga = (nilai) => {
    return Number(nilai ?? 0).toLocaleString(
        'id-ID'
    );
};

const formatTanggal = (tanggal) => {
    if (!tanggal) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${tanggal}T00:00:00`));
};

function PesanValidasi({ pesan }) {
    if (!pesan) {
        return null;
    }

    return (
        <p className="mt-2 text-xs leading-5 text-rose-400">
            {pesan}
        </p>
    );
}

export default function KelolaBooking({
    bookings = [],
    pelanggans = [],
    kendaraans = [],
}) {
    const { flash, errors } = usePage().props;

    const [tabAktif, setTabAktif] =
        useState('online');

    const [
        modalPenolakan,
        setModalPenolakan,
    ] = useState(null);

    const [
        kategoriPenolakan,
        setKategoriPenolakan,
    ] = useState('');

    const [
        alasanPenolakan,
        setAlasanPenolakan,
    ] = useState('');

    const [
        sedangMenolak,
        setSedangMenolak,
    ] = useState(false);

    const [cekStok, setCekStok] = useState({
        kendaraan_id: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
    });

    const [hasilStok, setHasilStok] =
        useState(null);

    const [loadingStok, setLoadingStok] =
        useState(false);

    const walkInForm = useForm({
        pelanggan_id: '',
        kendaraan_id: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
    });

    const kendaraanDipilih = kendaraans.find(
        (kendaraan) =>
            Number(kendaraan.id) ===
            Number(
                walkInForm.data.kendaraan_id
            )
    );

    const durasiWalkIn = useMemo(() => {
        if (
            !walkInForm.data.tanggal_mulai ||
            !walkInForm.data.tanggal_selesai
        ) {
            return 0;
        }

        const mulai = new Date(
            `${walkInForm.data.tanggal_mulai}T00:00:00`
        );

        const selesai = new Date(
            `${walkInForm.data.tanggal_selesai}T00:00:00`
        );

        const selisih =
            (selesai.getTime() -
                mulai.getTime()) /
            86400000;

        return selisih > 0
            ? Math.floor(selisih)
            : 0;
    }, [
        walkInForm.data.tanggal_mulai,
        walkInForm.data.tanggal_selesai,
    ]);

    const totalWalkIn =
        durasiWalkIn *
        Number(
            kendaraanDipilih?.harga_per_hari ??
                0
        );

    const setujuiBooking = (bookingId) => {
        router.post(
            route(
                'admin.booking.konfirmasi',
                bookingId
            ),
            {
                aksi: 'setujui',
            },
            {
                preserveScroll: true,
            }
        );
    };

    const setujuiPembayaran = (
        bookingId
    ) => {
        router.post(
            route(
                'admin.booking.verifikasi',
                bookingId
            ),
            {
                aksi: 'setujui',
            },
            {
                preserveScroll: true,
            }
        );
    };

    const bukaModalPenolakan = (
        booking,
        jenis
    ) => {
        setModalPenolakan({
            booking,
            jenis,
        });

        setKategoriPenolakan('');
        setAlasanPenolakan('');
    };

    const tutupModalPenolakan = () => {
        if (sedangMenolak) {
            return;
        }

        setModalPenolakan(null);
        setKategoriPenolakan('');
        setAlasanPenolakan('');
    };

    const kirimPenolakan = (event) => {
        event.preventDefault();

        if (!modalPenolakan) {
            return;
        }

        setSedangMenolak(true);

        const routeTujuan =
            modalPenolakan.jenis ===
            'booking'
                ? route(
                    'admin.booking.konfirmasi',
                    modalPenolakan.booking.id
                )
                : route(
                    'admin.booking.verifikasi',
                    modalPenolakan.booking.id
                );

        router.post(
            routeTujuan,
            {
                aksi: 'tolak',
                kategori_penolakan:
                    kategoriPenolakan,
                alasan_penolakan:
                    alasanPenolakan,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setModalPenolakan(null);
                    setKategoriPenolakan('');
                    setAlasanPenolakan('');
                },

                onFinish: () => {
                    setSedangMenolak(false);
                },
            }
        );
    };

    const simpanWalkIn = (event) => {
        event.preventDefault();

        walkInForm.post(
            route('admin.booking.walkin'),
            {
                preserveScroll: true,

                onSuccess: () => {
                    walkInForm.reset();
                },
            }
        );
    };

    const periksaStok = async (event) => {
        event.preventDefault();

        setLoadingStok(true);
        setHasilStok(null);

        try {
            const parameter =
                new URLSearchParams({
                    kendaraan_id:
                        cekStok.kendaraan_id,

                    tanggal_mulai:
                        cekStok.tanggal_mulai,

                    tanggal_selesai:
                        cekStok.tanggal_selesai,
                });

            const response = await fetch(
                `${route(
                    'admin.booking.cek-ketersediaan'
                )}?${parameter.toString()}`,
                {
                    headers: {
                        Accept:
                            'application/json',

                        'X-Requested-With':
                            'XMLHttpRequest',
                    },
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                const pesanPertama =
                    Object.values(
                        data.errors ?? {}
                    )?.[0]?.[0];

                throw new Error(
                    pesanPertama ??
                        data.message ??
                        'Ketersediaan kendaraan gagal diperiksa.'
                );
            }

            setHasilStok(data);
        } catch (error) {
            setHasilStok({
                tersedia: false,
                pesan:
                    error.message ??
                    'Terjadi kesalahan saat memeriksa stok.',
            });
        } finally {
            setLoadingStok(false);
        }
    };

    return (
        <>
            <Head title="Kelola Booking" />

            <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                {flash?.success && (
                    <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm leading-6 text-emerald-300">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm leading-6 text-rose-300">
                        {flash.error}
                    </div>
                )}

                {errors?.aksi && (
                    <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm leading-6 text-rose-300">
                        {errors.aksi}
                    </div>
                )}

                <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#10192B] p-7 shadow-2xl sm:p-10">
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#06B6D4]/10 blur-3xl" />

                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#06B6D4]">
                            Operasional Rental
                        </p>

                        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                            Kelola Booking
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#94A3B8]">
                            Konfirmasi booking online,
                            verifikasi pembayaran, buat
                            booking walk-in, dan periksa stok
                            kendaraan berdasarkan tanggal.
                        </p>
                    </div>
                </section>

                <div className="mt-7 flex flex-wrap gap-3">
                    {[
                        [
                            'online',
                            'Booking Online',
                        ],
                        [
                            'walkin',
                            'Booking Walk-In',
                        ],
                        [
                            'stok',
                            'Cek Stok',
                        ],
                    ].map(([nilai, label]) => (
                        <button
                            key={nilai}
                            type="button"
                            onClick={() =>
                                setTabAktif(nilai)
                            }
                            className={
                                tabAktif === nilai
                                    ? 'rounded-xl bg-[#06B6D4] px-5 py-3 text-sm font-bold text-[#0B1120]'
                                    : 'rounded-xl border border-slate-700 bg-[#1E293B] px-5 py-3 text-sm font-bold text-[#94A3B8] transition hover:text-white'
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {tabAktif === 'online' && (
                    <section className="mt-7 space-y-5">
                        {bookings.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-[#1E293B] px-6 py-16 text-center text-sm text-[#94A3B8]">
                                Belum ada booking online.
                            </div>
                        ) : (
                            bookings.map((booking) => {
                                const informasi =
                                    daftarStatus[
                                        booking.status
                                    ] ?? {
                                        label:
                                            booking.status,

                                        kelas:
                                            'border-slate-500/30 bg-slate-500/10 text-slate-300',
                                    };

                                const fotoBukti =
                                    booking.bukti_pembayaran &&
                                    booking.bukti_pembayaran !==
                                        'WALK_IN_CASH'
                                        ? `/storage/${booking.bukti_pembayaran}`
                                        : null;

                                return (
                                    <article
                                        key={booking.id}
                                        className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-xl"
                                    >
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#06B6D4]">
                                                    {
                                                        booking.nomor_booking
                                                    }
                                                </p>

                                                <h2 className="mt-2 text-xl font-bold">
                                                    {booking
                                                        .kendaraan
                                                        ?.nama_kendaraan ??
                                                        '-'}
                                                </h2>

                                                <p className="mt-2 text-sm text-[#94A3B8]">
                                                    Pelanggan:{' '}
                                                    <strong className="text-[#F8FAFC]">
                                                        {booking
                                                            .user
                                                            ?.name ??
                                                            '-'}
                                                    </strong>
                                                </p>

                                                <p className="mt-1 text-xs text-[#64748B]">
                                                    {booking
                                                        .user
                                                        ?.email ??
                                                        '-'}
                                                </p>
                                            </div>

                                            <span
                                                className={`w-fit rounded-full border px-4 py-2 text-xs font-bold ${informasi.kelas}`}
                                            >
                                                {
                                                    informasi.label
                                                }
                                            </span>
                                        </div>

                                        <div className="mt-6 grid gap-4 border-y border-slate-800 py-5 sm:grid-cols-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                                    Mulai
                                                </p>

                                                <p className="mt-1 text-sm font-bold">
                                                    {formatTanggal(
                                                        booking.tanggal_mulai
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                                    Selesai
                                                </p>

                                                <p className="mt-1 text-sm font-bold">
                                                    {formatTanggal(
                                                        booking.tanggal_selesai
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                                    Total
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-[#06B6D4]">
                                                    Rp{' '}
                                                    {formatHarga(
                                                        booking.total_harga
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {booking.alasan_penolakan && (
                                            <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                                                <p className="text-xs font-bold uppercase tracking-wider text-rose-300">
                                                    Keterangan Penolakan
                                                </p>

                                                <p className="mt-2 text-sm leading-6 text-rose-200/80">
                                                    {
                                                        booking.alasan_penolakan
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {fotoBukti && (
                                            <div className="mt-5">
                                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                                    Bukti Pembayaran
                                                </p>

                                                <a
                                                    href={fotoBukti}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-block"
                                                >
                                                    <img
                                                        src={
                                                            fotoBukti
                                                        }
                                                        alt="Bukti pembayaran pelanggan"
                                                        className="h-40 w-56 rounded-xl border border-slate-700 object-cover transition hover:opacity-80"
                                                    />
                                                </a>
                                            </div>
                                        )}

                                        {booking.status ===
                                            'menunggu_konfirmasi_admin' && (
                                            <div className="mt-6 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setujuiBooking(
                                                            booking.id
                                                        )
                                                    }
                                                    className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#0B1120] transition hover:bg-emerald-400"
                                                >
                                                    Setujui Booking
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        bukaModalPenolakan(
                                                            booking,
                                                            'booking'
                                                        )
                                                    }
                                                    className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
                                                >
                                                    Tolak Booking
                                                </button>
                                            </div>
                                        )}

                                        {booking.status ===
                                            'menunggu_verifikasi_pembayaran' && (
                                            <div className="mt-6 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setujuiPembayaran(
                                                            booking.id
                                                        )
                                                    }
                                                    className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#0B1120] transition hover:bg-emerald-400"
                                                >
                                                    Setujui Pembayaran
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        bukaModalPenolakan(
                                                            booking,
                                                            'pembayaran'
                                                        )
                                                    }
                                                    className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
                                                >
                                                    Tolak Pembayaran
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                );
                            })
                        )}
                    </section>
                )}

                {tabAktif === 'walkin' && (
                    <section className="mt-7 rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-xl sm:p-8">
                        <h2 className="text-xl font-bold">
                            Booking Walk-In
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                            Gunakan formulir ini untuk pelanggan
                            yang datang langsung ke tempat
                            rental.
                        </p>

                        <form
                            onSubmit={simpanWalkIn}
                            className="mt-7 grid gap-5 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                    Pelanggan
                                </label>

                                <select
                                    value={
                                        walkInForm.data
                                            .pelanggan_id
                                    }
                                    onChange={(event) =>
                                        walkInForm.setData(
                                            'pelanggan_id',
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                                    required
                                >
                                    <option value="">
                                        Pilih pelanggan
                                    </option>

                                    {pelanggans.map(
                                        (pelanggan) => (
                                            <option
                                                key={
                                                    pelanggan.id
                                                }
                                                value={
                                                    pelanggan.id
                                                }
                                            >
                                                {
                                                    pelanggan.name
                                                }{' '}
                                                -{' '}
                                                {
                                                    pelanggan.email
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                <PesanValidasi
                                    pesan={
                                        walkInForm
                                            .errors
                                            .pelanggan_id
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                    Kendaraan
                                </label>

                                <select
                                    value={
                                        walkInForm.data
                                            .kendaraan_id
                                    }
                                    onChange={(event) =>
                                        walkInForm.setData(
                                            'kendaraan_id',
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                                    required
                                >
                                    <option value="">
                                        Pilih kendaraan
                                    </option>

                                    {kendaraans.map(
                                        (kendaraan) => (
                                            <option
                                                key={
                                                    kendaraan.id
                                                }
                                                value={
                                                    kendaraan.id
                                                }
                                            >
                                                {
                                                    kendaraan.nama_kendaraan
                                                }{' '}
                                                -{' '}
                                                {
                                                    kendaraan.status
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                <PesanValidasi
                                    pesan={
                                        walkInForm
                                            .errors
                                            .kendaraan_id
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                    Tanggal Mulai
                                </label>

                                <input
                                    type="date"
                                    value={
                                        walkInForm.data
                                            .tanggal_mulai
                                    }
                                    onChange={(event) =>
                                        walkInForm.setData(
                                            'tanggal_mulai',
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                                    required
                                />

                                <PesanValidasi
                                    pesan={
                                        walkInForm
                                            .errors
                                            .tanggal_mulai
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                    Tanggal Selesai
                                </label>

                                <input
                                    type="date"
                                    value={
                                        walkInForm.data
                                            .tanggal_selesai
                                    }
                                    onChange={(event) =>
                                        walkInForm.setData(
                                            'tanggal_selesai',
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                                    required
                                />

                                <PesanValidasi
                                    pesan={
                                        walkInForm
                                            .errors
                                            .tanggal_selesai
                                    }
                                />
                            </div>

                            <div className="rounded-xl border border-slate-700 bg-[#0B1120] p-5 md:col-span-2">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                            Durasi
                                        </p>

                                        <p className="mt-1 font-bold">
                                            {durasiWalkIn}{' '}
                                            hari
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                            Harga per Hari
                                        </p>

                                        <p className="mt-1 font-bold">
                                            Rp{' '}
                                            {formatHarga(
                                                kendaraanDipilih
                                                    ?.harga_per_hari
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-[#64748B]">
                                            Total
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-[#06B6D4]">
                                            Rp{' '}
                                            {formatHarga(
                                                totalWalkIn
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    walkInForm.processing ||
                                    durasiWalkIn <= 0
                                }
                                className="rounded-xl bg-[#06B6D4] px-6 py-3 font-bold text-[#0B1120] transition hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
                            >
                                {walkInForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Booking Walk-In'}
                            </button>
                        </form>
                    </section>
                )}

                {tabAktif === 'stok' && (
                    <section className="mt-7 rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-xl sm:p-8">
                        <h2 className="text-xl font-bold">
                            Cek Stok Kendaraan
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                            Jumlah unit tersedia dihitung dari
                            total unit dikurangi booking aktif
                            yang bertabrakan pada tanggal
                            tersebut.
                        </p>

                        <form
                            onSubmit={periksaStok}
                            className="mt-7 grid gap-5 md:grid-cols-3"
                        >
                            <select
                                value={
                                    cekStok.kendaraan_id
                                }
                                onChange={(event) =>
                                    setCekStok({
                                        ...cekStok,
                                        kendaraan_id:
                                            event.target
                                                .value,
                                    })
                                }
                                className="rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                                required
                            >
                                <option value="">
                                    Pilih kendaraan
                                </option>

                                {kendaraans.map(
                                    (kendaraan) => (
                                        <option
                                            key={
                                                kendaraan.id
                                            }
                                            value={
                                                kendaraan.id
                                            }
                                        >
                                            {
                                                kendaraan.nama_kendaraan
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <input
                                type="date"
                                value={
                                    cekStok.tanggal_mulai
                                }
                                onChange={(event) =>
                                    setCekStok({
                                        ...cekStok,
                                        tanggal_mulai:
                                            event.target
                                                .value,
                                    })
                                }
                                className="rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                                required
                            />

                            <input
                                type="date"
                                value={
                                    cekStok.tanggal_selesai
                                }
                                onChange={(event) =>
                                    setCekStok({
                                        ...cekStok,
                                        tanggal_selesai:
                                            event.target
                                                .value,
                                    })
                                }
                                className="rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                                required
                            />

                            <button
                                type="submit"
                                disabled={loadingStok}
                                className="rounded-xl bg-[#06B6D4] px-6 py-3 font-bold text-[#0B1120] transition hover:bg-[#0891B2] disabled:opacity-50 md:col-span-3"
                            >
                                {loadingStok
                                    ? 'Memeriksa...'
                                    : 'Cek Ketersediaan'}
                            </button>
                        </form>

                        {hasilStok && (
                            <div
                                className={`mt-6 rounded-2xl border p-6 ${
                                    hasilStok.tersedia
                                        ? 'border-emerald-500/30 bg-emerald-500/10'
                                        : 'border-rose-500/30 bg-rose-500/10'
                                }`}
                            >
                                <p className="font-bold">
                                    {hasilStok.pesan}
                                </p>

                                {hasilStok.total_unit !==
                                    undefined && (
                                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider opacity-70">
                                                Total Unit
                                            </p>

                                            <p className="mt-1 text-2xl font-extrabold">
                                                {
                                                    hasilStok.total_unit
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-wider opacity-70">
                                                Unit Terpakai
                                            </p>

                                            <p className="mt-1 text-2xl font-extrabold">
                                                {
                                                    hasilStok.unit_terpakai
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-wider opacity-70">
                                                Unit Tersedia
                                            </p>

                                            <p className="mt-1 text-2xl font-extrabold">
                                                {
                                                    hasilStok.unit_tersedia
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}
            </main>

            {modalPenolakan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm">
                    <form
                        onSubmit={kirimPenolakan}
                        className="w-full max-w-lg rounded-3xl border border-slate-700 bg-[#1E293B] p-7 shadow-2xl"
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#06B6D4]">
                            {
                                modalPenolakan.booking
                                    .nomor_booking
                            }
                        </p>

                        <h2 className="mt-3 text-2xl font-bold">
                            Tolak{' '}
                            {modalPenolakan.jenis ===
                            'booking'
                                ? 'Booking'
                                : 'Pembayaran'}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                            Keterangan berikut akan
                            ditampilkan kepada pelanggan.
                        </p>

                        <select
                            value={kategoriPenolakan}
                            onChange={(event) =>
                                setKategoriPenolakan(
                                    event.target.value
                                )
                            }
                            className="mt-6 w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                            required
                        >
                            <option value="">
                                Pilih kategori alasan
                            </option>

                            {modalPenolakan.jenis ===
                            'booking' ? (
                                <>
                                    <option value="kendaraan_diservis">
                                        Kendaraan sedang
                                        diservis
                                    </option>

                                    <option value="stok_tidak_tersedia">
                                        Kendaraan tidak
                                        tersedia
                                    </option>

                                    <option value="jadwal_bertabrakan">
                                        Jadwal kendaraan
                                        bertabrakan
                                    </option>

                                    <option value="kendaraan_tidak_aktif">
                                        Kendaraan tidak aktif
                                    </option>

                                    <option value="data_tidak_sesuai">
                                        Data booking tidak
                                        sesuai
                                    </option>

                                    <option value="lainnya">
                                        Alasan lainnya
                                    </option>
                                </>
                            ) : (
                                <>
                                    <option value="bukti_tidak_jelas">
                                        Bukti pembayaran
                                        tidak jelas
                                    </option>

                                    <option value="nominal_tidak_sesuai">
                                        Nominal pembayaran
                                        tidak sesuai
                                    </option>

                                    <option value="bukti_tidak_valid">
                                        Bukti pembayaran
                                        tidak valid
                                    </option>

                                    <option value="rekening_tidak_sesuai">
                                        Rekening tujuan tidak
                                        sesuai
                                    </option>

                                    <option value="lainnya">
                                        Alasan lainnya
                                    </option>
                                </>
                            )}
                        </select>

                        <textarea
                            value={alasanPenolakan}
                            onChange={(event) =>
                                setAlasanPenolakan(
                                    event.target.value
                                )
                            }
                            rows="5"
                            placeholder="Tuliskan keterangan penolakan secara jelas"
                            className="mt-4 w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-sm"
                            required
                        />

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={
                                    tutupModalPenolakan
                                }
                                className="rounded-xl border border-slate-600 px-5 py-3 font-bold text-[#94A3B8]"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    sedangMenolak
                                }
                                className="rounded-xl bg-rose-600 px-5 py-3 font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
                            >
                                {sedangMenolak
                                    ? 'Memproses...'
                                    : 'Konfirmasi Penolakan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
