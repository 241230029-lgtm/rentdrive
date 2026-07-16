import {
    Head,
    useForm,
} from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useState,
} from 'react';

const formatHarga = (harga) => {
    return Number(harga ?? 0).toLocaleString(
        'id-ID',
    );
};

const buatUrlFoto = (lokasiFoto) => {
    if (!lokasiFoto) {
        return null;
    }

    const lokasi = String(lokasiFoto).trim();

    if (
        lokasi.startsWith('http://') ||
        lokasi.startsWith('https://')
    ) {
        return lokasi;
    }

    const lokasiBersih =
        lokasi.replace(/^\/+/, '');

    if (
        lokasiBersih.startsWith('storage/') ||
        lokasiBersih.startsWith('images/')
    ) {
        return `/${lokasiBersih}`;
    }

    return `/storage/${lokasiBersih}`;
};

const formatTanggalInput = (tanggal) => {
    const tanggalLokal = new Date(tanggal);

    tanggalLokal.setMinutes(
        tanggalLokal.getMinutes() -
            tanggalLokal.getTimezoneOffset(),
    );

    return tanggalLokal
        .toISOString()
        .split('T')[0];
};

function FotoKendaraan({
    foto,
    nama,
}) {
    const [gagalDimuat, setGagalDimuat] =
        useState(false);

    if (!foto || gagalDimuat) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-[#06B6D4]">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-7 w-7"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 13.5 5.5 8h13l2.5 5.5M5 13.5h14M6.5 17.5h.01M17.5 17.5h.01M5 13.5v5h2M19 13.5v5h-2"
                        />
                    </svg>
                </div>

                <p className="mt-2 text-[10px] text-slate-500">
                    Foto belum tersedia
                </p>
            </div>
        );
    }

    return (
        <img
            src={foto}
            alt={nama}
            loading="lazy"
            onError={() =>
                setGagalDimuat(true)
            }
            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
        />
    );
}

function IkonPencarian() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <circle
                cx="11"
                cy="11"
                r="7"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m20 20-4-4"
            />
        </svg>
    );
}

