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
            aria-hidden="true"
        >
            <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
            />

            <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
            />

            <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
            />

            <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
            />
        </svg>
    );
}

function IkonBooking() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 3v3M18 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"
            />

            <path
                strokeLinecap="round"
                d="M8 13h3M8 17h6"
            />
        </svg>
    );
}

function IkonKendaraan() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 15l2-6h12l2 6M5 15h14v4H5v-4Z"
            />

            <path
                strokeLinecap="round"
                d="M7 19v2M17 19v2M7 12h10"
            />

            <circle
                cx="8"
                cy="17"
                r="1"
                fill="currentColor"
                stroke="none"
            />

            <circle
                cx="16"
                cy="17"
                r="1"
                fill="currentColor"
                stroke="none"
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
            aria-hidden="true"
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
            aria-hidden="true"
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
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                d="M6 6l12 12M18 6 6 18"
            />
        </svg>
    );
}

export default function AdminLayout({ children }) {
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
                {/* SIDEBAR */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-[#10192B] transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
                        sidebarTerbuka
                            ? 'translate-x-0'
                            : '-translate-x-full'
                    }`}
                >
                    <div className="flex h-full flex-col overflow-y-auto p-5">
                        {/* LOGO */}
                        <div className="flex items-center justify-between">
                            <Link
                                href={route(
                                    'admin.dashboard',
                                )}
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
                                aria-label="Tutup menu admin"
                            >
                                <IkonTutup />
                            </button>
                        </div>

                        {/* INFORMASI ADMIN */}
                        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#1E293B] p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#06B6D4]/10 font-extrabold text-[#06B6D4]">
                                    {user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ??
                                        'A'}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate font-bold">
                                        {user?.name ??
                                            'Administrator'}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-[#94A3B8]">
                                        {user?.email ??
                                            'admin@gmail.com'}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                Administrator
                            </p>
                        </div>

                        {/* MENU UTAMA */}
                        <nav className="mt-8 space-y-2">
                            <Link
                                href={route(
                                    'admin.dashboard',
                                )}
                                viewTransition
                                onClick={tutupSidebar}
                                className={kelasMenu(
                                    route().current(
                                        'admin.dashboard',
                                    ),
                                )}
                            >
                                <IkonDashboard />
                                Dashboard
                            </Link>

                            <Link
                                href={route(
                                    'admin.booking.index',
                                )}
                                viewTransition
                                onClick={tutupSidebar}
                                className={kelasMenu(
                                    route().current(
                                        'admin.booking.*',
                                    ),
                                )}
                            >
                                <IkonBooking />
                                Kelola Booking
                            </Link>
                        </nav>

                        {/* MENU OPERASIONAL */}
                        <div className="mt-8 border-t border-slate-800 pt-5">
                            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                                Operasional
                            </p>

                            <div className="mt-3 space-y-2">
                                <Link
                                    href={route(
                                        'admin.kendaraan.index',
                                    )}
                                    viewTransition
                                    onClick={
                                        tutupSidebar
                                    }
                                    className={kelasMenu(
                                        route().current(
                                            'admin.kendaraan.*',
                                        ),
                                    )}
                                >
                                    <IkonKendaraan />
                                    Kelola Kendaraan
                                </Link>

                                {[
                                    'Pengembalian',
                                    'Riwayat Transaksi',
                                    'Laporan',
                                ].map((menu) => (
                                    <div
                                        key={menu}
                                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#64748B]"
                                    >
                                        <span>
                                            {menu}
                                        </span>

                                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[9px] font-bold uppercase">
                                            Segera
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* INFORMASI SISTEM */}
                        <div className="mt-auto border-t border-slate-800 pt-5">
                            <p className="text-xs leading-5 text-[#64748B]">
                                Kelola booking, armada,
                                pembayaran, dan operasional
                                RentDrive melalui panel
                                administrator.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* OVERLAY SIDEBAR MOBILE */}
                {sidebarTerbuka && (
                    <button
                        type="button"
                        onClick={tutupSidebar}
                        aria-label="Tutup latar menu"
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                    />
                )}

                {/* AREA KONTEN */}
                <div className="min-w-0 flex-1">
                    {/* HEADER ADMIN */}
                    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur">
                        <div className="flex h-16 items-center justify-between px-5 sm:px-8">
                            {/* BAGIAN KIRI HEADER */}
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSidebarTerbuka(
                                            true,
                                        )
                                    }
                                    className="rounded-xl border border-slate-700 bg-[#1E293B] p-2.5 text-[#94A3B8] transition hover:border-[#06B6D4]/50 hover:text-[#06B6D4] md:hidden"
                                    aria-label="Buka menu admin"
                                >
                                    <IkonMenu />
                                </button>

                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-[#F8FAFC]">
                                        Panel
                                        Administrator
                                    </p>

                                    <p className="hidden text-xs text-[#64748B] sm:block">
                                        Sistem Operasional
                                        RentDrive
                                    </p>
                                </div>
                            </div>

                            {/* BAGIAN KANAN HEADER */}
                            <div className="flex items-center gap-3">
                                <div className="hidden text-right lg:block">
                                    <p className="max-w-48 truncate text-sm font-bold text-[#F8FAFC]">
                                        {user?.name ??
                                            'Administrator'}
                                    </p>

                                    <p className="max-w-48 truncate text-xs text-[#64748B]">
                                        {user?.email ??
                                            'admin@gmail.com'}
                                    </p>
                                </div>

                                <div className="hidden h-8 w-px bg-slate-800 lg:block" />

                                <Link
                                    href={route(
                                        'logout',
                                    )}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300 transition hover:border-rose-500/70 hover:bg-rose-500/20 hover:text-rose-200"
                                >
                                    <IkonKeluar />

                                    <span className="hidden sm:inline">
                                        Keluar
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* HALAMAN ADMIN */}
                    <div className="page-transition">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
