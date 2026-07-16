import NotificationMenu from '@/Components/NotificationMenu';
import {
    Link,
    usePage,
} from '@inertiajs/react';
import {
    useEffect,
    useState,
} from 'react';

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

function IkonPeringatan() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-8 w-8"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
            />

            <path
                strokeLinecap="round"
                d="M12 8v5"
            />

            <circle
                cx="12"
                cy="16.5"
                r=".7"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

function ModalPeringatanDenda({
    terbuka,
    pesan,
    onClose,
}) {
    useEffect(() => {
        if (!terbuka) {
            return undefined;
        }

        const tanganiKeyboard = (
            event,
        ) => {
            if (
                event.key ===
                'Escape'
            ) {
                onClose();
            }
        };

        const overflowSebelumnya =
            document.body.style.overflow;

        document.body.style.overflow =
            'hidden';

        window.addEventListener(
            'keydown',
            tanganiKeyboard,
        );

        return () => {
            document.body.style.overflow =
                overflowSebelumnya;

            window.removeEventListener(
                'keydown',
                tanganiKeyboard,
            );
        };
    }, [
        terbuka,
        onClose,
    ]);

    if (!terbuka) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-peringatan-denda"
            onMouseDown={(
                event,
            ) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <section className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/40 bg-[#10192B] shadow-2xl shadow-black/60">
                <header className="border-b border-slate-800 bg-rose-500/[0.06] px-5 py-5">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
                            <IkonPeringatan />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-400">
                                Booking Diblokir
                            </p>

                            <h2
                                id="judul-peringatan-denda"
                                className="mt-1 text-lg font-black text-white"
                            >
                                Denda Belum Lunas
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                Booking baru belum dapat
                                dilakukan pada akun ini.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-lg font-bold text-slate-400 transition hover:border-rose-400 hover:text-rose-300"
                            aria-label="Tutup peringatan"
                        >
                            ×
                        </button>
                    </div>
                </header>

                <div className="p-5">
                    <div className="rounded-xl border border-rose-500/25 bg-rose-500/[0.07] p-4">
                        <p className="text-xs font-bold leading-6 text-rose-100/90">
                            {pesan ||
                                'Anda masih memiliki tagihan denda yang belum dilunasi. Selesaikan pembayaran denda sebelum membuat booking baru.'}
                        </p>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-800 bg-[#0B1120] p-4">
                        <p className="text-xs font-black text-white">
                            Agar dapat melakukan booking kembali:
                        </p>

                        <div className="mt-3 space-y-2">
                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-[10px] font-black text-rose-300">
                                    1
                                </span>

                                <p className="text-[11px] leading-5 text-slate-400">
                                    Buka riwayat sewa dan pilih
                                    transaksi yang memiliki
                                    tagihan denda.
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-[10px] font-black text-rose-300">
                                    2
                                </span>

                                <p className="text-[11px] leading-5 text-slate-400">
                                    Bayar seluruh tagihan dan
                                    kirim bukti pembayaran.
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-[10px] font-black text-rose-300">
                                    3
                                </span>

                                <p className="text-[11px] leading-5 text-slate-400">
                                    Tunggu sampai seluruh
                                    pembayaran disetujui oleh
                                    admin.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2.5">
                        <p className="text-[10px] font-semibold leading-5 text-amber-200/80">
                            Status menunggu verifikasi atau
                            pembayaran ditolak masih dianggap
                            belum lunas. Booking aktif kembali
                            setelah seluruh denda berstatus
                            lunas.
                        </p>
                    </div>
                </div>

                <footer className="flex flex-col-reverse gap-2 border-t border-slate-800 px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="h-10 rounded-lg border border-slate-700 px-5 text-xs font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
                    >
                        Tutup
                    </button>

                    <Link
                        href={route(
                            'pelanggan.riwayat',
                        )}
                        onClick={
                            onClose
                        }
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-rose-500 px-5 text-xs font-black text-white transition hover:bg-rose-400"
                    >
                        Lihat dan Bayar Denda
                    </Link>
                </footer>
            </section>
        </div>
    );
}

export default function PelangganLayout({
    children,
}) {
    const {
        auth,
        notifikasi,
        errors = {},
    } = usePage().props;

    const [
        menuTerbuka,
        setMenuTerbuka,
    ] = useState(false);

    const [
        modalDendaTerbuka,
        setModalDendaTerbuka,
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

    /*
     * BookingService mengirim ValidationException
     * menggunakan key "booking" ketika pelanggan
     * masih mempunyai denda belum lunas.
     */
    const pesanBooking =
        typeof errors?.booking ===
        'string'
            ? errors.booking
            : Array.isArray(
                    errors?.booking,
                )
              ? errors.booking[0]
              : null;

    const peringatanDenda =
        Boolean(
            pesanBooking &&
                String(
                    pesanBooking,
                )
                    .toLowerCase()
                    .includes(
                        'denda',
                    ),
        );

    /*
     * Object errors diperbarui pada setiap respons
     * Inertia. Modal akan kembali muncul setiap kali
     * pelanggan mencoba booking saat masih diblokir,
     * termasuk ketika pesannya sama dengan sebelumnya.
     */
    useEffect(() => {
        if (
            peringatanDenda
        ) {
            setModalDendaTerbuka(
                true,
            );
        }
    }, [
        errors,
        peringatanDenda,
    ]);

    const sedangAktif = (
        namaRoute,
    ) =>
        route().current(
            namaRoute,
        );

    const kelasMenu = (
        aktif,
    ) => {
        return aktif
            ? 'rounded-lg bg-[#06B6D4]/10 px-3 py-2 text-sm font-bold text-[#06B6D4]'
            : 'rounded-lg px-3 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]';
    };

    const tutupMenu = () =>
        setMenuTerbuka(
            false,
        );

    useEffect(() => {
        const tutupSaatDesktop =
            () => {
                if (
                    window.innerWidth >=
                    768
                ) {
                    setMenuTerbuka(
                        false,
                    );
                }
            };

        window.addEventListener(
            'resize',
            tutupSaatDesktop,
        );

        return () =>
            window.removeEventListener(
                'resize',
                tutupSaatDesktop,
            );
    }, []);

    return (
        <div className="min-h-screen bg-[#0B1120] font-sans text-[#F8FAFC] antialiased selection:bg-[#06B6D4] selection:text-[#0B1120]">
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-md">
                <nav className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route(
                            'pelanggan.dashboard',
                        )}
                        viewTransition
                        className="text-xl font-black tracking-wider text-[#F8FAFC] sm:text-2xl"
                    >
                        Rent

                        <span className="text-[#06B6D4]">
                            Drive
                        </span>
                    </Link>

                    <div className="hidden items-center gap-1 md:flex lg:gap-2">
                        <Link
                            href={route(
                                'pelanggan.dashboard',
                            )}
                            viewTransition
                            className={kelasMenu(
                                sedangAktif(
                                    'pelanggan.dashboard',
                                ),
                            )}
                        >
                            Dashboard
                        </Link>

                        <Link
                            href={route(
                                'pelanggan.katalog',
                            )}
                            viewTransition
                            className={kelasMenu(
                                sedangAktif(
                                    'pelanggan.katalog',
                                ),
                            )}
                        >
                            Katalog
                        </Link>

                        <Link
                            href={route(
                                'pelanggan.riwayat',
                            )}
                            viewTransition
                            className={kelasMenu(
                                sedangAktif(
                                    'pelanggan.riwayat',
                                ),
                            )}
                        >
                            Riwayat Sewa
                        </Link>

                        <Link
                            href={route(
                                'pelanggan.profile.edit',
                            )}
                            viewTransition
                            className={kelasMenu(
                                sedangAktif(
                                    'pelanggan.profile.*',
                                ),
                            )}
                        >
                            Profil
                        </Link>

                        <div className="ml-2">
                            <NotificationMenu
                                daftar={
                                    daftarNotifikasi
                                }
                                jumlahBelumDibaca={
                                    jumlahBelumDibaca
                                }
                            />
                        </div>

                        <div className="ml-2 flex items-center gap-3 border-l border-slate-700 pl-4">
                            <div className="hidden text-right lg:block">
                                <p className="max-w-32 truncate text-sm font-bold text-[#F8FAFC]">
                                    {user?.name ??
                                        'Pelanggan'}
                                </p>

                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#06B6D4]">
                                    Pelanggan
                                </p>
                            </div>

                            <Link
                                href={route(
                                    'logout',
                                )}
                                method="post"
                                as="button"
                                className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-3.5 py-2.5 text-sm font-bold text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-300"
                            >
                                Keluar
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <NotificationMenu
                            daftar={
                                daftarNotifikasi
                            }
                            jumlahBelumDibaca={
                                jumlahBelumDibaca
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setMenuTerbuka(
                                    (
                                        nilai,
                                    ) =>
                                        !nilai,
                                )
                            }
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-[#94A3B8] transition hover:border-[#06B6D4] hover:text-[#06B6D4]"
                            aria-label="Buka menu navigasi"
                            aria-expanded={
                                menuTerbuka
                            }
                        >
                            {menuTerbuka ? (
                                <IkonTutup />
                            ) : (
                                <IkonMenu />
                            )}
                        </button>
                    </div>
                </nav>

                {menuTerbuka && (
                    <div className="border-t border-slate-800 bg-[#0B1120] px-4 py-4 md:hidden">
                        <div className="mx-auto flex max-w-7xl flex-col gap-1.5">
                            <div className="mb-2 rounded-xl border border-slate-800 bg-[#1E293B] px-4 py-3">
                                <p className="truncate font-bold text-[#F8FAFC]">
                                    {user?.name ??
                                        'Pelanggan'}
                                </p>

                                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#06B6D4]">
                                    Pelanggan
                                </p>
                            </div>

                            <Link
                                href={route(
                                    'pelanggan.dashboard',
                                )}
                                viewTransition
                                onClick={
                                    tutupMenu
                                }
                                className={kelasMenu(
                                    sedangAktif(
                                        'pelanggan.dashboard',
                                    ),
                                )}
                            >
                                Dashboard
                            </Link>

                            <Link
                                href={route(
                                    'pelanggan.katalog',
                                )}
                                viewTransition
                                onClick={
                                    tutupMenu
                                }
                                className={kelasMenu(
                                    sedangAktif(
                                        'pelanggan.katalog',
                                    ),
                                )}
                            >
                                Katalog
                            </Link>

                            <Link
                                href={route(
                                    'pelanggan.riwayat',
                                )}
                                viewTransition
                                onClick={
                                    tutupMenu
                                }
                                className={kelasMenu(
                                    sedangAktif(
                                        'pelanggan.riwayat',
                                    ),
                                )}
                            >
                                Riwayat Sewa
                            </Link>

                            <Link
                                href={route(
                                    'pelanggan.profile.edit',
                                )}
                                viewTransition
                                onClick={
                                    tutupMenu
                                }
                                className={kelasMenu(
                                    sedangAktif(
                                        'pelanggan.profile.*',
                                    ),
                                )}
                            >
                                Profil
                            </Link>

                            <Link
                                href={route(
                                    'logout',
                                )}
                                method="post"
                                as="button"
                                className="mt-2 w-full rounded-xl border border-rose-500/50 bg-rose-500/10 px-5 py-3 text-center text-sm font-bold text-rose-400 transition hover:bg-rose-500/20"
                            >
                                Keluar
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <div className="page-transition min-h-[calc(100vh-69px)]">
                {children}
            </div>

            <footer className="border-t border-slate-800 bg-[#0B1120]">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div>
                        <Link
                            href={route(
                                'pelanggan.dashboard',
                            )}
                            viewTransition
                            className="text-xl font-black tracking-wider text-[#F8FAFC]"
                        >
                            Rent

                            <span className="text-[#06B6D4]">
                                Drive
                            </span>
                        </Link>

                        <p className="mt-2 text-xs text-[#64748B]">
                            Layanan rental kendaraan
                            modern dan transparan.
                        </p>
                    </div>

                    <p className="text-xs text-[#64748B]">
                        ©{' '}
                        {new Date().getFullYear()}{' '}
                        RentDrive. Seluruh hak
                        dilindungi.
                    </p>
                </div>
            </footer>

            <ModalPeringatanDenda
                terbuka={
                    modalDendaTerbuka
                }
                pesan={
                    pesanBooking
                }
                onClose={() =>
                    setModalDendaTerbuka(
                        false,
                    )
                }
            />
        </div>
    );
}
