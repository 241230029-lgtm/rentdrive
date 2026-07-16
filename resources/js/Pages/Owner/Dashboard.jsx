import {
    EmptyState,
    formatRupiah,
    PageHeader,
    Panel,
    StatCard,
} from '@/Components/AdminCompact';
import OwnerLayout from '@/Layouts/OwnerLayout';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

function ambilNilai(
    object,
    keys,
    fallback = 0,
) {
    for (const key of keys) {
        if (
            object?.[key] !== undefined &&
            object?.[key] !== null
        ) {
            return object[key];
        }
    }

    return fallback;
}

function ambilArray(...values) {
    for (const value of values) {
        if (Array.isArray(value)) {
            return value;
        }

        if (Array.isArray(value?.data)) {
            return value.data;
        }
    }

    return [];
}

function Dashboard(props) {
    const statistik =
        props.statistik ??
        props.ringkasan ??
        props.stats ??
        {};

    const trenPendapatan = ambilArray(
        props.tren_pendapatan,
        props.trenPendapatan,
        props.pendapatan_bulanan,
        props.pendapatanBulanan,
        props.transaksi_bulanan,
    );

    const kendaraanTerlaris =
        ambilArray(
            props.kendaraan_terlaris,
            props.kendaraanTerlaris,
            props.armada_terlaris,
        );

    const maksimumPendapatan =
        useMemo(() => {
            return Math.max(
                1,
                ...trenPendapatan.map(
                    (item) =>
                        Number(
                            item.pendapatan ??
                                item.total_pendapatan ??
                                item.total ??
                                item.nilai ??
                                0,
                        ),
                ),
            );
        }, [trenPendapatan]);

    return (
        <>
            <Head title="Dashboard Owner" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <PageHeader
                    eyebrow="Ringkasan Eksekutif"
                    title="Dashboard Owner"
                    description="Pantau pendapatan, transaksi, pelanggan, dan performa armada."
                    action={
                        <a
                            href="/owner/laporan-bisnis"
                            className="flex h-9 items-center rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120] transition hover:bg-[#22D3EE]"
                        >
                            Buka Laporan Bisnis
                        </a>
                    }
                />

                <section className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        label="Pendapatan"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                statistik,
                                [
                                    'total_pendapatan',
                                    'pendapatan',
                                    'pendapatan_bulan_ini',
                                ],
                            ),
                        )}`}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Total Transaksi"
                        value={ambilNilai(
                            statistik,
                            [
                                'total_transaksi',
                                'total_booking',
                                'transaksi',
                            ],
                        )}
                    />

                    <StatCard
                        label="Transaksi Aktif"
                        value={ambilNilai(
                            statistik,
                            [
                                'transaksi_aktif',
                                'sewa_aktif',
                                'booking_aktif',
                            ],
                        )}
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Transaksi Selesai"
                        value={ambilNilai(
                            statistik,
                            [
                                'transaksi_selesai',
                                'sewa_selesai',
                                'selesai',
                            ],
                        )}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Total Pelanggan"
                        value={ambilNilai(
                            statistik,
                            [
                                'total_pelanggan',
                                'pelanggan',
                            ],
                        )}
                    />

                    <StatCard
                        label="Total Armada"
                        value={ambilNilai(
                            statistik,
                            [
                                'total_kendaraan',
                                'total_armada',
                                'kendaraan',
                            ],
                        )}
                    />
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                    <Panel
                        title="Tren Pendapatan"
                        description="Perbandingan pendapatan setiap periode."
                        action={
                            <a
                                href="/owner/laporan-bisnis"
                                className="text-[11px] font-bold text-[#06B6D4] transition hover:text-[#22D3EE]"
                            >
                                Lihat laporan
                            </a>
                        }
                    >
                        {trenPendapatan.length ===
                        0 ? (
                            <EmptyState
                                icon="▥"
                                title="Belum ada data pendapatan"
                                description="Data pendapatan akan muncul setelah terdapat transaksi."
                            />
                        ) : (
                            <div className="space-y-3 p-4">
                                {trenPendapatan
                                    .slice(-12)
                                    .map(
                                        (
                                            item,
                                            index,
                                        ) => {
                                            const nilai =
                                                Number(
                                                    item.pendapatan ??
                                                        item.total_pendapatan ??
                                                        item.total ??
                                                        item.nilai ??
                                                        0,
                                                );

                                            const label =
                                                item.label ??
                                                item.bulan ??
                                                item.periode ??
                                                `Periode ${
                                                    index +
                                                    1
                                                }`;

                                            const persentase =
                                                Math.max(
                                                    2,
                                                    Math.min(
                                                        100,
                                                        (nilai /
                                                            maksimumPendapatan) *
                                                            100,
                                                    ),
                                                );

                                            return (
                                                <div
                                                    key={`${label}-${index}`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-[10px] font-bold text-slate-400">
                                                            {
                                                                label
                                                            }
                                                        </p>

                                                        <p className="text-[10px] font-black text-white">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                nilai,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#0B1120]">
                                                        <div
                                                            className="h-full rounded-full bg-[#06B6D4]"
                                                            style={{
                                                                width: `${persentase}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                            </div>
                        )}
                    </Panel>

                    <Panel
                        title="Kendaraan Terlaris"
                        description="Armada dengan jumlah transaksi tertinggi."
                    >
                        {kendaraanTerlaris.length ===
                        0 ? (
                            <EmptyState
                                icon="◆"
                                title="Belum ada peringkat"
                                description="Peringkat kendaraan akan muncul setelah terdapat transaksi."
                            />
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {kendaraanTerlaris
                                    .slice(0, 10)
                                    .map(
                                        (
                                            item,
                                            index,
                                        ) => {
                                            const nama =
                                                item.nama_kendaraan ??
                                                item.nama ??
                                                item.kendaraan
                                                    ?.nama_kendaraan ??
                                                '-';

                                            const merek =
                                                item.merek ??
                                                item.kendaraan
                                                    ?.merek ??
                                                'RentDrive';

                                            const jumlah =
                                                item.total_sewa ??
                                                item.jumlah_sewa ??
                                                item.jumlah ??
                                                item.total ??
                                                0;

                                            return (
                                                <div
                                                    key={
                                                        item.id ??
                                                        index
                                                    }
                                                    className="flex items-center gap-3 px-4 py-3"
                                                >
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#06B6D4]/10 text-xs font-black text-[#06B6D4]">
                                                        {index +
                                                            1}
                                                    </span>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-black text-white">
                                                            {
                                                                nama
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 truncate text-[10px] text-slate-600">
                                                            {
                                                                merek
                                                            }
                                                        </p>
                                                    </div>

                                                    <p className="shrink-0 text-xs font-black text-white">
                                                        {
                                                            jumlah
                                                        }{' '}
                                                        sewa
                                                    </p>
                                                </div>
                                            );
                                        },
                                    )}
                            </div>
                        )}
                    </Panel>
                </section>

                <section className="mt-3 rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-black text-white">
                                Laporan Bisnis
                                RentDrive
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Lihat detail
                                pendapatan, status
                                transaksi, kendaraan
                                terlaris, dan riwayat
                                berdasarkan periode.
                            </p>
                        </div>

                        <a
                            href="/owner/laporan-bisnis"
                            className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#06B6D4] px-5 text-xs font-black text-[#0B1120] transition hover:bg-[#22D3EE]"
                        >
                            Lihat Laporan
                        </a>
                    </div>
                </section>
            </main>
        </>
    );
}

Dashboard.layout = (page) => (
    <OwnerLayout>
        {page}
    </OwnerLayout>
);

export default Dashboard;
