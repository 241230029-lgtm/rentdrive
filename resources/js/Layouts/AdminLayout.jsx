import NotificationMenu from '@/Components/NotificationMenu';
import {
    Link,
    usePage,
} from '@inertiajs/react';
import {
    useState,
} from 'react';

function Ikon({
    children,
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

function IkonDashboard() {
    return (
        <Ikon>
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
        </Ikon>
    );
}

function IkonBooking() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 3v3M18 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"
            />

            <path
                strokeLinecap="round"
                d="M8 13h3M8 17h6"
            />
        </Ikon>
    );
}

function IkonStok() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5"
            />
        </Ikon>
    );
}

function IkonIdentitas() {
    return (
        <Ikon>
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
            />

            <circle
                cx="8"
                cy="11"
                r="2"
            />

            <path
                strokeLinecap="round"
                d="M5.5 16c.8-1.7 4.2-1.7 5 0M13 10h5M13 14h4"
            />
        </Ikon>
    );
}

function IkonKendaraan() {
    return (
        <Ikon>
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
        </Ikon>
    );
}

function IkonPerpanjangan() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"
            />

            <path
                strokeLinecap="round"
                d="M12 12v6M9 15h6"
            />
        </Ikon>
    );
}

function IkonPengembalian() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 7H5V3M5 7a8 8 0 1 1-1 7"
            />

            <path
                strokeLinecap="round"
                d="M12 8v5l3 2"
            />
        </Ikon>
    );
}

function IkonRiwayat() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5h16v14H4V5Z"
            />

            <path
                strokeLinecap="round"
                d="M8 9h8M8 13h8M8 17h5"
            />
        </Ikon>
    );
}

function IkonLaporan() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 20V10M12 20V4M19 20v-7"
            />

            <path
                strokeLinecap="round"
                d="M3 20h18"
            />
        </Ikon>
    );
}

function IkonKeluar() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 8l4 4-4 4M18 12H8M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"
            />
        </Ikon>
    );
}

function IkonMenu() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                d="M4 6h16M4 12h16M4 18h16"
            />
        </Ikon>
    );
}

function IkonTutup() {
    return (
        <Ikon>
            <path
                strokeLinecap="round"
                d="M6 6l12 12M18 6 6 18"
            />
        </Ikon>
    );
}

