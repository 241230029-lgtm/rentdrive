import { Link, usePage } from '@inertiajs/react';

export default function PublicHeader({ halamanAktif = '' }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    return (
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

                {/* MENU */}
                <div className="flex items-center gap-2 sm:gap-5">
                    <a
                        href="/#katalog"
                        className="hidden text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#F8FAFC] md:inline-block"
                    >
                        Katalog
                    </a>

                    <a
                        href="/#syarat"
                        className="hidden text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#F8FAFC] md:inline-block"
                    >
                        Syarat & Ketentuan
                    </a>

                    {user ? (
                        <>
                            <Link
                                href={route('dashboard')}
                                className="rounded-xl bg-[#06B6D4] px-4 py-2.5 text-xs font-bold text-[#0B1120] transition-all hover:bg-[#0891B2] sm:px-5 sm:text-sm"
                            >
                                Dashboard
                            </Link>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="rounded-xl border border-rose-500/50 px-4 py-2.5 text-xs font-bold text-rose-400 transition-all hover:bg-rose-500/10 sm:text-sm"
                            >
                                Keluar
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className={
                                    halamanAktif === 'login'
                                        ? 'rounded-xl bg-[#1E293B] px-4 py-2.5 text-xs font-bold text-[#06B6D4] sm:text-sm'
                                        : 'rounded-xl px-4 py-2.5 text-xs font-semibold text-[#94A3B8] transition-colors hover:text-[#06B6D4] sm:text-sm'
                                }
                            >
                                Masuk
                            </Link>

                            <Link
                                href={route('register')}
                                className={
                                    halamanAktif === 'register'
                                        ? 'rounded-xl bg-[#0891B2] px-4 py-2.5 text-xs font-bold text-[#0B1120] sm:px-5 sm:text-sm'
                                        : 'rounded-xl bg-[#06B6D4] px-4 py-2.5 text-xs font-bold text-[#0B1120] transition-all hover:bg-[#0891B2] sm:px-5 sm:text-sm'
                                }
                            >
                                Daftar
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
