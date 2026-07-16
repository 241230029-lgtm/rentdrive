import {
    EmptyState,
    formatRupiah,
    formatTanggal,
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

function LaporanBisnis(props) {
    const ringkasan =
        props.ringkasan ??
        props.statistik ??
        props.stats ??
        {};

    const filter =
        props.filter ??
        props.filters ??
        props.periode ??
        {};

    const pendapatanPerBulan =
        ambilArray(
            props.pendapatan_per_bulan,
            props.pendapatanBulanan,
            props.pendapatan_bulanan,
            props.tren_pendapatan,
        );

    const statusTransaksi =
        ambilArray(
            props.transaksi_per_status,
            props.status_transaksi,
            props.per_status,
            props.distribusi_status,
        );

    const kendaraanTerlaris =
        ambilArray(
            props.kendaraan_terlaris,
            props.kendaraanTerlaris,
            props.armada_terlaris,
        );

    const transaksi =
        ambilArray(
            props.transaksis,
            props.transaksi,
            props.daftar_transaksi,
            props.riwayat,
            props.bookings,
        );

    const [tanggalMulai, setTanggalMulai] =
        useState(
            filter.tanggal_mulai ??
                filter.start_date ??
                '',
        );

    const [
        tanggalSelesai,
        setTanggalSelesai,
    ] = useState(
        filter.tanggal_selesai ??
            filter.end_date ??
            '',
    );

    const maksimumPendapatan =
        useMemo(() => {
            return Math.max(
                1,
                ...pendapatanPerBulan.map(
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
        }, [pendapatanPerBulan]);

    const terapkanFilter = (event) => {
        event.preventDefault();

        router.get(
            route('owner.laporan_bisnis'),
            {
                tanggal_mulai:
                    tanggalMulai || undefined,

                tanggal_selesai:
                    tanggalSelesai ||
                    undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilter = () => {
        setTanggalMulai('');
        setTanggalSelesai('');

        router.get(
            route('owner.laporan_bisnis'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Laporan Bisnis" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <PageHeader
                    eyebrow="Analisis Keuangan"
                    title="Laporan Bisnis"
                    description="Analisis pendapatan, transaksi, armada, dan performa rental."
                />

                <form
                    onSubmit={terapkanFilter}
                    className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 sm:flex-row sm:items-end"
                >
                    <div className="flex-1 sm:max-w-56">
                        <label
                            htmlFor="tanggal_mulai"
                            className="mb-1 block text-[9px] font-black uppercase tracking-wider text-slate-600"
                        >
                            Tanggal Mulai
                        </label>

                        <input
                            id="tanggal_mulai"
                            type="date"
                            value={tanggalMulai}
                            onChange={(event) =>
                                setTanggalMulai(
                                    event.target
                                        .value,
                                )
                            }
                            className={inputClass}
                        />
                    </div>

                    <div className="flex-1 sm:max-w-56">
                        <label
                            htmlFor="tanggal_selesai"
                            className="mb-1 block text-[9px] font-black uppercase tracking-wider text-slate-600"
                        >
                            Tanggal Selesai
                        </label>

                        <input
                            id="tanggal_selesai"
                            type="date"
                            value={tanggalSelesai}
                            onChange={(event) =>
                                setTanggalSelesai(
                                    event.target
                                        .value,
                                )
                            }
                            className={inputClass}
                        />
                    </div>

                    <button
                        type="submit"
                        className="h-10 rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120]"
                    >
                        Terapkan
                    </button>

                    <button
                        type="button"
                        onClick={resetFilter}
                        className="h-10 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white"
                    >
                        Reset
                    </button>
                </form>

                <section className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        label="Pendapatan Sewa"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                ringkasan,
                                [
                                    'total_pendapatan',
                                    'pendapatan',
                                    'pendapatan_sewa',
                                ],
                            ),
                        )}`}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Pendapatan Denda"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                ringkasan,
                                [
                                    'total_denda',
                                    'pendapatan_denda',
                                    'denda',
                                ],
                            ),
                        )}`}
                        valueClass="text-rose-300"
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
                        label="Transaksi Selesai"
                        value={ambilNilai(
                            ringkasan,
                            [
                                'transaksi_selesai',
                                'selesai',
                            ],
                        )}
                        valueClass="text-emerald-300"
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
                        label="Rata-rata Transaksi"
                        value={`Rp ${formatRupiah(
                            ambilNilai(
                                ringkasan,
                                [
                                    'rata_rata_transaksi',
                                    'rata_rata_pendapatan',
                                    'average_transaction',
                                ],
                            ),
                        )}`}
                    />
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                    <Panel
                        title="Tren Pendapatan"
                        description="Perubahan pendapatan pada setiap periode."
                    >
                        {pendapatanPerBulan.length ===
                        0 ? (
                            <EmptyState
                                icon="▥"
                                title="Data pendapatan belum tersedia"
                                description="Pilih periode lain atau tambahkan transaksi terlebih dahulu."
                            />
                        ) : (
                            <div className="space-y-3 p-4">
                                {pendapatanPerBulan.map(
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
                                            `Periode ${index + 1}`;

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

                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-white">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                nilai,
                                                            )}
                                                        </p>

                                                        {(item.jumlah_transaksi ??
                                                            item.transaksi) !==
                                                            undefined && (
                                                            <p className="text-[8px] text-slate-600">
                                                                {item.jumlah_transaksi ??
                                                                    item.transaksi}{' '}
                                                                transaksi
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#0B1120]">
                                                    <div
                                                        className="h-full rounded-full bg-[#06B6D4]"
                                                        style={{
                                                            width: `${Math.max(
                                                                2,
                                                                (nilai /
                                                                    maksimumPendapatan) *
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

                <section className="mt-3 grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Panel
                        title="Kendaraan Terlaris"
                        description="Peringkat armada dalam periode laporan."
                    >
                        {kendaraanTerlaris.length ===
                        0 ? (
                            <EmptyState
                                icon="◆"
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
                                                        item.kendaraan
                                                            ?.nama_kendaraan ??
                                                        '-'}
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-slate-600">
                                                    {item.total_sewa ??
                                                        item.jumlah_sewa ??
                                                        item.jumlah ??
                                                        0}{' '}
                                                    kali disewa
                                                </p>
                                            </div>

                                            {(item.pendapatan ??
                                                item.total_pendapatan) !==
                                                undefined && (
                                                <p className="shrink-0 text-[10px] font-black text-emerald-300">
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        item.pendapatan ??
                                                            item.total_pendapatan,
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </Panel>

                    <Panel
                        title="Detail Transaksi"
                        description={`${transaksi.length} transaksi pada periode terpilih.`}
                    >
                        {transaksi.length ===
                        0 ? (
                            <EmptyState
                                title="Transaksi belum tersedia"
                                description="Tidak ditemukan transaksi pada periode ini."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[940px] text-left">
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
                                                Nilai Sewa
                                            </th>

                                            <th className="px-3 py-2.5">
                                                Denda
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
                                                    className="hover:bg-[#1E293B]/40"
                                                >
                                                    <td className="px-3 py-2.5 text-xs font-black text-[#06B6D4]">
                                                        {item.nomor_booking ??
                                                            '-'}
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
                                                    </td>

                                                    <td className="px-3 py-2.5">
                                                        <p className="max-w-44 truncate text-xs font-bold text-white">
                                                            {item
                                                                .kendaraan
                                                                ?.nama_kendaraan ??
                                                                '-'}
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-2.5 text-[10px] text-slate-400">
                                                        {formatTanggal(
                                                            item.tanggal_mulai,
                                                        )}{' '}
                                                        —{' '}
                                                        {formatTanggal(
                                                            item.tanggal_selesai,
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-2.5 text-xs font-black text-white">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            item.total_harga,
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-2.5 text-xs font-bold text-rose-300">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            item.total_denda,
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

LaporanBisnis.layout = (page) => (
    <OwnerLayout>
        {page}
    </OwnerLayout>
);

export default LaporanBisnis;
