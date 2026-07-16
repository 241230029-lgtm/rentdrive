import {
    EmptyState,
    formatRupiah,
    formatTanggal,
    formatWaktu,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
} from '@/Components/AdminCompact';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

function angka(
    object,
    keys,
    fallback = 0,
) {
    for (const key of keys) {
        if (
            object?.[key] !== undefined &&
            object?.[key] !== null
        ) {
            return Number(object[key]);
        }
    }

    return fallback;
}

function Dashboard(props) {
    const statistik =
        props?.statistik ??
        props?.stats ??
        {};

    const bookingTerbaru =
        props?.bookingTerbaru ??
        props?.booking_terbaru ??
        props?.bookings ??
        [];

    const aktivitasTerbaru =
        props?.aktivitasTerbaru ??
        props?.aktivitas_terbaru ??
        props?.aktivitas ??
        [];

    const daftarBooking = Array.isArray(
        bookingTerbaru,
    )
        ? bookingTerbaru
        : [];

    const daftarAktivitas = Array.isArray(
        aktivitasTerbaru,
    )
        ? aktivitasTerbaru
        : [];

    return (
        <>
            <Head title="Dashboard Admin" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <PageHeader
                    eyebrow="Ringkasan Operasional"
                    title="Dashboard Admin"
                    description="Pantau aktivitas rental tanpa ruang kosong berlebihan."
                    action={
                        <div className="flex gap-2">
                            <Link
                                href={route(
                                    'admin.booking.index',
                                )}
                                className="flex h-9 items-center rounded-lg border border-slate-700 px-3 text-xs font-bold text-slate-300 hover:border-[#06B6D4] hover:text-[#06B6D4]"
                            >
                                Booking
                            </Link>

                            <Link
                                href={route(
                                    'admin.kendaraan.index',
                                )}
                                className="flex h-9 items-center rounded-lg bg-[#06B6D4] px-3 text-xs font-black text-[#0B1120]"
                            >
                                Kendaraan
                            </Link>
                        </div>
                    }
                />

                <section className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        label="Kendaraan"
                        value={angka(
                            statistik,
                            [
                                'total_kendaraan',
                                'kendaraan',
                            ],
                        )}
                    />

                    <StatCard
                        label="Pelanggan"
                        value={angka(
                            statistik,
                            [
                                'total_pelanggan',
                                'pelanggan',
                            ],
                        )}
                    />

                    <StatCard
                        label="Total Booking"
                        value={angka(
                            statistik,
                            [
                                'total_booking',
                                'booking',
                            ],
                        )}
                    />

                    <StatCard
                        label="Perlu Konfirmasi"
                        value={angka(
                            statistik,
                            [
                                'booking_menunggu',
                                'menunggu_konfirmasi',
                                'booking_baru',
                            ],
                        )}
                        valueClass="text-amber-300"
                    />

                    <StatCard
                        label="Transaksi Aktif"
                        value={angka(
                            statistik,
                            [
                                'transaksi_aktif',
                                'booking_aktif',
                                'sewa_aktif',
                            ],
                        )}
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Pendapatan"
                        value={`Rp ${formatRupiah(
                            angka(
                                statistik,
                                [
                                    'pendapatan_bulan_ini',
                                    'pendapatan',
                                ],
                            ),
                        )}`}
                        valueClass="text-emerald-300"
                    />
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
                    <Panel
                        title="Booking Terbaru"
                        description="Transaksi terbaru yang masuk ke sistem."
                        action={
                            <Link
                                href={route(
                                    'admin.booking.index',
                                )}
                                className="text-[11px] font-bold text-[#06B6D4]"
                            >
                                Lihat semua
                            </Link>
                        }
                    >
                        {daftarBooking.length ===
                        0 ? (
                            <EmptyState
                                title="Belum ada booking"
                                description="Booking baru akan muncul pada bagian ini."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left">
                                    <thead className="border-b border-slate-800 bg-[#0B1120] text-[9px] font-black uppercase tracking-wider text-slate-600">
                                        <tr>
                                            <th className="px-3 py-2.5">
                                                Booking
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Pelanggan
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Kendaraan
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Jadwal
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-800">
                                        {daftarBooking
                                            .slice(0, 8)
                                            .map(
                                                (
                                                    item,
                                                    index,
                                                ) => (
                                                    <tr
                                                        key={
                                                            item.id ??
                                                            index
                                                        }
                                                        className="hover:bg-[#1E293B]/40"
                                                    >
                                                        <td className="px-3 py-2.5">
                                                            <p className="text-xs font-black text-[#06B6D4]">
                                                                {item.nomor_booking ??
                                                                    '-'}
                                                            </p>

                                                            <p className="mt-0.5 text-[9px] text-slate-600">
                                                                {formatWaktu(
                                                                    item.created_at,
                                                                )}
                                                            </p>
                                                        </td>

                                                        <td className="px-3 py-2.5 text-xs font-bold text-white">
                                                            {item
                                                                .user
                                                                ?.name ??
                                                                item
                                                                    .pelanggan
                                                                    ?.name ??
                                                                '-'}
                                                        </td>

                                                        <td className="px-3 py-2.5 text-xs text-slate-300">
                                                            {item
                                                                .kendaraan
                                                                ?.nama_kendaraan ??
                                                                '-'}
                                                        </td>

                                                        <td className="px-3 py-2.5 text-[11px] text-slate-400">
                                                            {formatTanggal(
                                                                item.tanggal_mulai,
                                                            )}{' '}
                                                            —{' '}
                                                            {formatTanggal(
                                                                item.tanggal_selesai,
                                                            )}
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <StatusBadge
                                                                status={
                                                                    item.status
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Panel>

                    <Panel
                        title="Aktivitas Terbaru"
                        description="Aktivitas operasional admin."
                    >
                        {daftarAktivitas.length ===
                        0 ? (
                            <EmptyState
                                icon="≡"
                                title="Belum ada aktivitas"
                                description="Log aktivitas akan muncul setelah admin melakukan tindakan."
                            />
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {daftarAktivitas
                                    .slice(0, 10)
                                    .map(
                                        (
                                            item,
                                            index,
                                        ) => (
                                            <div
                                                key={
                                                    item.id ??
                                                    index
                                                }
                                                className="px-4 py-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="text-xs font-black text-white">
                                                        {item.jenis_aktivitas ??
                                                            item.jenis ??
                                                            'Aktivitas'}
                                                    </p>

                                                    <p className="shrink-0 text-[9px] text-slate-600">
                                                        {formatWaktu(
                                                            item.created_at,
                                                        )}
                                                    </p>
                                                </div>

                                                <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                                                    {item.deskripsi ??
                                                        '-'}
                                                </p>
                                            </div>
                                        ),
                                    )}
                            </div>
                        )}
                    </Panel>
                </section>
            </main>
        </>
    );
}

Dashboard.layout = (page) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default Dashboard;
