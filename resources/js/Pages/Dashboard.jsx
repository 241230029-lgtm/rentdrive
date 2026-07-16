import PelangganLayout from '@/Layouts/PelangganLayout';
import {
    Head,
    Link,
    usePage,
} from '@inertiajs/react';

function IkonDokumen() {
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
                d="M7 3h7l4 4v14H7V3Z"
            />

            <path
                strokeLinecap="round"
                d="M14 3v5h5M10 12h5M10 16h5"
            />
        </svg>
    );
}

function IkonKalender() {
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
                d="M7 12h10"
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

function IkonDenda() {
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

function IkonPembayaran() {
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
                y="5"
                width="18"
                height="14"
                rx="2"
            />

            <path
                strokeLinecap="round"
                d="M3 10h18M7 15h4"
            />
        </svg>
    );
}

function IkonPerisai() {
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
                d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12 2 2 4-4"
            />
        </svg>
    );
}

function KartuPeraturan({
    nomor,
    ikon,
    judul,
    deskripsi,
    perhatian = false,
}) {
    return (
        <article
            className={`rounded-2xl border p-5 transition ${
                perhatian
                    ? 'border-rose-500/30 bg-rose-500/[0.06]'
                    : 'border-slate-800 bg-[#1E293B]'
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                        perhatian
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                            : 'border-[#06B6D4]/20 bg-[#06B6D4]/10 text-[#06B6D4]'
                    }`}
                >
                    {ikon}
                </div>

                <span
                    className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[10px] font-black ${
                        perhatian
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-[#06B6D4]/10 text-[#06B6D4]'
                    }`}
                >
                    {nomor}
                </span>
            </div>

            <h3 className="mt-4 text-sm font-black text-white">
                {judul}
            </h3>

            <p className="mt-2 text-xs leading-6 text-slate-400">
                {deskripsi}
            </p>
        </article>
    );
}

export default function Dashboard() {
    const {
        auth,
    } = usePage().props;

    const user =
        auth?.user ?? null;

    const namaPelanggan =
        user?.name ?? 'Pelanggan';

    return (
        <>
            <Head title="Dashboard Pelanggan" />

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-[#06B6D4]/30 bg-[#10192B] shadow-xl">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-30"
                        style={{
                            backgroundImage:
                                "url('/images/hero_sesion_mobil.jpg')",
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-[#10192B] via-[#10192B]/95 to-[#10192B]/35" />

                    <div className="relative flex min-h-[260px] flex-col justify-center gap-6 px-6 py-10 sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-12">
                        <div className="max-w-3xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#06B6D4]">
                                Dashboard Pelanggan
                            </p>

                            <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                                Selamat datang,{' '}
                                <span className="text-[#06B6D4]">
                                    {namaPelanggan}
                                </span>
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                                Jelajahi katalog RentDrive,
                                pilih kendaraan yang sesuai,
                                kemudian ajukan permintaan
                                pemesanan. Setiap booking akan
                                diperiksa oleh admin.
                            </p>
                        </div>

                        <Link
                            href={route(
                                'pelanggan.katalog',
                            )}
                            className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#06B6D4] px-7 text-sm font-black text-[#0B1120] transition hover:bg-cyan-300"
                        >
                            Buka Katalog
                        </Link>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#06B6D4]">
                            Ketentuan Penyewaan
                        </p>

                        <h2 className="mt-3 text-2xl font-black text-white">
                            Peraturan Rental
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-slate-400">
                            Pelanggan wajib memahami dan
                            mengikuti ketentuan berikut selama
                            menggunakan layanan RentDrive.
                        </p>
                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <KartuPeraturan
                            nomor="1"
                            ikon={
                                <IkonDokumen />
                            }
                            judul="Identitas per Transaksi"
                            deskripsi="Setelah booking memperoleh persetujuan awal, pelanggan wajib melengkapi KTP, SIM, dan data pengguna kendaraan untuk transaksi tersebut."
                        />

                        <KartuPeraturan
                            nomor="2"
                            ikon={
                                <IkonPembayaran />
                            }
                            judul="Pembayaran Setelah Verifikasi"
                            deskripsi="Pembayaran sewa hanya dapat dilakukan setelah identitas transaksi disetujui oleh admin."
                        />

                        <KartuPeraturan
                            nomor="3"
                            ikon={
                                <IkonKalender />
                            }
                            judul="Pengembalian Tepat Waktu"
                            deskripsi="Kendaraan harus dikembalikan sesuai jadwal yang telah disepakati pada transaksi penyewaan."
                        />

                        <KartuPeraturan
                            nomor="4"
                            ikon={
                                <IkonKendaraan />
                            }
                            judul="Jaga Kondisi Kendaraan"
                            deskripsi="Pelanggan bertanggung jawab menjaga kebersihan, kelengkapan, dan kondisi kendaraan selama masa penyewaan."
                        />

                        <KartuPeraturan
                            nomor="5"
                            ikon={
                                <IkonDenda />
                            }
                            judul="Keterlambatan dan Kerusakan"
                            deskripsi="Keterlambatan pengembalian atau kerusakan kendaraan dapat dikenakan denda berdasarkan hasil pemeriksaan admin."
                            perhatian
                        />

                        <KartuPeraturan
                            nomor="6"
                            ikon={
                                <IkonPerisai />
                            }
                            judul="Denda Harus Dilunasi"
                            deskripsi="Akun dengan denda belum dibayar, menunggu verifikasi, atau pembayaran ditolak tidak dapat membuat booking baru. Booking aktif kembali setelah seluruh denda berstatus lunas."
                            perhatian
                        />
                    </div>

                    <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href={route(
                                'pelanggan.katalog',
                            )}
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#06B6D4] px-6 text-xs font-black text-[#0B1120] transition hover:bg-cyan-300 sm:w-auto"
                        >
                            Lihat Katalog
                        </Link>

                        <Link
                            href={route(
                                'pelanggan.riwayat',
                            )}
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#06B6D4]/50 px-6 text-xs font-black text-[#06B6D4] transition hover:bg-[#06B6D4]/10 sm:w-auto"
                        >
                            Lihat Riwayat
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

Dashboard.layout = (page) => (
    <PelangganLayout>
        {page}
    </PelangganLayout>
);
