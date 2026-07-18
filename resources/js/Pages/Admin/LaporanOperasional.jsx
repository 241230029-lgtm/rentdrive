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

        if (
            Array.isArray(
                value?.data,
            )
        ) {
            return value.data;
        }
    }

    return [];
}

function formatTanggal(value) {
    if (!value) {
        return '-';
    }

    const cleanValue =
        String(value);

    const date =
        cleanValue.includes('T')
            ? new Date(cleanValue)
            : new Date(
                `${cleanValue}T00:00:00`,
            );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return '-';
    }

    return new Intl.DateTimeFormat(
        'id-ID',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    ).format(date);
}

function formatWaktu(value) {
    if (!value) {
        return '-';
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return '-';
    }

    return new Intl.DateTimeFormat(
        'id-ID',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    ).format(date);
}

function LaporanOperasional(
    props,
) {
    const ringkasan =
        props.ringkasan ??
        props.statistik ??
        props.stats ??
        {};

    const perStatus =
        arrayData(
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

    const perpanjangan =
        arrayData(
            props.perpanjangans,
            props.perpanjangan,
            props.detail_perpanjangan,
        );

    const [
        startDate,
        setStartDate,
    ] = useState(
        props.filter
            ?.tanggal_mulai ??
            '',
    );

    const [
        endDate,
        setEndDate,
    ] = useState(
        props.filter
            ?.tanggal_selesai ??
            '',
    );

    const maximumIncome =
        useMemo(() => {
            return Math.max(
                1,
                ...pendapatanBulanan.map(
                    (item) =>
                        Number(
                            item.total ??
                                item.pendapatan ??
                                0,
                        ),
                ),
            );
        }, [
            pendapatanBulanan,
        ]);

    const applyFilter = (
        event,
    ) => {
        event.preventDefault();

        router.get(
            route(
                'admin.laporan',
            ),
            {
                tanggal_mulai:
                    startDate ||
                    undefined,

                tanggal_selesai:
                    endDate ||
                    undefined,
            },
            {
                preserveState:
                    true,

                replace:
                    true,
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
                    description="Ringkasan transaksi, pendapatan sewa awal, perpanjangan, denda, dan kendaraan."
                />

                <form
                    onSubmit={
                        applyFilter
                    }
                    className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 sm:flex-row"
                >
                    <input
                        type="date"
                        value={
                            startDate
                        }
                        onChange={(
                            event,
                        ) =>
                            setStartDate(
                                event.target.value,
                            )
                        }
                        className={`${inputClass} sm:w-52`}
                    />

                    <input
                        type="date"
                        value={
                            endDate
                        }
                        onChange={(
                            event,
                        ) =>
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
                            setStartDate(
                                '',
                            );

                            setEndDate(
                                '',
                            );

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

                <div className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2.5">
                    <p className="text-[10px] leading-5 text-slate-400">
                        Pendapatan sewa awal mengikuti tanggal mulai transaksi.
                        Pendapatan perpanjangan mengikuti waktu pembayaran
                        disetujui dan tanggal baru diterapkan.
                    </p>
                </div>

                <section className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
                    <StatCard
                        label="Total Transaksi"
                        value={
                            ringkasan
                                .total_transaksi ??
                            ringkasan.total ??
                            transaksi.length
                        }
                    />

                    <StatCard
                        label="Transaksi Selesai"
                        value={
                            ringkasan
                                .transaksi_selesai ??
                            ringkasan.selesai ??
                            0
                        }
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Transaksi Aktif"
                        value={
                            ringkasan
                                .transaksi_aktif ??
                            ringkasan.aktif ??
                            0
                        }
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Perpanjangan"
                        value={
                            ringkasan
                                .jumlah_perpanjangan ??
                            perpanjangan.length
                        }
                        valueClass="text-violet-300"
                    />

                    <StatCard
                        label="Sewa Awal"
                        value={`Rp ${formatRupiah(
                            ringkasan
                                .pendapatan_sewa_awal ??
                                0,
                        )}`}
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Pendapatan Perpanjangan"
                        value={`Rp ${formatRupiah(
                            ringkasan
                                .pendapatan_perpanjangan ??
                                0,
                        )}`}
                        valueClass="text-violet-300"
                    />

                    <StatCard
                        label="Total Pendapatan"
                        value={`Rp ${formatRupiah(
                            ringkasan
                                .total_pendapatan ??
                                ringkasan
                                    .pendapatan ??
                                0,
                        )}`}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Total Denda"
                        value={`Rp ${formatRupiah(
                            ringkasan
                                .total_denda ??
                                ringkasan.denda ??
                                0,
                        )}`}
                        valueClass="text-rose-300"
                    />
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-2">
                    <Panel
                        title="Pendapatan Bulanan"
                        description="Pemisahan pendapatan sewa awal dan perpanjangan."
                    >
                        {pendapatanBulanan.length ===
                        0 ? (
                            <EmptyState
                                icon="Rp"
                                title="Belum ada data pendapatan"
                                description="Belum ada pendapatan pada periode yang dipilih."
                            />
                        ) : (
                            <div className="space-y-4 p-4">
                                {pendapatanBulanan.map(
                                    (
                                        item,
                                        index,
                                    ) => {
                                        const pendapatanSewaAwal =
                                            Number(
                                                item
                                                    .pendapatan_sewa_awal ??
                                                    0,
                                            );

                                        const pendapatanPerpanjangan =
                                            Number(
                                                item
                                                    .pendapatan_perpanjangan ??
                                                    0,
                                            );

                                        const total =
                                            Number(
                                                item.total ??
                                                    item.pendapatan ??
                                                    pendapatanSewaAwal +
                                                        pendapatanPerpanjangan,
                                            );

                                        const lebarSewaAwal =
                                            Math.max(
                                                pendapatanSewaAwal >
                                                    0
                                                    ? 2
                                                    : 0,
                                                (pendapatanSewaAwal /
                                                    maximumIncome) *
                                                    100,
                                            );

                                        const lebarPerpanjangan =
                                            Math.max(
                                                pendapatanPerpanjangan >
                                                    0
                                                    ? 2
                                                    : 0,
                                                (pendapatanPerpanjangan /
                                                    maximumIncome) *
                                                    100,
                                            );

                                        return (
                                            <article
                                                key={
                                                    item.bulan ??
                                                    index
                                                }
                                                className="rounded-lg border border-slate-800 bg-[#0B1120] p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-black text-white">
                                                            {item.label ??
                                                                item.bulan ??
                                                                '-'}
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            {Number(
                                                                item.jumlah_transaksi ??
                                                                    0,
                                                            )}{' '}
                                                            transaksi ·{' '}
                                                            {Number(
                                                                item.jumlah_perpanjangan ??
                                                                    0,
                                                            )}{' '}
                                                            perpanjangan
                                                        </p>
                                                    </div>

                                                    <p className="text-sm font-black text-emerald-300">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            total,
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="flex justify-between gap-3 text-[9px]">
                                                        <span className="font-bold text-cyan-300">
                                                            Sewa awal
                                                        </span>

                                                        <span className="font-black text-slate-300">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                pendapatanSewaAwal,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-900">
                                                        <div
                                                            className="h-full rounded-full bg-[#06B6D4]"
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    lebarSewaAwal,
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-2">
                                                    <div className="flex justify-between gap-3 text-[9px]">
                                                        <span className="font-bold text-violet-300">
                                                            Perpanjangan
                                                        </span>

                                                        <span className="font-black text-slate-300">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                pendapatanPerpanjangan,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-900">
                                                        <div
                                                            className="h-full rounded-full bg-violet-500"
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    lebarPerpanjangan,
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </Panel>

                    <Panel
                        title="Kendaraan Terlaris"
                        description="Kendaraan berdasarkan jumlah transaksi pada periode."
                    >
                        {kendaraanTerlaris.length ===
                        0 ? (
                            <EmptyState
                                icon="#"
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
                                                    {' · '}
                                                    {item.plat_nomor ??
                                                        '-'}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs font-black text-white">
                                                    {item.total_sewa ??
                                                        item.jumlah ??
                                                        item.total ??
                                                        0}{' '}
                                                    sewa
                                                </p>

                                                <p className="mt-0.5 text-[9px] font-bold text-violet-300">
                                                    {Number(
                                                        item.jumlah_perpanjangan ??
                                                            0,
                                                    )}{' '}
                                                    perpanjangan
                                                </p>
                                            </div>
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
                        description="Pendapatan sewa awal dan perpanjangan pada periode."
                    >
                        {transaksi.length ===
                        0 ? (
                            <EmptyState
                                title="Belum ada detail transaksi"
                                description="Tidak terdapat transaksi pada periode yang dipilih."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px] text-left">
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
                                                Periode Sewa
                                            </th>

                                            <th className="px-3 py-2.5 text-right">
                                                Sewa Awal
                                            </th>

                                            <th className="px-3 py-2.5 text-right">
                                                Perpanjangan
                                            </th>

                                            <th className="px-3 py-2.5 text-right">
                                                Pendapatan Periode
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
                                                    className="align-top"
                                                >
                                                    <td className="px-3 py-2.5">
                                                        <p className="text-xs font-black text-[#06B6D4]">
                                                            {item.nomor_booking ??
                                                                '-'}
                                                        </p>

                                                        <p className="mt-1 text-[9px] uppercase text-slate-600">
                                                            {String(
                                                                item.jenis_booking ??
                                                                    '-',
                                                            ).replaceAll(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <p className="text-xs font-bold text-white">
                                                            {item
                                                                .user
                                                                ?.name ??
                                                                item
                                                                    .pelanggan
                                                                    ?.name ??
                                                                '-'}
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            {item
                                                                .user
                                                                ?.email ??
                                                                item
                                                                    .pelanggan
                                                                    ?.email ??
                                                                '-'}
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <p className="text-xs text-slate-300">
                                                            {item
                                                                .kendaraan
                                                                ?.nama_kendaraan ??
                                                                '-'}
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            {item
                                                                .kendaraan
                                                                ?.plat_nomor ??
                                                                '-'}
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5 text-xs text-slate-300">
                                                        {formatTanggal(
                                                            item.tanggal_mulai,
                                                        )}
                                                        {' – '}
                                                        {formatTanggal(
                                                            item.tanggal_selesai,
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-2.5 text-right text-xs font-black text-cyan-300">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            item.pendapatan_sewa_awal ??
                                                                0,
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-2.5 text-right">
                                                        <p className="text-xs font-black text-violet-300">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                item.pendapatan_perpanjangan_periode ??
                                                                    0,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            {Number(
                                                                item.jumlah_perpanjangan_periode ??
                                                                    0,
                                                            )}{' '}
                                                            proses
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5 text-right text-xs font-black text-emerald-300">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            item.pendapatan_periode ??
                                                                0,
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

                <section className="mt-3">
                    <Panel
                        title="Detail Pendapatan Perpanjangan"
                        description="Perpanjangan yang pembayarannya disetujui pada periode laporan."
                    >
                        {perpanjangan.length ===
                        0 ? (
                            <EmptyState
                                icon="+"
                                title="Belum ada pendapatan perpanjangan"
                                description="Tidak ada pembayaran perpanjangan yang disetujui pada periode ini."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1050px] text-left">
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
                                                Tanggal Lama
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Tanggal Baru
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Tambahan
                                            </th>

                                            <th className="px-3 py-2.5 text-right">
                                                Pendapatan
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Diterapkan
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-800">
                                        {perpanjangan.map(
                                            (
                                                item,
                                                index,
                                            ) => (
                                                <tr
                                                    key={
                                                        item.id ??
                                                        index
                                                    }
                                                    className="align-top"
                                                >
                                                    <td className="px-3 py-2.5 text-xs font-black text-[#06B6D4]">
                                                        {item.nomor_booking ??
                                                            '-'}
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <p className="text-xs font-bold text-white">
                                                            {item
                                                                .pelanggan
                                                                ?.name ??
                                                                '-'}
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            {item
                                                                .pelanggan
                                                                ?.email ??
                                                                '-'}
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <p className="text-xs text-slate-300">
                                                            {item
                                                                .kendaraan
                                                                ?.nama_kendaraan ??
                                                                '-'}
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            {item
                                                                .kendaraan
                                                                ?.plat_nomor ??
                                                                '-'}
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5 text-xs text-slate-300">
                                                        {formatTanggal(
                                                            item.tanggal_selesai_lama,
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-2.5 text-xs font-bold text-violet-300">
                                                        {formatTanggal(
                                                            item.tanggal_selesai_baru,
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <p className="text-xs font-black text-violet-300">
                                                            +
                                                            {Number(
                                                                item.jumlah_hari_tambahan ??
                                                                    0,
                                                            )}{' '}
                                                            hari
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                item.harga_per_hari ??
                                                                    0,
                                                            )}
                                                            /hari
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5 text-right text-xs font-black text-emerald-300">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            item.biaya_tambahan ??
                                                                0,
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-2.5 text-xs text-slate-300">
                                                        {formatWaktu(
                                                            item.diterapkan_pada,
                                                        )}
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

LaporanOperasional.layout = (
    page,
) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default LaporanOperasional;
