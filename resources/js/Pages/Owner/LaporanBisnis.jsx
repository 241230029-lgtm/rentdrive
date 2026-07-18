import {
    EmptyState,
    formatRupiah,
    inputClass,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
} from '@/Components/AdminCompact';
import OwnerLayout from '@/Layouts/OwnerLayout';
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

function ambilNilai(
    object,
    keys,
    fallback = 0,
) {
    for (const key of keys) {
        if (
            object?.[key] !==
                undefined &&
            object?.[key] !==
                null
        ) {
            return object[key];
        }
    }

    return fallback;
}

function formatTanggal(value) {
    if (!value) {
        return '-';
    }

    const clean =
        String(value).split('T')[0];

    const date =
        new Date(
            `${clean}T00:00:00`,
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

function LaporanBisnis(props) {
    const ringkasan =
        props.ringkasan ??
        props.statistik ??
        {};

    const pendapatanPerBulan =
        arrayData(
            props.pendapatan_per_bulan,
            props.pendapatan_bulanan,
        );

    const statusTransaksi =
        arrayData(
            props.transaksi_per_status,
            props.status_transaksi,
        );

    const kendaraanTerlaris =
        arrayData(
            props.kendaraan_terlaris,
        );

    const transaksi =
        arrayData(
            props.transaksis,
            props.transaksi,
        );

    const perpanjangan =
        arrayData(
            props.perpanjangans,
            props.perpanjangan,
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

    const maksimumPendapatan =
        useMemo(() => {
            return Math.max(
                1,
                ...pendapatanPerBulan.map(
                    (item) =>
                        Number(
                            item.total ??
                                item.total_pendapatan ??
                                item.pendapatan ??
                                0,
                        ),
                ),
            );
        }, [
            pendapatanPerBulan,
        ]);

    const applyFilter = (
        event,
    ) => {
        event.preventDefault();

        router.get(
            route(
                'owner.laporan',
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

    const resetFilter = () => {
        setStartDate('');
        setEndDate('');

        router.get(
            route(
                'owner.laporan',
            ),
        );
    };

    return (
        <>
            <Head title="Laporan Bisnis" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <PageHeader
                    eyebrow="Analisis Bisnis"
                    title="Laporan Bisnis"
                    description="Pantau pendapatan sewa awal, perpanjangan, denda, dan performa armada."
                />

                <form
                    onSubmit={
                        applyFilter
                    }
                    className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 sm:flex-row"
                >
                    <div>
                        <p className="mb-1 text-[9px] font-black uppercase text-slate-600">
                            Tanggal Mulai
                        </p>

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
                    </div>

                    <div>
                        <p className="mb-1 text-[9px] font-black uppercase text-slate-600">
                            Tanggal Selesai
                        </p>

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
                    </div>

                    <button
                        type="submit"
                        className="h-10 self-end rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120]"
                    >
                        Terapkan
                    </button>

                    <button
                        type="button"
                        onClick={
                            resetFilter
                        }
                        className="h-10 self-end rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white"
                    >
                        Reset
                    </button>
                </form>

                <div className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2.5">
                    <p className="text-[10px] leading-5 text-slate-400">
                        Pendapatan sewa awal mengikuti tanggal mulai transaksi.
                        Pendapatan perpanjangan mengikuti tanggal pembayaran
                        disetujui admin. Pendapatan denda hanya diakui dari
                        transaksi yang selesai.
                    </p>
                </div>

                <section className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
                    <StatCard
                        label="Sewa Awal"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                ringkasan,
                                [
                                    'pendapatan_sewa_awal',
                                    'pendapatan_sewa',
                                ],
                            ),
                        )}`}
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Perpanjangan"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                ringkasan,
                                [
                                    'pendapatan_perpanjangan',
                                ],
                            ),
                        )}`}
                        valueClass="text-violet-300"
                    />

                    <StatCard
                        label="Pendapatan Denda"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                ringkasan,
                                [
                                    'pendapatan_denda',
                                    'total_denda',
                                ],
                            ),
                        )}`}
                        valueClass="text-rose-300"
                    />

                    <StatCard
                        label="Total Pendapatan"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                ringkasan,
                                [
                                    'total_pendapatan',
                                    'pendapatan',
                                ],
                            ),
                        )}`}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Total Transaksi"
                        value={ambilNilai(
                            ringkasan,
                            [
                                'total_transaksi',
                                'transaksi',
                            ],
                            transaksi.length,
                        )}
                    />

                    <StatCard
                        label="Perpanjangan Selesai"
                        value={ambilNilai(
                            ringkasan,
                            [
                                'jumlah_perpanjangan',
                            ],
                            perpanjangan.length,
                        )}
                        valueClass="text-violet-300"
                    />

                    <StatCard
                        label="Transaksi Aktif"
                        value={ambilNilai(
                            ringkasan,
                            [
                                'transaksi_aktif',
                                'aktif',
                            ],
                        )}
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Rata-rata"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                ringkasan,
                                [
                                    'rata_rata_transaksi',
                                    'rata_rata_pendapatan',
                                ],
                            ),
                        )}`}
                    />
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                    <Panel
                        title="Tren Pendapatan"
                        description="Pemisahan pendapatan berdasarkan sumber."
                    >
                        {pendapatanPerBulan.length ===
                        0 ? (
                            <EmptyState
                                icon="Rp"
                                title="Data pendapatan belum tersedia"
                                description="Pilih periode lain atau tambahkan transaksi terlebih dahulu."
                            />
                        ) : (
                            <div className="space-y-4 p-4">
                                {pendapatanPerBulan.map(
                                    (
                                        item,
                                        index,
                                    ) => {
                                        const sewaAwal =
                                            Number(
                                                item
                                                    .pendapatan_sewa_awal ??
                                                    0,
                                            );

                                        const perpanjanganValue =
                                            Number(
                                                item
                                                    .pendapatan_perpanjangan ??
                                                    0,
                                            );

                                        const denda =
                                            Number(
                                                item
                                                    .pendapatan_denda ??
                                                    0,
                                            );

                                        const total =
                                            Number(
                                                item.total ??
                                                    item.total_pendapatan ??
                                                    item.pendapatan ??
                                                    sewaAwal +
                                                        perpanjanganValue +
                                                        denda,
                                            );

                                        const label =
                                            item.label ??
                                            item.bulan ??
                                            `Periode ${index + 1}`;

                                        const widthSewa =
                                            Math.min(
                                                100,
                                                Math.max(
                                                    sewaAwal >
                                                        0
                                                        ? 2
                                                        : 0,
                                                    (sewaAwal /
                                                        maksimumPendapatan) *
                                                        100,
                                                ),
                                            );

                                        const widthPerpanjangan =
                                            Math.min(
                                                100,
                                                Math.max(
                                                    perpanjanganValue >
                                                        0
                                                        ? 2
                                                        : 0,
                                                    (perpanjanganValue /
                                                        maksimumPendapatan) *
                                                        100,
                                                ),
                                            );

                                        const widthDenda =
                                            Math.min(
                                                100,
                                                Math.max(
                                                    denda >
                                                        0
                                                        ? 2
                                                        : 0,
                                                    (denda /
                                                        maksimumPendapatan) *
                                                        100,
                                                ),
                                            );

                                        return (
                                            <article
                                                key={`${label}-${index}`}
                                                className="rounded-lg border border-slate-800 bg-[#0B1120] p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-black text-white">
                                                            {
                                                                label
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            {Number(
                                                                item.jumlah_transaksi ??
                                                                    item.transaksi ??
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
                                                                sewaAwal,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-900">
                                                        <div
                                                            className="h-full rounded-full bg-[#06B6D4]"
                                                            style={{
                                                                width: `${widthSewa}%`,
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
                                                                perpanjanganValue,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-900">
                                                        <div
                                                            className="h-full rounded-full bg-violet-500"
                                                            style={{
                                                                width: `${widthPerpanjangan}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-2">
                                                    <div className="flex justify-between gap-3 text-[9px]">
                                                        <span className="font-bold text-rose-300">
                                                            Denda
                                                        </span>

                                                        <span className="font-black text-slate-300">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                denda,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-900">
                                                        <div
                                                            className="h-full rounded-full bg-rose-500"
                                                            style={{
                                                                width: `${widthDenda}%`,
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
                        title="Distribusi Status"
                        description="Jumlah transaksi berdasarkan status."
                    >
                        {statusTransaksi.length ===
                        0 ? (
                            <EmptyState
                                title="Data status belum tersedia"
                                description="Distribusi transaksi belum dapat ditampilkan."
                            />
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {statusTransaksi.map(
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
                                                    item.count ??
                                                    0}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </Panel>
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <Panel
                        title="Kendaraan Terlaris"
                        description="Peringkat armada dan pendapatan dalam periode."
                    >
                        {kendaraanTerlaris.length ===
                        0 ? (
                            <EmptyState
                                icon="#"
                                title="Belum ada peringkat armada"
                                description="Data kendaraan akan muncul setelah terdapat transaksi."
                            />
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {kendaraanTerlaris.map(
                                    (
                                        item,
                                        index,
                                    ) => (
                                        <article
                                            key={
                                                item.id ??
                                                index
                                            }
                                            className="px-4 py-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#06B6D4]/10 text-xs font-black text-[#06B6D4]">
                                                    {index + 1}
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-black text-white">
                                                        {item.nama_kendaraan ??
                                                            item.nama ??
                                                            '-'}
                                                    </p>

                                                    <p className="mt-0.5 text-[9px] text-slate-600">
                                                        {item.merek ??
                                                            '-'}
                                                        {' · '}
                                                        {item.plat_nomor ??
                                                            '-'}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-xs font-black text-emerald-300">
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        item.pendapatan ??
                                                            item.total_pendapatan ??
                                                            0,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                <div className="rounded-lg bg-[#0B1120] px-2.5 py-2">
                                                    <p className="text-[8px] font-black uppercase text-slate-600">
                                                        Rental
                                                    </p>

                                                    <p className="mt-1 text-[10px] font-bold text-cyan-300">
                                                        {item.total_sewa ??
                                                            item.jumlah_sewa ??
                                                            0}{' '}
                                                        transaksi
                                                    </p>
                                                </div>

                                                <div className="rounded-lg bg-[#0B1120] px-2.5 py-2">
                                                    <p className="text-[8px] font-black uppercase text-slate-600">
                                                        Perpanjangan
                                                    </p>

                                                    <p className="mt-1 text-[10px] font-bold text-violet-300">
                                                        {item.jumlah_perpanjangan ??
                                                            0}{' '}
                                                        proses
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        )}
                    </Panel>

                    <Panel
                        title="Detail Transaksi"
                        description={`${transaksi.length} transaksi berdasarkan tanggal mulai sewa.`}
                    >
                        {transaksi.length ===
                        0 ? (
                            <EmptyState
                                title="Transaksi belum tersedia"
                                description="Tidak ditemukan transaksi pada periode ini."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1200px] text-left">
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

                                            <th className="px-3 py-2.5 text-right">
                                                Sewa Awal
                                            </th>

                                            <th className="px-3 py-2.5 text-right">
                                                Perpanjangan
                                            </th>

                                            <th className="px-3 py-2.5 text-right">
                                                Denda
                                            </th>

                                            <th className="px-3 py-2.5 text-right">
                                                Total Periode
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
                                                    className="align-top hover:bg-[#1E293B]/40"
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
                                                        <p className="max-w-44 truncate text-xs font-bold text-white">
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
                                                        <p className="max-w-44 truncate text-xs font-bold text-white">
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

                                                    <td className="px-3 py-2.5 text-[10px] text-slate-400">
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
                                                                item.pendapatan_perpanjangan ??
                                                                    0,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-600">
                                                            {item.jumlah_perpanjangan ??
                                                                0}{' '}
                                                            proses
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5 text-right text-xs font-black text-rose-300">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            item.pendapatan_denda ??
                                                                0,
                                                        )}
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
                        description="Pembayaran perpanjangan yang disetujui pada periode laporan."
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
                                <table className="w-full min-w-[1100px] text-left">
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
                                                            {item.jumlah_hari_tambahan ??
                                                                0}{' '}
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

LaporanBisnis.layout = (
    page,
) => (
    <OwnerLayout>
        {page}
    </OwnerLayout>
);

export default LaporanBisnis;
