import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PelangganLayout({ children }) {
    const { auth } = usePage().props;
    const [menuTerbuka, setMenuTerbuka] = useState(false);

    const user = auth?.user ?? null;

    const sedangAktif = (namaRoute) => {
        return route().current(namaRoute);
    };

    const kelasMenu = (aktif) => {
        return aktif
            ? 'rounded-lg bg-[#06B6D4]/10 px-3 py-2 text-sm font-bold text-[#06B6D4]'
            : 'rounded-lg px-3 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]';
    };

    const tutupMenu = () => {
        setMenuTerbuka(false);
    };

    return (
        <div className="min-h-screen bg-[#0B1120] font-sans text-[#F8FAFC] antialiased selection:bg-[#06B6D4] selection:text-[#0B1120]">
            {/* HEADER PERSISTEN */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-md">
                <nav className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                    <Link
                        href={route('pelanggan.dashboard')}
                        viewTransition
                        className="text-xl font-black tracking-wider text-[#F8FAFC] sm:text-2xl"
                    >
                        Rent
                        <span className="text-[#06B6D4]">
                            Drive
                        </span>
                    </Link>

                    {/* NAVIGASI DESKTOP */}
                    <div className="hidden items-center gap-2 md:flex">
                        <Link
                            href={route('pelanggan.dashboard')}
                            viewTransition
                            className={kelasMenu(
                                sedangAktif('pelanggan.dashboard')
                            )}
                        >
                            Dashboard
                        </Link>

                        <Link
                            href={route('pelanggan.katalog')}
                            viewTransition
                            className={kelasMenu(
                                sedangAktif('pelanggan.katalog')
                            )}
                        >
                            Katalog
                        </Link>

                        <Link
                            href={route('pelanggan.riwayat')}
                            viewTransition
                            className={kelasMenu(
                                sedangAktif('pelanggan.riwayat')
                            )}
                        >
                            Riwayat Sewa
                        </Link>

                        <Link
                            href={route('pelanggan.profile.edit')}
                            viewTransition
                            className={kelasMenu(
                                sedangAktif('pelanggan.profile.*')
                            )}
                        >
                            Profil
                        </Link>

                        <div className="ml-3 flex items-center gap-4 border-l border-slate-700 pl-5">
                            <div className="text-right">
                                <p className="max-w-36 truncate text-sm font-bold text-[#F8FAFC]">
                                    {user?.name ?? 'Pelanggan'}
                                </p>

                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#06B6D4]">
                                    Pelanggan
                                </p>
                            </div>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-300"
                            >
                                Keluar
                            </Link>
                        </div>
                    </div>

                    {/* TOMBOL MOBILE */}
                    <button
                        type="button"
                        onClick={() =>
                            setMenuTerbuka((sebelumnya) => !sebelumnya)
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-[#94A3B8] transition hover:border-[#06B6D4] hover:text-[#06B6D4] md:hidden"
                        aria-label="Buka menu navigasi"
                    >
                        {menuTerbuka ? (
                            <svg
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

                {/* NAVIGASI MOBILE */}
                {menuTerbuka && (
                    <div className="border-t border-slate-800 bg-[#0B1120] px-5 py-5 md:hidden">
                        <div className="mx-auto flex max-w-7xl flex-col gap-2">
                            <div className="mb-3 rounded-xl border border-slate-800 bg-[#1E293B] px-4 py-3">
                                <p className="font-bold text-[#F8FAFC]">
                                    {user?.name ?? 'Pelanggan'}
                                </p>

                                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                                    Pelanggan
                                </p>
                            </div>

                            <Link
                                href={route('pelanggan.dashboard')}
                                viewTransition
                                onClick={tutupMenu}
                                className={kelasMenu(
                                    sedangAktif('pelanggan.dashboard')
                                )}
                            >
                                Dashboard
                            </Link>

                            <Link
                                href={route('pelanggan.katalog')}
                                viewTransition
                                onClick={tutupMenu}
                                className={kelasMenu(
                                    sedangAktif('pelanggan.katalog')
                                )}
                            >
                                Katalog
                            </Link>

                            <Link
                                href={route('pelanggan.riwayat')}
                                viewTransition
                                onClick={tutupMenu}
                                className={kelasMenu(
                                    sedangAktif('pelanggan.riwayat')
                                )}
                            >
                                Riwayat Sewa
                            </Link>

<Link
    href={route('pelanggan.profile.edit')}
    viewTransition
    onClick={tutupMenu}
    className={kelasMenu(
        sedangAktif('pelanggan.profile.*')
    )}
>
    Profil
</Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="mt-3 w-full rounded-xl border border-rose-500/50 bg-rose-500/10 px-5 py-3 text-center text-sm font-bold text-rose-400"
                            >
                                Keluar
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* HANYA KONTEN INI YANG BERGANTI */}
            <div className="page-transition min-h-[calc(100vh-69px)]">
                {children}
            </div>

            {/* FOOTER PERSISTEN */}
            <footer className="border-t border-slate-800 bg-[#0B1120]">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div>
                        <Link
                            href={route('pelanggan.dashboard')}
                            viewTransition
                            className="text-xl font-black tracking-wider text-[#F8FAFC]"
                        >
                            Rent
                            <span className="text-[#06B6D4]">
                                Drive
                            </span>
                        </Link>

                        <p className="mt-2 text-xs text-[#64748B]">
                            Layanan rental kendaraan modern dan transparan.
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
