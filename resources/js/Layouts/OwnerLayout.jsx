import NotificationMenu from '@/Components/NotificationMenu';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const menuOwner = [
    {
        label: 'Dashboard',
        href: '/owner/dashboard',
        activePattern: 'owner.dashboard',
        icon: '▦',
    },
    {
        label: 'Laporan Bisnis',
        href: '/owner/laporan-bisnis',
        activePattern: 'owner.laporan_bisnis',
        icon: '▥',
    },
];

function MenuItem({
    item,
    onClick,
}) {
    const aktif = route().current(
        item.activePattern,
    );

    return (
        <a
            href={item.href}
            onClick={onClick}
            className={`flex h-10 items-center gap-3 rounded-lg px-3 text-xs font-bold transition ${
                aktif
                    ? 'bg-[#06B6D4] text-[#0B1120]'
                    : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'
            }`}
        >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/10 text-sm">
                {item.icon}
            </span>

            <span className="truncate">
                {item.label}
            </span>
        </a>
    );
}

export default function OwnerLayout({
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

    const user = auth?.user ?? null;

    const daftarNotifikasi = Array.isArray(
        notifikasi?.terbaru,
    )
        ? notifikasi.terbaru
        : [];

    const jumlahBelumDibaca = Number(
        notifikasi?.jumlah_belum_dibaca ?? 0,
    );

    useEffect(() => {
        document.body.style.overflow =
            sidebarTerbuka ? 'hidden' : '';

        return () => {
            document.body.style.overflow =
                '';
        };
    }, [sidebarTerbuka]);

    const tutupSidebar = () => {
        setSidebarTerbuka(false);
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <div className="flex min-h-screen">
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-60 border-r border-slate-800 bg-[#10192B] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
                        sidebarTerbuka
                            ? 'translate-x-0'
                            : '-translate-x-full'
                    }`}
                >
                    <div className="flex h-full flex-col overflow-y-auto p-3">
                        <div className="flex h-11 items-center justify-between px-2">
                            <a
                                href="/owner/dashboard"
                                onClick={
                                    tutupSidebar
                                }
                                className="text-xl font-black"
                            >
                                Rent
                                <span className="text-[#06B6D4]">
                                    Drive
                                </span>
                            </a>

                            <button
                                type="button"
                                onClick={
                                    tutupSidebar
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 lg:hidden"
                                aria-label="Tutup menu"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-3 rounded-xl border border-slate-800 bg-[#0B1120] p-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#06B6D4]/10 text-sm font-black text-[#06B6D4]">
                                    {user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ??
                                        'O'}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-xs font-black text-white">
                                        {user?.name ??
                                            'Pemilik Rental'}
                                    </p>

                                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                        {user?.email ??
                                            'owner@rentdrive.com'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-2 border-t border-slate-800 pt-2">
                                <span className="inline-flex rounded-full border border-[#06B6D4]/20 bg-[#06B6D4]/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-[#06B6D4]">
                                    Owner
                                </span>
                            </div>
                        </div>

                        <nav className="mt-3 space-y-1">
                            {menuOwner.map(
                                (item) => (
                                    <MenuItem
                                        key={
                                            item.href
                                        }
                                        item={item}
                                        onClick={
                                            tutupSidebar
                                        }
                                    />
                                ),
                            )}
                        </nav>

                        <div className="mt-auto rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Panel Owner
                            </p>

                            <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                Pantau ringkasan dan
                                laporan bisnis RentDrive.
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
                        className="fixed inset-0 z-40 bg-black/70 lg:hidden"
                        aria-label="Tutup sidebar"
                    />
                )}

                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-[#0B1120]/95 px-3 backdrop-blur sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setSidebarTerbuka(
                                        true,
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#10192B] text-slate-300 lg:hidden"
                                aria-label="Buka menu"
                            >
                                ☰
                            </button>

                            <div>
                                <p className="text-xs font-black text-white">
                                    Panel Pemilik
                                </p>

                                <p className="hidden text-[10px] text-slate-600 sm:block">
                                    Ringkasan dan laporan
                                    bisnis
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <NotificationMenu
                                daftar={
                                    daftarNotifikasi
                                }
                                jumlahBelumDibaca={
                                    jumlahBelumDibaca
                                }
                            />

                            <div className="hidden text-right md:block">
                                <p className="max-w-40 truncate text-xs font-bold text-white">
                                    {user?.name ??
                                        'Pemilik Rental'}
                                </p>

                                <p className="text-[9px] font-bold uppercase tracking-wider text-[#06B6D4]">
                                    Owner
                                </p>
                            </div>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex h-9 items-center rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-[11px] font-black text-rose-300 transition hover:bg-rose-500/20"
                            >
                                Keluar
                            </Link>
                        </div>
                    </header>

                    <div className="min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