export default function Katalog({
    kendaraans = [],
    flash,
}) {
    const [pencarian, setPencarian] =
        useState('');

    const [
        filterTransmisi,
        setFilterTransmisi,
    ] = useState('');

    const [
        halamanAktif,
        setHalamanAktif,
    ] = useState(1);

    const [
        kendaraanDipilih,
        setKendaraanDipilih,
    ] = useState(null);

    const jumlahPerHalaman = 8;

    const bookingForm = useForm({
        kendaraan_id: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
    });

    const daftarKendaraan = Array.isArray(
        kendaraans,
    )
        ? kendaraans
        : [];

    const tanggalHariIni = useMemo(() => {
        return formatTanggalInput(new Date());
    }, []);

    const daftarTransmisi = useMemo(() => {
        const hasil = daftarKendaraan
            .map((kendaraan) =>
                String(
                    kendaraan.transmisi ?? '',
                ).trim(),
            )
            .filter(Boolean);

        return [...new Set(hasil)].sort();
    }, [daftarKendaraan]);

    const hasilFilter = useMemo(() => {
        const kataKunci = pencarian
            .trim()
            .toLowerCase();

        return daftarKendaraan.filter(
            (kendaraan) => {
                const nama = String(
                    kendaraan.nama_kendaraan ??
                        '',
                ).toLowerCase();

                const merek = String(
                    kendaraan.merek ?? '',
                ).toLowerCase();

                const warna = String(
                    kendaraan.warna ?? '',
                ).toLowerCase();

                const transmisi = String(
                    kendaraan.transmisi ?? '',
                ).toLowerCase();

                const cocokPencarian =
                    !kataKunci ||
                    nama.includes(kataKunci) ||
                    merek.includes(kataKunci) ||
                    warna.includes(kataKunci) ||
                    transmisi.includes(kataKunci);

                const cocokTransmisi =
                    !filterTransmisi ||
                    kendaraan.transmisi ===
                        filterTransmisi;

                return (
                    cocokPencarian &&
                    cocokTransmisi
                );
            },
        );
    }, [
        daftarKendaraan,
        pencarian,
        filterTransmisi,
    ]);

    useEffect(() => {
        setHalamanAktif(1);
    }, [
        pencarian,
        filterTransmisi,
    ]);

    const jumlahHalaman = Math.max(
        1,
        Math.ceil(
            hasilFilter.length /
                jumlahPerHalaman,
        ),
    );

    const kendaraanHalaman = useMemo(() => {
        const posisiAwal =
            (halamanAktif - 1) *
            jumlahPerHalaman;

        return hasilFilter.slice(
            posisiAwal,
            posisiAwal +
                jumlahPerHalaman,
        );
    }, [
        hasilFilter,
        halamanAktif,
    ]);

    const tanggalSelesaiMinimum =
        useMemo(() => {
            if (
                !bookingForm.data
                    .tanggal_mulai
            ) {
                return tanggalHariIni;
            }

            const tanggal = new Date(
                `${bookingForm.data.tanggal_mulai}T00:00:00`,
            );

            tanggal.setDate(
                tanggal.getDate() + 1,
            );

            return formatTanggalInput(
                tanggal,
            );
        }, [
            bookingForm.data
                .tanggal_mulai,
            tanggalHariIni,
        ]);

    const durasiHari = useMemo(() => {
        const tanggalMulai =
            bookingForm.data.tanggal_mulai;

        const tanggalSelesai =
            bookingForm.data
                .tanggal_selesai;

        if (
            !tanggalMulai ||
            !tanggalSelesai
        ) {
            return 0;
        }

        const mulai = new Date(
            `${tanggalMulai}T00:00:00`,
        );

        const selesai = new Date(
            `${tanggalSelesai}T00:00:00`,
        );

        const selisih =
            selesai.getTime() -
            mulai.getTime();

        const jumlahHari =
            selisih / 86400000;

        return jumlahHari > 0
            ? Math.floor(jumlahHari)
            : 0;
    }, [
        bookingForm.data.tanggal_mulai,
        bookingForm.data
            .tanggal_selesai,
    ]);

    const estimasiTotal =
        durasiHari *
        Number(
            kendaraanDipilih
                ?.harga_per_hari ?? 0,
        );

    const bukaFormBooking = (
        kendaraan,
    ) => {
        setKendaraanDipilih(
            kendaraan,
        );

        bookingForm.clearErrors();

        bookingForm.setData({
            kendaraan_id:
                kendaraan.id,
            tanggal_mulai: '',
            tanggal_selesai: '',
        });
    };

    const tutupFormBooking = () => {
        if (bookingForm.processing) {
            return;
        }

        setKendaraanDipilih(null);
        bookingForm.reset();
        bookingForm.clearErrors();
    };

    const ubahTanggalMulai = (
        event,
    ) => {
        const tanggalBaru =
            event.target.value;

        bookingForm.setData(
            'tanggal_mulai',
            tanggalBaru,
        );

        if (
            bookingForm.data
                .tanggal_selesai &&
            bookingForm.data
                .tanggal_selesai <=
                tanggalBaru
        ) {
            bookingForm.setData(
                'tanggal_selesai',
                '',
            );
        }
    };

    const kirimBooking = (
        event,
    ) => {
        event.preventDefault();

        bookingForm.post(
            route(
                'pelanggan.sewa.simpan',
            ),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <>
            <Head title="Katalog Kendaraan" />

            <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        {flash.error}
                    </div>
                )}

                {/* Header katalog ringkas */}
                <section className="rounded-2xl border border-slate-800 bg-[#10192B] px-5 py-5 shadow-xl sm:px-6 sm:py-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                Katalog RentDrive
                            </p>

                            <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                                Pilih Kendaraan
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#94A3B8]">
                                Temukan kendaraan yang sesuai
                                dengan kebutuhan perjalanan
                                Anda.
                            </p>
                        </div>

                        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_180px] lg:max-w-2xl">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                    <IkonPencarian />
                                </div>

                                <input
                                    type="search"
                                    value={pencarian}
                                    onChange={(
                                        event,
                                    ) =>
                                        setPencarian(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Cari nama, merek, atau warna..."
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#06B6D4]"
                                />
                            </div>

                            <select
                                value={
                                    filterTransmisi
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setFilterTransmisi(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white outline-none focus:border-[#06B6D4]"
                            >
                                <option value="">
                                    Semua Transmisi
                                </option>

                                {daftarTransmisi.map(
                                    (
                                        transmisi,
                                    ) => (
                                        <option
                                            key={
                                                transmisi
                                            }
                                            value={
                                                transmisi
                                            }
                                        >
                                            {
                                                transmisi
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Informasi jumlah hasil */}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            Daftar Kendaraan
                        </h2>

                        <p className="mt-1 text-xs text-[#94A3B8]">
                            Menampilkan{' '}
                            {
                                kendaraanHalaman.length
                            }{' '}
                            dari{' '}
                            {hasilFilter.length}{' '}
                            kendaraan
                        </p>
                    </div>

                    {(pencarian ||
                        filterTransmisi) && (
                        <button
                            type="button"
                            onClick={() => {
                                setPencarian('');
                                setFilterTransmisi(
                                    '',
                                );
                            }}
                            className="w-fit text-xs font-bold text-[#06B6D4] hover:text-cyan-300"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                {/* Daftar kendaraan */}
                <section className="mt-4">
                    {hasilFilter.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {kendaraanHalaman.map(
                                    (
                                        kendaraan,
                                    ) => {
                                        const foto =
                                            buatUrlFoto(
                                                kendaraan.foto_kendaraan,
                                            );

                                        return (
                                            <article
                                                key={
                                                    kendaraan.id
                                                }
                                                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#1E293B] shadow-lg transition duration-300 hover:-translate-y-1 hover:border-[#06B6D4]/50"
                                            >
                                                {/* Foto lebih pendek */}
                                                <div className="relative h-36 border-b border-slate-800 bg-[#0B1120] sm:h-40">
                                                    <FotoKendaraan
                                                        foto={
                                                            foto
                                                        }
                                                        nama={
                                                            kendaraan.nama_kendaraan ??
                                                            'Kendaraan RentDrive'
                                                        }
                                                    />

                                                    {kendaraan.transmisi && (
                                                        <span className="absolute right-2.5 top-2.5 rounded-md border border-slate-700 bg-[#0B1120]/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] backdrop-blur">
                                                            {
                                                                kendaraan.transmisi
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Informasi ringkas */}
                                                <div className="flex flex-1 flex-col p-4">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#06B6D4]">
                                                        {kendaraan.merek ??
                                                            'RentDrive'}
                                                    </p>

                                                    <h3 className="mt-1 truncate text-base font-extrabold text-white">
                                                        {kendaraan.nama_kendaraan ??
                                                            'Nama kendaraan'}
                                                    </h3>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {kendaraan.tahun_pembuatan && (
                                                            <span className="rounded-md bg-[#0B1120] px-2 py-1 text-[10px] text-[#94A3B8]">
                                                                {
                                                                    kendaraan.tahun_pembuatan
                                                                }
                                                            </span>
                                                        )}

                                                        {kendaraan.kapasitas_penumpang && (
                                                            <span className="rounded-md bg-[#0B1120] px-2 py-1 text-[10px] text-[#94A3B8]">
                                                                {
                                                                    kendaraan.kapasitas_penumpang
                                                                }{' '}
                                                                orang
                                                            </span>
                                                        )}

                                                        {kendaraan.warna && (
                                                            <span className="max-w-[100px] truncate rounded-md bg-[#0B1120] px-2 py-1 text-[10px] capitalize text-[#94A3B8]">
                                                                {
                                                                    kendaraan.warna
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    {kendaraan.deskripsi_kendaraan && (
                                                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#94A3B8]">
                                                            {
                                                                kendaraan.deskripsi_kendaraan
                                                            }
                                                        </p>
                                                    )}

                                                    <div className="mt-auto pt-4">
                                                        <div className="border-t border-slate-800 pt-3">
                                                            <p className="text-[9px] uppercase tracking-wider text-slate-500">
                                                                Tarif
                                                                per
                                                                hari
                                                            </p>

                                                            <div className="mt-1 flex items-end justify-between gap-3">
                                                                <p className="min-w-0 truncate text-base font-extrabold text-white">
                                                                    Rp{' '}
                                                                    {formatHarga(
                                                                        kendaraan.harga_per_hari,
                                                                    )}
                                                                </p>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        bukaFormBooking(
                                                                            kendaraan,
                                                                        )
                                                                    }
                                                                    className="shrink-0 rounded-lg bg-[#06B6D4] px-3.5 py-2 text-xs font-bold text-[#0B1120] transition hover:bg-[#0891B2]"
                                                                >
                                                                    Pesan
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    },
                                )}
                            </div>

                            {/* Pagination */}
                            {jumlahHalaman >
                                1 && (
                                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#10192B] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-center text-xs text-[#94A3B8] sm:text-left">
                                        Halaman{' '}
                                        {
                                            halamanAktif
                                        }{' '}
                                        dari{' '}
                                        {
                                            jumlahHalaman
                                        }
                                    </p>

                                    <div className="flex justify-center gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                halamanAktif ===
                                                1
                                            }
                                            onClick={() =>
                                                setHalamanAktif(
                                                    (
                                                        halaman,
                                                    ) =>
                                                        Math.max(
                                                            1,
                                                            halaman -
                                                                1,
                                                        ),
                                                )
                                            }
                                            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Sebelumnya
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                halamanAktif ===
                                                jumlahHalaman
                                            }
                                            onClick={() =>
                                                setHalamanAktif(
                                                    (
                                                        halaman,
                                                    ) =>
                                                        Math.min(
                                                            jumlahHalaman,
                                                            halaman +
                                                                1,
                                                        ),
                                                )
                                            }
                                            className="rounded-lg bg-[#06B6D4] px-4 py-2 text-xs font-bold text-[#0B1120] transition hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Berikutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-2xl border border-slate-800 bg-[#1E293B] px-5 py-10 text-center shadow-lg">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-[#06B6D4]">
                                <IkonPencarian />
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-white">
                                Kendaraan tidak
                                ditemukan
                            </h3>

                            <p className="mt-2 text-sm text-[#94A3B8]">
                                Coba ubah kata pencarian
                                atau filter transmisi.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setPencarian('');
                                    setFilterTransmisi(
                                        '',
                                    );
                                }}
                                className="mt-4 rounded-lg bg-[#06B6D4] px-4 py-2 text-sm font-bold text-[#0B1120]"
                            >
                                Tampilkan Semua
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {/* Modal booking ringkas */}
            {kendaraanDipilih && (
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/75 backdrop-blur-sm sm:items-center sm:p-5"
                    onClick={
                        tutupFormBooking
                    }
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="judul-booking"
                        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-slate-700 bg-[#1E293B] shadow-2xl sm:rounded-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
                            {/* Ringkasan kendaraan */}
                            <div className="border-b border-slate-700 bg-[#0B1120] p-4 md:border-b-0 md:border-r">
                                <div className="h-32 overflow-hidden rounded-xl border border-slate-800 bg-[#10192B] md:h-44">
                                    <FotoKendaraan
                                        foto={buatUrlFoto(
                                            kendaraanDipilih.foto_kendaraan,
                                        )}
                                        nama={
                                            kendaraanDipilih.nama_kendaraan ??
                                            'Kendaraan RentDrive'
                                        }
                                    />
                                </div>

                                <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#06B6D4]">
                                    {kendaraanDipilih.merek ??
                                        'RentDrive'}
                                </p>

                                <h2
                                    id="judul-booking"
                                    className="mt-1 text-lg font-extrabold text-white"
                                >
                                    {
                                        kendaraanDipilih.nama_kendaraan
                                    }
                                </h2>

                                <p className="mt-2 text-sm font-bold text-[#06B6D4]">
                                    Rp{' '}
                                    {formatHarga(
                                        kendaraanDipilih.harga_per_hari,
                                    )}

                                    <span className="ml-1 text-xs font-normal text-[#94A3B8]">
                                        /hari
                                    </span>
                                </p>
                            </div>

                            {/* Form */}
                            <div className="p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#06B6D4]">
                                            Form Booking
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[#94A3B8]">
                                            Tentukan tanggal
                                            penyewaan.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            tutupFormBooking
                                        }
                                        disabled={
                                            bookingForm.processing
                                        }
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-lg text-[#94A3B8] hover:border-rose-500/50 hover:text-rose-400"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form
                                    onSubmit={
                                        kirimBooking
                                    }
                                    className="mt-4"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="tanggal_mulai"
                                                className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]"
                                            >
                                                Mulai
                                            </label>

                                            <input
                                                id="tanggal_mulai"
                                                type="date"
                                                min={
                                                    tanggalHariIni
                                                }
                                                value={
                                                    bookingForm
                                                        .data
                                                        .tanggal_mulai
                                                }
                                                onChange={
                                                    ubahTanggalMulai
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-sm text-white outline-none focus:border-[#06B6D4]"
                                            />

                                            {bookingForm
                                                .errors
                                                .tanggal_mulai && (
                                                <p className="mt-1.5 text-xs leading-5 text-rose-400">
                                                    {
                                                        bookingForm
                                                            .errors
                                                            .tanggal_mulai
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="tanggal_selesai"
                                                className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]"
                                            >
                                                Selesai
                                            </label>

                                            <input
                                                id="tanggal_selesai"
                                                type="date"
                                                min={
                                                    tanggalSelesaiMinimum
                                                }
                                                disabled={
                                                    !bookingForm
                                                        .data
                                                        .tanggal_mulai
                                                }
                                                value={
                                                    bookingForm
                                                        .data
                                                        .tanggal_selesai
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    bookingForm.setData(
                                                        'tanggal_selesai',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-sm text-white outline-none focus:border-[#06B6D4] disabled:cursor-not-allowed disabled:opacity-50"
                                            />

                                            {bookingForm
                                                .errors
                                                .tanggal_selesai && (
                                                <p className="mt-1.5 text-xs leading-5 text-rose-400">
                                                    {
                                                        bookingForm
                                                            .errors
                                                            .tanggal_selesai
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {bookingForm
                                        .errors
                                        .kendaraan_id && (
                                        <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                                            {
                                                bookingForm
                                                    .errors
                                                    .kendaraan_id
                                            }
                                        </p>
                                    )}

                                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-700 bg-[#0B1120] p-3">
                                        <div>
                                            <p className="text-[9px] uppercase tracking-wider text-slate-500">
                                                Durasi
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-white">
                                                {durasiHari >
                                                0
                                                    ? `${durasiHari} hari`
                                                    : '-'}
                                            </p>
                                        </div>

                                        <div className="border-l border-slate-700 pl-3 text-right">
                                            <p className="text-[9px] uppercase tracking-wider text-slate-500">
                                                Estimasi
                                            </p>

                                            <p className="mt-1 text-sm font-extrabold text-[#06B6D4]">
                                                Rp{' '}
                                                {formatHarga(
                                                    estimasiTotal,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={
                                                tutupFormBooking
                                            }
                                            disabled={
                                                bookingForm.processing
                                            }
                                            className="w-full rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-bold text-[#94A3B8] hover:bg-slate-800 sm:w-auto"
                                        >
                                            Batal
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                bookingForm.processing ||
                                                durasiHari <=
                                                    0
                                            }
                                            className="w-full rounded-lg bg-[#06B6D4] px-4 py-2.5 text-sm font-bold text-[#0B1120] hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                        >
                                            {bookingForm.processing
                                                ? 'Memproses...'
                                                : 'Ajukan Booking'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
