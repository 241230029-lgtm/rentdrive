import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Katalog({
    kendaraans = [],
    flash,
}) {
    const [cari, setCari] = useState('');
    const [kendaraanDipilih, setKendaraanDipilih] =
        useState(null);

    const bookingForm = useForm({
        kendaraan_id: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
    });

    const daftarKendaraan = Array.isArray(kendaraans)
        ? kendaraans
        : [];

    const tanggalHariIni = useMemo(() => {
        const tanggal = new Date();

        tanggal.setMinutes(
            tanggal.getMinutes() -
                tanggal.getTimezoneOffset(),
        );

        return tanggal.toISOString().split('T')[0];
    }, []);

    const kendaraanDifilter = useMemo(() => {
        const kataKunci = cari.trim().toLowerCase();

        if (!kataKunci) {
            return daftarKendaraan;
        }

        return daftarKendaraan.filter((kendaraan) => {
            const nama =
                kendaraan.nama_kendaraan
                    ?.toLowerCase() ?? '';

            const merek =
                kendaraan.merek?.toLowerCase() ?? '';

            const transmisi =
                kendaraan.transmisi?.toLowerCase() ?? '';

            return (
                nama.includes(kataKunci) ||
                merek.includes(kataKunci) ||
                transmisi.includes(kataKunci)
            );
        });
    }, [cari, daftarKendaraan]);

    const durasiHari = useMemo(() => {
        if (
            !bookingForm.data.tanggal_mulai ||
            !bookingForm.data.tanggal_selesai
        ) {
            return 0;
        }

        const mulai = new Date(
            `${bookingForm.data.tanggal_mulai}T00:00:00`,
        );

        const selesai = new Date(
            `${bookingForm.data.tanggal_selesai}T00:00:00`,
        );

        const selisih =
            (selesai.getTime() - mulai.getTime()) /
            86400000;

        return selisih > 0 ? Math.floor(selisih) : 0;
    }, [
        bookingForm.data.tanggal_mulai,
        bookingForm.data.tanggal_selesai,
    ]);

    const estimasiTotal =
        durasiHari *
        Number(kendaraanDipilih?.harga_per_hari ?? 0);

    const formatHarga = (harga) => {
        return Number(harga ?? 0).toLocaleString('id-ID');
    };

    const alamatFoto = (kendaraan) => {
        if (!kendaraan.foto_kendaraan) {
            return null;
        }

        return `/storage/${kendaraan.foto_kendaraan}`;
    };

    const bukaFormBooking = (kendaraan) => {
        setKendaraanDipilih(kendaraan);

        bookingForm.clearErrors();

        bookingForm.setData({
            kendaraan_id: kendaraan.id,
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

    const kirimBooking = (event) => {
        event.preventDefault();

        bookingForm.post(
            route('pelanggan.sewa.simpan'),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <>
            <Head title="Katalog Kendaraan" />

            <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                {flash?.success && (
                    <div className="mb-7 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-7 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                        {flash.error}
                    </div>
                )}

                <section className="rounded-3xl border border-slate-800 bg-[#10192B] px-6 py-10 text-center shadow-2xl sm:px-10">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#06B6D4]">
                        Katalog Pelanggan
                    </p>

                    <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                        Pilih Kendaraan Perjalanan Anda
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#94A3B8]">
                        Tentukan kendaraan dan jadwal penyewaan.
                        Permintaan Anda akan diperiksa melalui sistem
                        RentDrive.
                    </p>

                    <div className="relative mx-auto mt-8 max-w-xl">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5 text-slate-500"
                            >
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="8"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m21 21-4.3-4.3"
                                />
                            </svg>
                        </div>

                        <input
                            type="text"
                            value={cari}
                            onChange={(event) =>
                                setCari(event.target.value)
                            }
                            placeholder="Cari nama, merek, atau transmisi"
                            className="w-full rounded-xl border border-slate-700 bg-[#1E293B] py-3.5 pl-12 pr-5 text-sm text-[#F8FAFC] shadow-xl outline-none transition placeholder:text-slate-500 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                        />
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-7 flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                Armada RentDrive
                            </p>

                            <h2 className="mt-2 text-2xl font-extrabold">
                                Daftar Kendaraan
                            </h2>
                        </div>

                        <p className="text-sm text-[#94A3B8]">
                            Menampilkan{' '}
                            {kendaraanDifilter.length}{' '}
                            kendaraan
                        </p>
                    </div>

                    {kendaraanDifilter.length > 0 ? (
                        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                            {kendaraanDifilter.map(
                                (kendaraan) => {
                                    const foto =
                                        alamatFoto(kendaraan);

                                    return (
                                        <article
                                            key={kendaraan.id}
                                            className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#1E293B] shadow-xl transition duration-300 hover:-translate-y-1 hover:border-[#06B6D4]/50"
                                        >
                                            <div className="relative m-5 mb-0 flex h-48 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-[#0B1120]">
                                                {foto ? (
                                                    <img
                                                        src={foto}
                                                        alt={
                                                            kendaraan.nama_kendaraan ??
                                                            'Kendaraan RentDrive'
                                                        }
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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

                                                        <p className="mt-3 text-xs text-[#94A3B8]">
                                                            Armada
                                                            RentDrive
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <span className="text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                                                    {kendaraan.merek ??
                                                        'RentDrive'}
                                                </span>

                                                <h3 className="mt-1 truncate text-lg font-bold">
                                                    {kendaraan.nama_kendaraan ??
                                                        'Nama kendaraan'}
                                                </h3>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {kendaraan.transmisi && (
                                                        <span className="rounded-lg bg-[#0B1120] px-3 py-1.5 text-xs capitalize text-[#94A3B8]">
                                                            {
                                                                kendaraan.transmisi
                                                            }
                                                        </span>
                                                    )}

                                                    {kendaraan.tahun_pembuatan && (
                                                        <span className="rounded-lg bg-[#0B1120] px-3 py-1.5 text-xs text-[#94A3B8]">
                                                            Tahun{' '}
                                                            {
                                                                kendaraan.tahun_pembuatan
                                                            }
                                                        </span>
                                                    )}

                                                    {kendaraan.kapasitas_penumpang && (
                                                        <span className="rounded-lg bg-[#0B1120] px-3 py-1.5 text-xs text-[#94A3B8]">
                                                            {
                                                                kendaraan.kapasitas_penumpang
                                                            }{' '}
                                                            penumpang
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="my-5 h-px bg-slate-800" />

                                                <div className="flex items-end justify-between gap-4">
                                                    <div>
                                                        <p className="text-xs text-[#94A3B8]">
                                                            Tarif
                                                            Sewa
                                                        </p>

                                                        <p className="mt-1 text-lg font-extrabold">
                                                            Rp{' '}
                                                            {formatHarga(
                                                                kendaraan.harga_per_hari,
                                                            )}
                                                            <span className="ml-1 text-xs font-normal text-[#94A3B8]">
                                                                /hari
                                                            </span>
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            bukaFormBooking(
                                                                kendaraan,
                                                            )
                                                        }
                                                        className="shrink-0 rounded-xl bg-[#06B6D4] px-5 py-2.5 text-xs font-bold text-[#0B1120] transition hover:bg-[#0891B2]"
                                                    >
                                                        Pesan
                                                        Sekarang
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-800 bg-[#1E293B] px-6 py-16 text-center">
                            <h3 className="text-lg font-bold">
                                Kendaraan tidak ditemukan
                            </h3>

                            <p className="mt-2 text-sm text-[#94A3B8]">
                                Gunakan kata kunci pencarian yang
                                berbeda.
                            </p>

                            <button
                                type="button"
                                onClick={() => setCari('')}
                                className="mt-5 rounded-xl border border-[#06B6D4] px-5 py-2.5 text-sm font-bold text-[#06B6D4] hover:bg-[#06B6D4]/10"
                            >
                                Tampilkan Semua
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {kendaraanDipilih && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 px-5 py-8 backdrop-blur-sm"
                    onClick={tutupFormBooking}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-xl rounded-3xl border border-slate-700 bg-[#1E293B] p-6 shadow-2xl sm:p-8"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-start justify-between gap-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                    Form Booking
                                </p>

                                <h2 className="mt-3 text-2xl font-extrabold">
                                    {
                                        kendaraanDipilih.nama_kendaraan
                                    }
                                </h2>

                                <p className="mt-2 text-sm text-[#94A3B8]">
                                    {kendaraanDipilih.merek}
                                    {' · '}
                                    Rp{' '}
                                    {formatHarga(
                                        kendaraanDipilih.harga_per_hari,
                                    )}
                                    /hari
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={tutupFormBooking}
                                disabled={
                                    bookingForm.processing
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-xl text-[#94A3B8] hover:border-rose-500/50 hover:text-rose-400 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={kirimBooking}
                            className="mt-7 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="tanggal_mulai"
                                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]"
                                >
                                    Tanggal Mulai
                                </label>

                                <input
                                    id="tanggal_mulai"
                                    type="date"
                                    min={tanggalHariIni}
                                    value={
                                        bookingForm.data
                                            .tanggal_mulai
                                    }
                                    onChange={(event) => {
                                        bookingForm.setData(
                                            'tanggal_mulai',
                                            event.target.value,
                                        );

                                        if (
                                            bookingForm.data
                                                .tanggal_selesai &&
                                            bookingForm.data
                                                .tanggal_selesai <=
                                                event.target.value
                                        ) {
                                            bookingForm.setData(
                                                'tanggal_selesai',
                                                '',
                                            );
                                        }
                                    }}
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-[#F8FAFC] outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                />

                                {bookingForm.errors
                                    .tanggal_mulai && (
                                    <p className="mt-2 text-xs leading-5 text-rose-400">
                                        {
                                            bookingForm.errors
                                                .tanggal_mulai
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="tanggal_selesai"
                                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]"
                                >
                                    Tanggal Selesai
                                </label>

                                <input
                                    id="tanggal_selesai"
                                    type="date"
                                    min={
                                        bookingForm.data
                                            .tanggal_mulai ||
                                        tanggalHariIni
                                    }
                                    value={
                                        bookingForm.data
                                            .tanggal_selesai
                                    }
                                    onChange={(event) =>
                                        bookingForm.setData(
                                            'tanggal_selesai',
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-[#F8FAFC] outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                />

                                {bookingForm.errors
                                    .tanggal_selesai && (
                                    <p className="mt-2 text-xs leading-5 text-rose-400">
                                        {
                                            bookingForm.errors
                                                .tanggal_selesai
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-700 bg-[#0B1120] p-5">
                                <div className="flex items-center justify-between gap-5">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-[#94A3B8]">
                                            Durasi
                                        </p>

                                        <p className="mt-1 font-bold">
                                            {durasiHari > 0
                                                ? `${durasiHari} hari`
                                                : '-'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs uppercase tracking-wider text-[#94A3B8]">
                                            Estimasi Total
                                        </p>

                                        <p className="mt-1 text-lg font-extrabold text-[#06B6D4]">
                                            Rp{' '}
                                            {formatHarga(
                                                estimasiTotal,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs leading-6 text-[#64748B]">
                                Estimasi biaya dihitung dari
                                durasi penyewaan dikalikan tarif
                                harian kendaraan.
                            </p>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={tutupFormBooking}
                                    disabled={
                                        bookingForm.processing
                                    }
                                    className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-bold text-[#94A3B8] hover:bg-slate-800 hover:text-white disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        bookingForm.processing ||
                                        durasiHari <= 0
                                    }
                                    className="rounded-xl bg-[#06B6D4] px-6 py-3 text-sm font-bold text-[#0B1120] hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {bookingForm.processing
                                        ? 'Memproses Booking...'
                                        : 'Konfirmasi Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
