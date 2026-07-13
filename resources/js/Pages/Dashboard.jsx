import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    return (
        <>
            <Head title="Dashboard Pelanggan" />

            <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                {/* HERO DASHBOARD */}
                <section className="relative overflow-hidden rounded-3xl border border-[#06B6D4]/20 bg-[#10192B] px-6 py-10 shadow-2xl sm:px-10 lg:px-12 lg:py-14">
                    {/* GAMBAR LATAR */}
                    <div className="absolute inset-0">
                        <img
                            src="/images/hero_sesion_mobil.jpg"
                            alt="Latar kendaraan RentDrive"
                            className="h-full w-full object-cover object-center opacity-25"
                        />
                    </div>

                    {/* LAPISAN GELAP */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/95 via-[#0B1120]/80 to-[#0B1120]/45" />

                    {/* EFEK CAHAYA */}
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#06B6D4]/10 blur-3xl" />

                    <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

                    {/* ISI HERO */}
                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#06B6D4]">
                                Dashboard Pelanggan
                            </p>

                            <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
                                Selamat datang,{' '}
                                <span className="text-[#06B6D4]">
                                    {user?.name ?? 'Pelanggan'}
                                </span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#CBD5E1] sm:text-base">
                                Jelajahi katalog RentDrive, pilih kendaraan
                                yang sesuai, kemudian ajukan permintaan
                                pemesanan. Pemeriksaan kendaraan akan
                                ditangani oleh admin.
                            </p>
                        </div>

                        <Link
                            href={route('pelanggan.katalog')}
                            viewTransition
                            className="inline-flex w-fit items-center justify-center rounded-xl bg-[#06B6D4] px-7 py-3.5 text-sm font-bold text-[#0B1120] shadow-lg transition hover:bg-[#0891B2]"
                        >
                            Buka Katalog
                        </Link>
                    </div>
                </section>

                {/* AKSES UTAMA */}
                <section className="py-16">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#06B6D4]">
                            Mulai Penyewaan
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold text-[#F8FAFC]">
                            Proses sederhana dalam satu akun
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#94A3B8]">
                            Tidak ada informasi stok kendaraan yang
                            ditampilkan kepada pelanggan. Anda cukup memilih
                            armada dan mengirim permintaan pemesanan.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        <article className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-lg font-bold text-[#06B6D4]">
                                1
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">
                                Pilih Kendaraan
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
                                Buka halaman katalog dan tentukan kendaraan
                                yang paling sesuai dengan kebutuhan perjalanan.
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-lg font-bold text-[#06B6D4]">
                                2
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">
                                Ajukan Pemesanan
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
                                Tekan tombol Pesan Sekarang dan lengkapi
                                informasi penyewaan yang diperlukan.
                            </p>
                        </article>

                        <article className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-lg font-bold text-[#06B6D4]">
                                3
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-[#F8FAFC]">
                                Tunggu Konfirmasi
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
                                Admin akan memeriksa permintaan dan
                                menginformasikan kelanjutan transaksi melalui
                                status penyewaan.
                            </p>
                        </article>
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href={route('pelanggan.katalog')}
                            viewTransition
                            className="rounded-xl bg-[#06B6D4] px-7 py-3 text-sm font-bold text-[#0B1120] transition hover:bg-[#0891B2]"
                        >
                            Lihat Katalog
                        </Link>

                        <Link
                            href={route('pelanggan.riwayat')}
                            viewTransition
                            className="rounded-xl border border-[#06B6D4]/60 px-7 py-3 text-sm font-bold text-[#06B6D4] transition hover:bg-[#06B6D4]/10"
                        >
                            Lihat Riwayat
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