export default function AdminLayout({
    children,
}) {
    const {
        auth,
        notifikasi,
    } = usePage().props;

    const [
        sidebarTerbuka,
        setSidebarTerbuka,
    ] = useState(false);

    const user =
        auth?.user ?? null;

    const daftarNotifikasi =
        Array.isArray(
            notifikasi?.terbaru,
        )
            ? notifikasi.terbaru
            : [];

    const jumlahBelumDibaca =
        Number(
            notifikasi
                ?.jumlah_belum_dibaca ??
                0,
        );

    const kelasMenu = (
        aktif,
    ) => {
        return aktif
            ? 'flex items-center gap-3 rounded-xl bg-[#06B6D4] px-4 py-3 text-sm font-bold text-[#0B1120] shadow-lg shadow-cyan-950/30'
            : 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-[#F8FAFC]';
    };

    const tutupSidebar = () =>
        setSidebarTerbuka(
            false,
        );

    const menuUtama = [
        {
            label:
                'Dashboard',

            routeName:
                'admin.dashboard',

            active:
                'admin.dashboard',

            icon:
                <IkonDashboard />,
        },

        {
            label:
                'Kelola Booking',

            routeName:
                'admin.booking.index',

            active:
                'admin.booking.*',

            icon:
                <IkonBooking />,
        },

        {
            label:
                'Cek Ketersediaan',

            routeName:
                'admin.ketersediaan.index',

            active:
                'admin.ketersediaan.*',

            icon:
                <IkonStok />,
        },
    ];

    const menuOperasional = [
        {
            label:
                'Verifikasi Identitas',

            routeName:
                'admin.identitas.index',

            active:
                'admin.identitas.*',

            icon:
                <IkonIdentitas />,
        },

        {
            label:
                'Kelola Kendaraan',

            routeName:
                'admin.kendaraan.index',

            active:
                'admin.kendaraan.*',

            icon:
                <IkonKendaraan />,
        },

        {
            label:
                'Perpanjangan Rental',

            routeName:
                'admin.perpanjangan.index',

            active:
                'admin.perpanjangan.*',

            icon:
                <IkonPerpanjangan />,
        },

        {
            label:
                'Pengembalian',

            routeName:
                'admin.pengembalian.index',

            active:
                'admin.pengembalian.*',

            icon:
                <IkonPengembalian />,
        },

        {
            label:
                'Riwayat Transaksi',

            routeName:
                'admin.riwayat.index',

            active:
                'admin.riwayat.*',

            icon:
                <IkonRiwayat />,
        },

        {
            label:
                'Laporan',

            routeName:
                'admin.laporan',

            active:
                'admin.laporan',

            icon:
                <IkonLaporan />,
        },
    ];

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
                    <div className="flex h-full flex-col overflow-y-auto p-5">
                        <div className="flex items-center justify-between">
                            <Link
                                href={route(
                                    'admin.dashboard',
                                )}
                                viewTransition
                                className="text-2xl font-black"
                                onClick={
                                    tutupSidebar
                                }
                            >
                                Rent

                                <span className="text-[#06B6D4]">
                                    Drive
                                </span>
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    tutupSidebar
                                }
                                className="rounded-lg p-2 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-white md:hidden"
                                aria-label="Tutup menu admin"
                            >
                                <IkonTutup />
                            </button>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#1E293B] p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#06B6D4]/10 font-extrabold text-[#06B6D4]">
                                    {user?.name
                                        ?.charAt(
                                            0,
                                        )
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

                        <nav className="mt-6 space-y-2">
                            {menuUtama.map(
                                (
                                    menu,
                                ) => (
                                    <Link
                                        key={
                                            menu.routeName
                                        }
                                        href={route(
                                            menu.routeName,
                                        )}
                                        viewTransition
                                        onClick={
                                            tutupSidebar
                                        }
                                        className={kelasMenu(
                                            route().current(
                                                menu.active,
                                            ),
                                        )}
                                    >
                                        {
                                            menu.icon
                                        }

                                        {
                                            menu.label
                                        }
                                    </Link>
                                ),
                            )}
                        </nav>

                        <div className="mt-6 border-t border-slate-800 pt-5">
                            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                                Operasional
                            </p>

                            <div className="mt-3 space-y-2">
                                {menuOperasional.map(
                                    (
                                        menu,
                                    ) => (
                                        <Link
                                            key={
                                                menu.routeName
                                            }
                                            href={route(
                                                menu.routeName,
                                            )}
                                            viewTransition
                                            onClick={
                                                tutupSidebar
                                            }
                                            className={kelasMenu(
                                                route().current(
                                                    menu.active,
                                                ),
                                            )}
                                        >
                                            {
                                                menu.icon
                                            }

                                            {
                                                menu.label
                                            }
                                        </Link>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="mt-auto border-t border-slate-800 pt-5">
                            <p className="text-xs leading-5 text-[#64748B]">
                                Kelola booking,
                                armada,
                                pembayaran,
                                perpanjangan,
                                pengembalian, dan
                                laporan RentDrive
                                melalui panel
                                administrator.
                            </p>
                        </div>
                    </div>
                </aside>

                {sidebarTerbuka && (
                    <button
                        type="button"
                        onClick={
                            tutupSidebar
                        }
                        aria-label="Tutup latar menu"
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                    />
                )}

                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur">
                        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
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
                                        Panel Administrator
                                    </p>

                                    <p className="hidden text-xs text-[#64748B] sm:block">
                                        Sistem Operasional RentDrive
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <NotificationMenu
                                    daftar={
                                        daftarNotifikasi
                                    }
                                    jumlahBelumDibaca={
                                        jumlahBelumDibaca
                                    }
                                />

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
                                    className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-sm font-bold text-rose-300 transition hover:border-rose-500/70 hover:bg-rose-500/20 hover:text-rose-200 sm:px-4"
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
