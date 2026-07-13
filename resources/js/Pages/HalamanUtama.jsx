import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function HalamanUtama({
    auth,
    flash,
    kendaraans = [],
}) {
    const [cari, setCari] = useState('');
    const [menuTerbuka, setMenuTerbuka] = useState(false);

    const user = auth?.user ?? null;

    const daftarKendaraan = Array.isArray(kendaraans)
        ? kendaraans
        : [];

    const kataKunci = cari.trim().toLowerCase();

    const kendaraanDifilter = daftarKendaraan.filter((kendaraan) => {
        const namaKendaraan =
            kendaraan.nama_kendaraan?.toLowerCase() ?? '';

        const merek =
            kendaraan.merek?.toLowerCase() ?? '';

        return (
            namaKendaraan.includes(kataKunci) ||
            merek.includes(kataKunci)
        );
    });

    /*
     * Guest diarahkan ke login.
     * Pengguna yang sudah login diarahkan ke dashboard sesuai role.
     */
const tujuanPemesanan =
    user?.role === 'pelanggan'
        ? route('pelanggan.katalog')
        : user
          ? route('dashboard')
          : route('login');
    return (
        <div className="min-h-screen bg-[#0B1120] font-sans text-[#F8FAFC] antialiased selection:bg-[#06B6D4] selection:text-[#0B1120]">
            <Head title="Katalog Armada Premium" />

            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-md">
                <nav className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                    {/* LOGO */}
                    <Link
                        href={route('landing_page')}
                        className="text-xl font-black tracking-wider text-[#F8FAFC] sm:text-2xl"
                    >
                        Rent
                        <span className="text-[#06B6D4]">
                            Drive
                        </span>
                    </Link>

                    {/* MENU DESKTOP */}
                    <div className="hidden items-center gap-6 md:flex">
                        <a
                            href="#katalog"
                            className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#F8FAFC]"
                        >
                            Katalog
                        </a>

                        <a
                            href="#syarat"
                            className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#F8FAFC]"
                        >
                            Syarat & Ketentuan
                        </a>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-[#06B6D4] px-5 py-2.5 text-sm font-bold text-[#0B1120] shadow-md transition-all hover:bg-[#0891B2]"
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-xl border border-rose-500/50 bg-transparent px-5 py-2.5 text-sm font-bold text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
                                >
                                    Keluar
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('login')}
                                    className="text-sm font-semibold text-[#94A3B8] transition-colors hover:text-[#06B6D4]"
                                >
                                    Masuk
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="rounded-xl bg-[#06B6D4] px-5 py-2.5 text-sm font-bold text-[#0B1120] shadow-md transition-all hover:bg-[#0891B2]"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* TOMBOL MENU MOBILE */}
                    <button
                        type="button"
                        onClick={() =>
                            setMenuTerbuka((status) => !status)
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-[#94A3B8] transition hover:border-[#06B6D4] hover:text-[#06B6D4] md:hidden"
                        aria-label="Buka menu navigasi"
                    >
                        {menuTerbuka ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        )}
                    </button>
                </nav>

                {/* MENU MOBILE */}
                {menuTerbuka && (
                    <div className="border-t border-slate-800 bg-[#0B1120] px-5 py-5 md:hidden">
                        <div className="mx-auto flex max-w-7xl flex-col gap-3">
                            <a
                                href="#katalog"
                                onClick={() => setMenuTerbuka(false)}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                            >
                                Katalog
                            </a>

                            <a
                                href="#syarat"
                                onClick={() => setMenuTerbuka(false)}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                            >
                                Syarat & Ketentuan
                            </a>

                            {user ? (
                                <>
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-xl bg-[#06B6D4] px-5 py-3 text-center text-sm font-bold text-[#0B1120]"
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="w-full rounded-xl border border-rose-500/50 px-5 py-3 text-center text-sm font-bold text-rose-400"
                                    >
                                        Keluar
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl border border-slate-700 px-5 py-3 text-center text-sm font-bold text-[#F8FAFC]"
                                    >
                                        Masuk
                                    </Link>

                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-[#06B6D4] px-5 py-3 text-center text-sm font-bold text-[#0B1120]"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* NOTIFIKASI PENDAFTARAN BERHASIL */}
            {flash?.success && (
                <div className="mx-auto mt-6 max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-bold text-emerald-300">
                                Pendaftaran berhasil
                            </p>

                            <p className="mt-1 text-sm leading-6 text-emerald-200/80">
                                {flash.success}
                            </p>
                        </div>

                        {!user && (
                            <Link
                                href={route('login')}
                                className="shrink-0 rounded-xl bg-emerald-400 px-5 py-2.5 text-center text-sm font-bold text-[#0B1120] transition hover:bg-emerald-300"
                            >
                                Masuk Sekarang
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* NOTIFIKASI ERROR */}
            {flash?.error && (
                <div className="mx-auto mt-6 max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-300 shadow-lg">
                        {flash.error}
                    </div>
                </div>
            )}

{/* HERO SECTION */}
<section className="relative overflow-hidden border-b border-slate-800">
    {/* GAMBAR LATAR */}
    <div className="absolute inset-0">
        <img
            src="/images/hero_sesion_mobil.jpg"
            alt="Latar kendaraan RentDrive"
            className="h-full w-full object-cover object-center opacity-60"
        />
    </div>

    {/* LAPISAN GELAP */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/95 via-[#0B1120]/85 to-[#0B1120]/65" />

    {/* EFEK CAHAYA */}
    <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#06B6D4]/10 blur-3xl" />

    <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

    {/* ISI HERO */}
    <div className="relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-16 text-center sm:px-6 sm:pb-16 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#06B6D4]">
                Rental Kendaraan Modern
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-5xl lg:text-6xl">
                Temukan Kendaraan Terbaik untuk Perjalanan{' '}
                <span className="text-[#06B6D4]">
                    Premium
                </span>{' '}
                Anda
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#CBD5E1] sm:text-base">
                Proses pemesanan instan, unit terawat maksimal, dan
                transparansi manajemen rental tanpa biaya tersembunyi.
            </p>
        </div>

        {/* FORM PENCARIAN */}
        <div className="relative mx-auto mt-9 max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5 text-slate-400"
                >
                    <circle cx="11" cy="11" r="8" />

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
                placeholder="Cari armada impian Anda, misalnya Avanza atau Civic"
                className="w-full rounded-xl border border-slate-600 bg-[#1E293B]/90 py-3.5 pl-12 pr-5 text-sm text-[#F8FAFC] shadow-xl backdrop-blur-sm outline-none transition placeholder:text-slate-400 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
            />
        </div>
    </div>
</section>
{/* KATALOG KENDARAAN */}
<section
    id="katalog"
    className="relative overflow-hidden border-y border-slate-800"
>
    {/* GAMBAR LATAR KATALOG */}
    <div className="absolute inset-0">
        <img
            src="/images/hero_sesion_2.jpg"
            alt="Latar katalog RentDrive"
            className="h-full w-full object-cover object-center opacity-100"
        />
    </div>

    {/* LAPISAN GELAP */}
    <div className="absolute inset-0 bg-[#0B1120]/90" />

    {/* GRADASI LATAR */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/95 via-[#0B1120]/80 to-[#0B1120]/60" />

    {/* ISI KATALOG */}
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-700/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                    Katalog RentDrive
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-wide text-[#F8FAFC] sm:text-2xl">
                    Pilihan Armada
                </h2>
            </div>

            <p className="text-sm text-[#94A3B8]">
                Menampilkan {kendaraanDifilter.length} kendaraan
            </p>
        </div>

        {kendaraanDifilter.length > 0 ? (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                {kendaraanDifilter.map((kendaraan) => {
                    const harga = Number(
                        kendaraan.harga_per_hari ?? 0,
                    );

                    return (
                        <article
                            key={kendaraan.id}
                            className="group overflow-hidden rounded-2xl border border-slate-700/80 bg-[#1E293B]/95 shadow-xl backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#06B6D4]/50 hover:shadow-2xl"
                        >
                            {/* AREA FOTO KENDARAAN */}
                            <div className="relative m-5 mb-0 flex h-44 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-[#0B1120]">
                                {kendaraan.foto_kendaraan ? (
                                    <img
                                        src={`/storage/${kendaraan.foto_kendaraan}`}
                                        alt={
                                            kendaraan.nama_kendaraan ??
                                            'Kendaraan RentDrive'
                                        }
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#06B6D4]/10 text-4xl">
                                            🚗
                                        </div>

                                        <p className="font-mono text-xs text-[#94A3B8]">
                                            Armada RentDrive
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* INFORMASI KENDARAAN */}
                            <div className="p-5">
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                                        {kendaraan.merek ?? 'RentDrive'}
                                    </span>

                                    <h3 className="mt-1 truncate text-lg font-bold text-[#F8FAFC]">
                                        {kendaraan.nama_kendaraan ??
                                            'Nama kendaraan belum tersedia'}
                                    </h3>
                                </div>

                                <div className="my-5 h-px bg-slate-700" />

                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs text-[#94A3B8]">
                                            Tarif Sewa
                                        </p>

                                        <p className="mt-1 text-lg font-extrabold text-[#F8FAFC]">
                                            Rp{' '}
                                            {harga.toLocaleString('id-ID')}

                                            <span className="ml-1 text-xs font-normal text-[#94A3B8]">
                                                /hari
                                            </span>
                                        </p>
                                    </div>

                                    <Link
                                        href={tujuanPemesanan}
                                        className="shrink-0 rounded-xl bg-[#06B6D4] px-5 py-2.5 text-xs font-bold text-[#0B1120] shadow-md transition-all hover:bg-[#0891B2]"
                                    >
                                        Pesan Sekarang
                                    </Link>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        ) : (
            <div className="rounded-2xl border border-slate-700 bg-[#1E293B]/95 px-6 py-16 text-center shadow-xl backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0B1120] text-3xl">
                    🔍
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">
                    Armada tidak ditemukan
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#94A3B8]">
                    Gunakan nama kendaraan atau merek lain untuk
                    menemukan armada yang Anda inginkan.
                </p>

                {cari && (
                    <button
                        type="button"
                        onClick={() => setCari('')}
                        className="mt-5 rounded-xl border border-[#06B6D4] px-5 py-2.5 text-sm font-bold text-[#06B6D4] transition hover:bg-[#06B6D4]/10"
                    >
                        Tampilkan Semua Armada
                    </button>
                )}
            </div>
        )}
    </div>
</section>

{/* SYARAT DAN KETENTUAN */}
<section
    id="syarat"
    className="relative overflow-hidden border-y border-slate-800 bg-[#10192B]"
>
    {/* GAMBAR LATAR SYARAT */}
    <div className="absolute inset-0">
        <img
            src="/images/hero_sesion_3.jpg"
            alt="Latar syarat dan ketentuan RentDrive"
            className="h-full w-full object-cover object-center opacity-80"
        />
    </div>

    {/* LAPISAN GELAP */}
    <div className="absolute inset-0 bg-[#10192B]/90" />

    {/* GRADASI LATAR */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/95 via-[#10192B]/80 to-[#0B1120]/60" />

    {/* ISI SYARAT */}
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#06B6D4]">
                Informasi Penyewaan
            </p>

            <h2 className="mt-4 text-3xl font-extrabold text-[#F8FAFC] sm:text-4xl">
                Syarat & Ketentuan
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#CBD5E1] sm:text-base">
                Setiap pelanggan perlu memiliki akun aktif dan melengkapi
                data identitas sebelum proses pemesanan kendaraan diproses
                oleh RentDrive.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* KOTAK 1 */}
            <article className="rounded-2xl border border-slate-700 bg-[#1E293B]/95 p-6 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#06B6D4]/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-lg font-bold text-[#06B6D4]">
                    1
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">
                    Akun Pelanggan
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
                    Pelanggan wajib mendaftar dan masuk ke akun sebelum
                    melakukan pemesanan kendaraan.
                </p>
            </article>

            {/* KOTAK 2 */}
            <article className="rounded-2xl border border-slate-700 bg-[#1E293B]/95 p-6 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#06B6D4]/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-lg font-bold text-[#06B6D4]">
                    2
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">
                    Identitas Valid
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
                    Data KTP, SIM, nomor telepon, dan alamat harus diisi
                    dengan benar serta dapat dipertanggungjawabkan.
                </p>
            </article>

            {/* KOTAK 3 */}
            <article className="rounded-2xl border border-slate-700 bg-[#1E293B]/95 p-6 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#06B6D4]/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-lg font-bold text-[#06B6D4]">
                    3
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">
                    Konfirmasi Admin
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
                    Permintaan pemesanan akan diperiksa dan dikonfirmasi
                    oleh admin RentDrive sebelum transaksi dilanjutkan.
                </p>
            </article>

            {/* KOTAK 4 */}
            <article className="rounded-2xl border border-slate-700 bg-[#1E293B]/95 p-6 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#06B6D4]/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-lg font-bold text-[#06B6D4]">
                    4
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">
                    Pengembalian
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
                    Kendaraan wajib dikembalikan sesuai jadwal dan kondisi
                    yang telah disepakati dalam transaksi penyewaan.
                </p>
            </article>
        </div>
    </div>
</section>
            {/* FOOTER */}
            <footer className="bg-[#0B1120]">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div>
                        <Link
                            href={route('landing_page')}
                            className="text-xl font-black tracking-wider text-[#F8FAFC]"
                        >
                            Rent
                            <span className="text-[#06B6D4]">
                                Drive
                            </span>
                        </Link>

                        <p className="mt-2 text-xs text-[#64748B]">
                            Layanan rental kendaraan modern dan
                            transparan.
                        </p>
                    </div>

                    <p className="text-xs text-[#64748B]">
                        © {new Date().getFullYear()} RentDrive. Seluruh hak
                        dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
}
