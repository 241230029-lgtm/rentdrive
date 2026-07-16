import {
    EmptyState,
    formatRupiah,
    inputClass,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
} from '@/Components/AdminCompact';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Head,
    router,
} from '@inertiajs/react';
import {
    useMemo,
    useState,
} from 'react';

function arrayData(...values) {
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

function LaporanOperasional(props) {
    const ringkasan =
        props.ringkasan ??
        props.statistik ??
        props.stats ??
        {};

    const perStatus = arrayData(
        props.transaksi_per_status,
        props.per_status,
        props.status_transaksi,
    );

    const kendaraanTerlaris =
        arrayData(
            props.kendaraan_terlaris,
            props.kendaraanTerlaris,
        );

    const pendapatanBulanan =
        arrayData(
            props.pendapatan_bulanan,
            props.pendapatanBulanan,
        );

    const transaksi =
        arrayData(
            props.transaksis,
            props.transaksi,
            props.laporan,
        );

    const [startDate, setStartDate] =
        useState(
            props.filter?.tanggal_mulai ??
                '',
        );

    const [endDate, setEndDate] =
        useState(
            props.filter?.tanggal_selesai ??
                '',
        );

    const maximumIncome = useMemo(() => {
        return Math.max(
            1,
            ...pendapatanBulanan.map(
                (item) =>
                    Number(
                        item.total ??
                            item.pendapatan ??
                            item.nilai ??
                            0,
                    ),
            ),
        );
    }, [pendapatanBulanan]);

    const applyFilter = (event) => {
        event.preventDefault();

        router.get(
            route('admin.laporan'),
            {
                tanggal_mulai:
                    startDate || undefined,
                tanggal_selesai:
                    endDate || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Laporan Operasional" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <PageHeader
                    eyebrow="Analisis Operasional"
                    title="Laporan Operasional"
                    description="Ringkasan transaksi, pendapatan, dan kendaraan."
                />

                <form
                    onSubmit={applyFilter}
                    className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 sm:flex-row"
                >
                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                            setStartDate(
                                event.target.value,
                            )
                        }
                        className={`${inputClass} sm:w-52`}
                    />

                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) =>
                            setEndDate(
                                event.target.value,
                            )
                        }
                        className={`${inputClass} sm:w-52`}
                    />

                    <button
                        type="submit"
                        className="h-10 rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120]"
                    >
                        Terapkan
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');

                            router.get(
                                route(
                                    'admin.laporan',
                                ),
                            );
                        }}
                        className="h-10 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-300"
                    >
                        Reset
                    </button>
                </form>

                <section className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        label="Total Transaksi"
                        value={
                            ringkasan.total_transaksi ??
                            ringkasan.total ??
                            transaksi.length
                        }
                    />

                    <StatCard
                        label="Transaksi Selesai"
                        value={
                            ringkasan.transaksi_selesai ??
                            ringkasan.selesai ??
                            0
                        }
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Transaksi Aktif"
                        value={
                            ringkasan.transaksi_aktif ??
                            ringkasan.aktif ??
                            0
                        }
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Pendapatan"
                        value={`Rp ${formatRupiah(
                            ringkasan.total_pendapatan ??
                                ringkasan.pendapatan ??
                                0,
                        )}`}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Total Denda"
                        value={`Rp ${formatRupiah(
                            ringkasan.total_denda ??
                                ringkasan.denda ??
                                0,
                        )}`}
                        valueClass="text-rose-300"
                    />

                    <StatCard
                        label="Kendaraan Aktif"
                        value={
                            ringkasan.kendaraan_aktif ??
                            ringkasan.kendaraan ??
                            0
                        }
                    />
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-2">
                    <Panel
                        title="Pendapatan Bulanan"
                        description="Perbandingan nilai pendapatan."
                    >
                        {pendapatanBulanan.length ===
                        0 ? (
                            <EmptyState
                                icon="▥"
                                title="Belum ada data pendapatan"
                                description="Data grafik muncul setelah controller mengirim laporan."
                            />
                        ) : (
                            <div className="space-y-3 p-4">
                                {pendapatanBulanan.map(
                                    (
                                        item,
                                        index,
                                    ) => {
                                        const value =
                                            Number(
                                                item.total ??
                                                    item.pendapatan ??
                                                    item.nilai ??
                                                    0,
                                            );

                                        return (
                                            <div
                                                key={
                                                    item.bulan ??
                                                    index
                                                }
                                            >
                                                <div className="flex justify-between gap-3 text-[10px]">
                                                    <span className="font-bold text-slate-400">
                                                        {item.label ??
                                                            item.bulan ??
                                                            '-'}
                                                    </span>

                                                    <span className="font-black text-white">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            value,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#0B1120]">
                                                    <div
                                                        className="h-full rounded-full bg-[#06B6D4]"
                                                        style={{
                                                            width: `${Math.max(
                                                                2,
                                                                (value /
                                                                    maximumIncome) *
                                                                    100,
                                                            )}%`,
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
                        description="Kendaraan dengan jumlah transaksi tertinggi."
                    >
                        {kendaraanTerlaris.length ===
                        0 ? (
                            <EmptyState
                                icon="◆"
                                title="Belum ada peringkat kendaraan"
                                description="Peringkat muncul setelah terdapat transaksi."
                            />
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {kendaraanTerlaris.map(
                                    (
                                        item,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                item.id ??
                                                index
                                            }
                                            className="flex items-center gap-3 px-4 py-3"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#06B6D4]/10 text-xs font-black text-[#06B6D4]">
                                                {index + 1}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-black text-white">
                                                    {item.nama_kendaraan ??
                                                        item.nama ??
                                                        '-'}
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-slate-600">
                                                    {item.merek ??
                                                        '-'}
                                                </p>
                                            </div>

                                            <p className="text-xs font-black text-white">
                                                {item.total_sewa ??
                                                    item.jumlah ??
                                                    item.total ??
                                                    0}{' '}
                                                sewa
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </Panel>
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
                    <Panel
                        title="Transaksi per Status"
                        description="Distribusi status transaksi."
                    >
                        {perStatus.length ===
                        0 ? (
                            <EmptyState
                                title="Belum ada data status"
                                description="Distribusi status belum tersedia."
                            />
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {perStatus.map(
                                    (
                                        item,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                item.status ??
                                                index
                                            }
                                            className="flex items-center justify-between gap-3 px-4 py-3"
                                        >
                                            <StatusBadge
                                                status={
                                                    item.status
                                                }
                                            />

                                            <p className="text-sm font-black text-white">
                                                {item.total ??
                                                    item.jumlah ??
                                                    0}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </Panel>

                    <Panel
                        title="Detail Transaksi"
                        description="Daftar transaksi pada periode laporan."
                    >
                        {transaksi.length ===
                        0 ? (
                            <EmptyState
                                title="Belum ada detail transaksi"
                                description="Controller laporan belum mengirim daftar transaksi."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left">
                                    <thead className="border-b border-slate-800 bg-[#0B1120] text-[9px] font-black uppercase text-slate-600">
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
                                                Nilai
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-800">
                                        {transaksi.map(
                                            (
                                                item,
                                                index,
                                            ) => (
                                                <tr
                                                    key={
                                                        item.id ??
                                                        index
                                                    }
                                                >
                                                    <td className="px-3 py-2.5 text-xs font-black text-[#06B6D4]">
                                                        {item.nomor_booking ??
                                                            '-'}
                                                    </td>

                                                    <td className="px-3 py-2.5 text-xs text-white">
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

                                                    <td className="px-3 py-2.5 text-xs font-black text-white">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            item.total_harga,
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
                </section>
            </main>
        </>
    );
}

LaporanOperasional.layout = (page) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default LaporanOperasional;
