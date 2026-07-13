import { Head, Link } from '@inertiajs/react';

const formatHarga = (nilai) => {
    return Number(nilai ?? 0).toLocaleString(
        'id-ID'
    );
};

const labelStatus = {
    menunggu_konfirmasi_admin:
        'Menunggu Konfirmasi',

    ditolak_booking:
        'Booking Ditolak',

    menunggu_pembayaran:
        'Menunggu Pembayaran',

    menunggu_verifikasi_pembayaran:
        'Verifikasi Pembayaran',

    ditolak_pembayaran:
        'Pembayaran Ditolak',

    disetujui_operasional:
        'Disetujui',

    sedang_berlangsung:
        'Sedang Berlangsung',

    menunggu_verifikasi_pengembalian:
        'Verifikasi Pengembalian',

    selesai:
        'Selesai',

    dibatalkan:
        'Dibatalkan',
};

const warnaStatus = {
    menunggu_konfirmasi_admin:
        'text-amber-300',

    ditolak_booking:
        'text-rose-300',

    menunggu_pembayaran:
        'text-yellow-300',

    menunggu_verifikasi_pembayaran:
        'text-sky-300',

    ditolak_pembayaran:
        'text-rose-300',

    disetujui_operasional:
        'text-emerald-300',

    sedang_berlangsung:
        'text-cyan-300',

    menunggu_verifikasi_pengembalian:
        'text-violet-300',

    selesai:
        'text-emerald-300',

    dibatalkan:
        'text-slate-400',
};

export default function Dashboard({
    auth,
    ringkasan = {},
    transaksiTerbaru = [],
}) {
    const kartuRingkasan = [
        {
            label: 'Jenis Kendaraan',
            nilai:
                ringkasan.jumlahKendaraan ?? 0,
            keterangan:
                'Data kendaraan terdaftar',
        },
        {
            label: 'Total Unit',
            nilai:
                ringkasan.jumlahUnit ?? 0,
            keterangan:
                'Seluruh unit kendaraan',
        },
        {
            label: 'Konfirmasi Booking',
            nilai:
                ringkasan.menungguKonfirmasi ??
                0,
            keterangan:
                'Perlu diperiksa admin',
        },
        {
            label: 'Verifikasi Pembayaran',
            nilai:
                ringkasan.menungguVerifikasi ??
                0,
            keterangan:
                'Bukti pembayaran masuk',
        },
        {
            label: 'Rental Aktif',
            nilai:
                ringkasan.rentalAktif ?? 0,
            keterangan:
                'Booking operasional aktif',
        },
        {
            label: 'Transaksi Selesai',
            nilai:
                ringkasan.transaksiSelesai ?? 0,
            keterangan:
                'Penyewaan telah selesai',
        },
    ];

    return (
        <>
            <Head title="Dashboard Admin" />

            <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-[#06B6D4]/20 bg-[#10192B] p-7 shadow-2xl sm:p-10">
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#06B6D4]/10 blur-3xl" />

                    <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#06B6D4]">
                                Pusat Operasional
                            </p>

                            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                                Selamat datang,{' '}
                                {auth?.user?.name ??
                                    'Administrator'}
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#94A3B8]">
                                Pantau permintaan booking,
                                pembayaran pelanggan, stok
                                kendaraan, dan aktivitas rental
                                RentDrive.
                            </p>
                        </div>

                        <Link
                            href={route(
                                'admin.booking.index'
                            )}
                            viewTransition
                            className="w-fit rounded-xl bg-[#06B6D4] px-6 py-3 text-sm font-bold text-[#0B1120] transition hover:bg-[#0891B2]"
                        >
                            Buka Kelola Booking
                        </Link>
                    </div>
                </section>

                <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {kartuRingkasan.map((item) => (
                        <article
                            key={item.label}
                            className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-xl"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#94A3B8]">
                                {item.label}
                            </p>

                            <p className="mt-4 text-4xl font-extrabold text-[#06B6D4]">
                                {item.nilai}
                            </p>

                            <p className="mt-2 text-xs text-[#64748B]">
                                {item.keterangan}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-xl sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                Aktivitas Terbaru
                            </p>

                            <h2 className="mt-2 text-xl font-bold">
                                Transaksi Terbaru
                            </h2>
                        </div>

                        <Link
                            href={route(
                                'admin.booking.index'
                            )}
                            viewTransition
                            className="text-sm font-bold text-[#06B6D4] hover:text-[#22D3EE]"
                        >
                            Lihat Kelola Booking
                        </Link>
                    </div>

                    {transaksiTerbaru.length === 0 ? (
                        <div className="py-14 text-center">
                            <p className="text-sm text-[#94A3B8]">
                                Belum ada transaksi rental.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-[#64748B]">
                                        <th className="px-3 py-3">
                                            Nomor Booking
                                        </th>

                                        <th className="px-3 py-3">
                                            Pelanggan
                                        </th>

                                        <th className="px-3 py-3">
                                            Kendaraan
                                        </th>

                                        <th className="px-3 py-3">
                                            Jenis
                                        </th>

                                        <th className="px-3 py-3">
                                            Total
                                        </th>

                                        <th className="px-3 py-3">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transaksiTerbaru.map(
                                        (transaksi) => (
                                            <tr
                                                key={
                                                    transaksi.id
                                                }
                                                className="border-b border-slate-800 text-sm"
                                            >
                                                <td className="whitespace-nowrap px-3 py-4 font-bold text-[#06B6D4]">
                                                    {
                                                        transaksi.nomor_booking
                                                    }
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4">
                                                    {transaksi
                                                        .user
                                                        ?.name ??
                                                        '-'}
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4">
                                                    {transaksi
                                                        .kendaraan
                                                        ?.nama_kendaraan ??
                                                        '-'}
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4 capitalize text-[#94A3B8]">
                                                    {transaksi.jenis_booking ===
                                                    'walk_in'
                                                        ? 'Walk-In'
                                                        : 'Online'}
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4">
                                                    Rp{' '}
                                                    {formatHarga(
                                                        transaksi.total_harga
                                                    )}
                                                </td>

                                                <td
                                                    className={`whitespace-nowrap px-3 py-4 text-xs font-bold ${
                                                        warnaStatus[
                                                            transaksi
                                                                .status
                                                        ] ??
                                                        'text-[#94A3B8]'
                                                    }`}
                                                >
                                                    {labelStatus[
                                                        transaksi
                                                            .status
                                                    ] ??
                                                        transaksi.status}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
