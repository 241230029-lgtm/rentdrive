import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function HalamanUtama({
    auth,
    kendaraans = [],
}) {
    const [pencarian, setPencarian] = useState('');

    const user = auth?.user ?? null;

    const formatRupiah = (nilai) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(nilai ?? 0));

    const kendaraanDifilter = useMemo(() => {
        const kataKunci = pencarian.trim().toLowerCase();

        if (!kataKunci) {
            return kendaraans;
        }

        return kendaraans.filter((kendaraan) => {
            const nama =
                kendaraan.nama_kendaraan?.toLowerCase() ?? '';

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
    }, [kendaraans, pencarian]);

    const totalUnit = kendaraanDifilter.reduce(
        (total, kendaraan) =>
            total + Number(kendaraan.jumlah_unit ?? 0),
        0,
    );

    const tujuanPemesanan =
        user?.role === 'pelanggan'
            ? route('pelanggan.katalog')
            : user
              ? route('dashboard')
              : route('login');

    return (
        <>
            <Head title="RentDrive - Rental Mobil" />

            <div className="min-h-screen bg-slate-950 text-white">
                {/* HEADER */}
                <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
                        <Link
                            href={route('landing_page')}
                            className="text-2xl font-black"
                        >
                            Rent
                            <span className="text-cyan-400">
                                Drive
                            </span>
                        </Link>

                        <div className="flex items-center gap-3">
                            {user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold transition hover:border-cyan-400 hover:text-cyan-400"
                                    >
                                        Masuk
                                    </Link>

                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* HERO */}
                <section className="relative overflow-hidden border-b border-slate-800">
                    <div className="absolute inset-0">
                        <img
                            src="/images/hero_sesion_mobil.jpg"
                            alt="Rental mobil RentDrive"
                            className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
                        <div className="max-w-3xl">
                            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
                                Rental Mobil Terpercaya
                            </p>

                            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                                Temukan Mobil Terbaik untuk
                                Perjalanan Anda
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                                Pilih berbagai unit mobil yang nyaman,
                                terawat, dan siap digunakan untuk
                                perjalanan keluarga maupun bisnis.
                            </p>

                            <a
                                href="#unit-mobil"
                                className="mt-8 inline-flex rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
                            >
                                Lihat Unit Mobil
                            </a>
                        </div>
                    </div>
                </section>

                {/* DAFTAR UNIT MOBIL */}
                <section
                    id="unit-mobil"
                    className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8"
                >
                    <div className="flex flex-col gap-5 border-b border-slate-800 pb-7 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                                Armada RentDrive
                            </p>

                            <h2 className="mt-2 text-3xl font-black">
                                Unit Mobil Tersedia
                            </h2>

                            <p className="mt-3 text-slate-400">
                                Tersedia {kendaraanDifilter.length} jenis
                                mobil dengan total {totalUnit} unit.
                            </p>
                        </div>

                        <div className="w-full md:max-w-md">
                            <label
                                htmlFor="pencarian"
                                className="sr-only"
                            >
                                Cari mobil
                            </label>

                            <div className="relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                                >
                                    <circle cx="11" cy="11" r="8" />

                                    <path d="m21 21-4.3-4.3" />
                                </svg>

                                <input
                                    id="pencarian"
                                    type="text"
                                    value={pencarian}
                                    onChange={(event) =>
                                        setPencarian(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Cari nama atau merek mobil..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                                />
                            </div>
                        </div>
                    </div>

                    {kendaraanDifilter.length > 0 ? (
                        <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                            {kendaraanDifilter.map((kendaraan) => (
                                <article
                                    key={kendaraan.id}
                                    className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/60"
                                >
                                    {/* FOTO MOBIL */}
                                    <div className="relative h-56 overflow-hidden bg-slate-800">
                                        <img
                                            src={
                                                kendaraan.foto_kendaraan
                                                    ? `/storage/${kendaraan.foto_kendaraan}`
                                                    : '/images/hero_sesion_mobil.jpg'
                                            }
                                            alt={
                                                kendaraan.nama_kendaraan
                                            }
                                            onError={(event) => {
                                                event.currentTarget.onerror =
                                                    null;

                                                event.currentTarget.src =
                                                    '/images/hero_sesion_mobil.jpg';
                                            }}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                                        <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                                            {kendaraan.jumlah_unit} unit
                                            tersedia
                                        </span>
                                    </div>

                                    {/* INFORMASI MOBIL */}
                                    <div className="p-6">
                                        <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                                            {kendaraan.merek}
                                        </p>

                                        <h3 className="mt-1 text-xl font-black">
                                            {kendaraan.nama_kendaraan}
                                        </h3>

                                        {kendaraan.deskripsi_kendaraan && (
                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                                                {
                                                    kendaraan.deskripsi_kendaraan
                                                }
                                            </p>
                                        )}

                                        <div className="mt-5 grid grid-cols-3 gap-2">
                                            <DetailMobil
                                                label="Tahun"
                                                nilai={
                                                    kendaraan.tahun_pembuatan
                                                }
                                            />

                                            <DetailMobil
                                                label="Transmisi"
                                                nilai={
                                                    kendaraan.transmisi
                                                }
                                                capitalize
                                            />

                                            <DetailMobil
                                                label="Kapasitas"
                                                nilai={`${kendaraan.kapasitas_penumpang} orang`}
                                            />
                                        </div>

                                        <div className="my-5 border-t border-slate-800" />

                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Harga sewa
                                                </p>

                                                <p className="mt-1 text-xl font-black text-cyan-400">
                                                    {formatRupiah(
                                                        kendaraan.harga_per_hari,
                                                    )}

                                                    <span className="ml-1 text-xs font-normal text-slate-400">
                                                        /hari
                                                    </span>
                                                </p>
                                            </div>

                                            <Link
                                                href={
                                                    tujuanPemesanan
                                                }
                                                className="shrink-0 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                                            >
                                                Pesan
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
                            <div className="text-5xl">🚗</div>

                            <h3 className="mt-5 text-xl font-bold">
                                Unit mobil tidak ditemukan
                            </h3>

                            <p className="mt-2 text-sm text-slate-400">
                                Coba gunakan nama atau merek mobil yang
                                berbeda.
                            </p>

                            {pencarian && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPencarian('')
                                    }
                                    className="mt-5 rounded-xl border border-cyan-400 px-5 py-2.5 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400/10"
                                >
                                    Tampilkan Semua Mobil
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* FOOTER */}
                <footer className="border-t border-slate-800 bg-slate-950">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                        <p className="text-lg font-black">
                            Rent
                            <span className="text-cyan-400">
                                Drive
                            </span>
                        </p>

                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} RentDrive.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function DetailMobil({
    label,
    nilai,
    capitalize = false,
}) {
    return (
        <div className="rounded-xl bg-slate-950 px-2 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p
                className={`mt-1 truncate text-xs font-bold text-slate-300 ${
                    capitalize ? 'capitalize' : ''
                }`}
            >
                {nilai ?? '-'}
            </p>
        </div>
    );
}
