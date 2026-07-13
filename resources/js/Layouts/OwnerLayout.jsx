import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

function IkonDashboard() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function IkonLaporan() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 20V10M12 20V4M19 20v-7"
            />

            <path
                strokeLinecap="round"
                d="M3 20h18"
            />
        </svg>
    );
}

function IkonMonitoring() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3a9 9 0 1 0 9 9"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7v5l3 2M16 3h5v5"
            />
        </svg>
    );
}

function IkonKeluar() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 8l4 4-4 4M18 12H8M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"
            />
        </svg>
    );
}

function IkonMenu() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                d="M4 6h16M4 12h16M4 18h16"
            />
        </svg>
    );
}

function IkonTutup() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                d="M6 6l12 12M18 6 6 18"
            />
        </svg>
    );
}

export default function OwnerLayout({ children }) {
    const { auth } = usePage().props;

    const [sidebarTerbuka, setSidebarTerbuka] =
        useState(false);

    const user = auth?.user;

    const kelasMenu = (aktif) => {
        return aktif
            ? 'flex items-center gap-3 rounded-xl bg-[#06B6D4] px-4 py-3 text-sm font-bold text-[#0B1120] shadow-lg shadow-cyan-950/30'
            : 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-[#F8FAFC]';
    };

    const tutupSidebar = () => {
        setSidebarTerbuka(false);
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC]">
            <div className="flex min-h-screen">
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-[#10192B] transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
                        sidebarTerbuka
                            ? 'translate-x-0'
                            : '-translate-x-full'
                    }`}
                >
                    <div className="flex h-full flex-col p-5">
                        <div className="flex items-center justify-between">
                            <Link
                                href={route('owner.dashboard')}
                                viewTransition
                                className="text-2xl font-black"
                                onClick={tutupSidebar}
                            >
                                Rent
                                <span className="text-[#06B6D4]">
                                    Drive
                                </span>
                            </Link>

                            <button
                                type="button"
                                onClick={tutupSidebar}
                                className="rounded-lg p-2 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-white md:hidden"
                                aria-label="Tutup menu owner"
                            >
                                <IkonTutup />
                            </button>
                        </div>

                        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#1E293B] p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#06B6D4]/10 font-extrabold text-[#06B6D4]">
                                    {user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ?? 'O'}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate font-bold">
                                        {user?.name ?? 'Owner'}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-[#94A3B8]">
                                        {user?.email ?? 'owner@rentdrive.com'}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                Pemilik Usaha
                            </p>
                        </div>

                        <nav className="mt-8 space-y-2">
                            <Link
                                href={route('owner.dashboard')}
                                viewTransition
                                onClick={tutupSidebar}
                                className={kelasMenu(
                                    route().current('owner.dashboard'),
                                )}
                            >
                                <IkonDashboard />
                                Dashboard
                            </Link>

                            <Link
                                href={route('owner.laporan_bisnis', {
                                    kategori_laporan: 'pendapatan',
                                })}
                                viewTransition
                                onClick={tutupSidebar}
                                className={kelasMenu(
                                    route().current(
                                        'owner.laporan_bisnis',
                                    ),
                                )}
                            >
                                <IkonLaporan />
                                Laporan Bisnis
                            </Link>

                            <Link
                                href={route(
                                    'owner.monitoring_admin',
                                )}
                                viewTransition
                                onClick={tutupSidebar}
                                className={kelasMenu(
                                    route().current(
                                        'owner.monitoring_admin',
                                    ),
                                )}
                            >
                                <IkonMonitoring />
                                Monitoring Admin
                            </Link>
                        </nav>

                        <div className="mt-auto border-t border-slate-800 pt-5">
                            <p className="text-xs leading-5 text-[#64748B]">
                                Ringkasan bisnis dan aktivitas
                                operasional RentDrive.
                            </p>
                        </div>
                    </div>
                </aside>

                {sidebarTerbuka && (
                    <button
                        type="button"
                        onClick={tutupSidebar}
                        aria-label="Tutup latar menu"
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                    />
                )}

                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur">
                        <div className="flex h-16 items-center justify-between px-5 sm:px-8">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSidebarTerbuka(true)
                                    }
                                    className="rounded-xl border border-slate-700 bg-[#1E293B] p-2.5 text-[#94A3B8] transition hover:border-[#06B6D4]/50 hover:text-[#06B6D4] md:hidden"
                                    aria-label="Buka menu owner"
                                >
                                    <IkonMenu />
                                </button>

                                <div className="min-w-0">
                                    <p className="text-sm font-bold">
                                        Panel Owner
                                    </p>

                                    <p className="hidden text-xs text-[#64748B] sm:block">
                                        Analisis dan Pengawasan RentDrive
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden text-right lg:block">
                                    <p className="max-w-48 truncate text-sm font-bold">
                                        {user?.name ?? 'Owner'}
                                    </p>

                                    <p className="max-w-48 truncate text-xs text-[#64748B]">
                                        {user?.email ?? ''}
                                    </p>
                                </div>

                                <div className="hidden h-8 w-px bg-slate-800 lg:block" />

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300 transition hover:border-rose-500/70 hover:bg-rose-500/20"
                                >
                                    <IkonKeluar />

                                    <span className="hidden sm:inline">
                                        Keluar
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </header>

                    <div className="page-transition">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
