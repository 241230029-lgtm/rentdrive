import {
    EmptyState,
    formatRupiah,
    formatTanggal,
    formatWaktu,
    inputClass,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
} from '@/Components/AdminCompact';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    useMemo,
    useState,
} from 'react';

function normalisasiData(props) {
    const source =
        props.transaksis ??
        props.riwayat ??
        props.transaksi ??
        props.bookings ??
        [];

    if (Array.isArray(source)) {
        return source;
    }

    if (Array.isArray(source?.data)) {
        return source.data;
    }

    return [];
}

function RiwayatTransaksi(props) {
    const daftar =
        normalisasiData(props);

    const [search, setSearch] =
        useState('');

    const [status, setStatus] =
        useState('');

    const [detail, setDetail] =
        useState(null);

    const filtered = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        return daftar.filter((item) => {
            if (
                status &&
                item.status !== status
            ) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [
                item.nomor_booking,
                item.user?.name,
                item.pelanggan?.name,
                item.kendaraan
                    ?.nama_kendaraan,
                item.kendaraan?.merek,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [daftar, search, status]);

    const summary = useMemo(
        () => ({
            total:
                daftar.length,
            selesai:
                daftar.filter(
                    (item) =>
                        item.status ===
                        'selesai',
                ).length,
            aktif:
                daftar.filter(
                    (item) =>
                        [
                            'disetujui_operasional',
                            'sedang_berlangsung',
                            'menunggu_verifikasi_pengembalian',
                        ].includes(
                            item.status,
                        ),
                ).length,
            ditolak:
                daftar.filter(
                    (item) =>
                        [
                            'ditolak_booking',
                            'ditolak_pembayaran',
                        ].includes(
                            item.status,
                        ),
                ).length,
        }),
        [daftar],
    );

    return (
        <>
            <Head title="Riwayat Transaksi" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <PageHeader
                    eyebrow="Arsip Operasional"
                    title="Riwayat Transaksi"
                    description="Seluruh transaksi rental dalam tampilan tabel padat."
                />

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <StatCard
                        label="Total"
                        value={summary.total}
                    />

                    <StatCard
                        label="Transaksi Aktif"
                        value={summary.aktif}
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Selesai"
                        value={summary.selesai}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Ditolak"
                        value={summary.ditolak}
                        valueClass="text-rose-300"
                    />
                </section>

                <section className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 md:flex-row">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value,
                            )
                        }
                        placeholder="Cari booking, pelanggan, atau kendaraan"
                        className={`${inputClass} flex-1`}
                    />

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(
                                event.target.value,
                            )
                        }
                        className={`${inputClass} md:w-64`}
                    >
                        <option value="">
                            Semua status
                        </option>

                        <option value="disetujui_operasional">
                            Disetujui
                        </option>

                        <option value="sedang_berlangsung">
                            Berlangsung
                        </option>

                        <option value="menunggu_verifikasi_pengembalian">
                            Verifikasi pengembalian
                        </option>

                        <option value="selesai">
                            Selesai
                        </option>

                        <option value="ditolak_booking">
                            Booking ditolak
                        </option>

                        <option value="ditolak_pembayaran">
                            Pembayaran ditolak
                        </option>
                    </select>

                    <div className="flex h-10 items-center rounded-lg border border-slate-800 bg-[#0B1120] px-3 text-xs font-bold text-slate-500">
                        {filtered.length} data
                    </div>
                </section>

                <Panel className="mt-3">
                    {filtered.length === 0 ? (
                        <EmptyState
                            icon="≡"
                            title="Riwayat belum tersedia"
                            description="Data transaksi akan ditampilkan setelah backend mengirim riwayat."
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
                                            Jadwal
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Nilai
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Denda
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Status
                                        </th>

                                        <th className="px-3 py-2.5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800">
                                    {filtered.map(
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

                                                    <p className="mt-0.5 text-[9px] text-slate-600">
                                                        {item
                                                            .kendaraan
                                                            ?.merek ??
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

                                                <td className="px-3 py-2.5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDetail(
                                                                item,
                                                            )
                                                        }
                                                        className="h-8 rounded-lg border border-slate-700 px-3 text-[10px] font-bold text-slate-300 hover:border-[#06B6D4] hover:text-[#06B6D4]"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            </main>

            {detail && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setDetail(null);
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-[#10192B]">
                        <header className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                            <div>
                                <p className="text-[9px] font-black uppercase text-[#06B6D4]">
                                    Detail Transaksi
                                </p>

                                <h2 className="text-lg font-black text-white">
                                    {
                                        detail.nomor_booking
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setDetail(null)
                                }
                                className="h-8 rounded-lg border border-slate-700 px-3 text-xs text-slate-300"
                            >
                                Tutup
                            </button>
                        </header>

                        <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-3">
                            {[
                                [
                                    'Pelanggan',
                                    detail.user
                                        ?.name ??
                                        detail
                                            .pelanggan
                                            ?.name,
                                ],
                                [
                                    'Kendaraan',
                                    detail.kendaraan
                                        ?.nama_kendaraan,
                                ],
                                [
                                    'Mulai',
                                    formatTanggal(
                                        detail.tanggal_mulai,
                                    ),
                                ],
                                [
                                    'Selesai',
                                    formatTanggal(
                                        detail.tanggal_selesai,
                                    ),
                                ],
                                [
                                    'Total Sewa',
                                    `Rp ${formatRupiah(
                                        detail.total_harga,
                                    )}`,
                                ],
                                [
                                    'Total Denda',
                                    `Rp ${formatRupiah(
                                        detail.total_denda,
                                    )}`,
                                ],
                            ].map(
                                ([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border border-slate-800 bg-[#0B1120] p-3"
                                    >
                                        <p className="text-[9px] uppercase text-slate-600">
                                            {label}
                                        </p>

                                        <p className="mt-1 text-xs font-bold text-white">
                                            {value ?? '-'}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

RiwayatTransaksi.layout = (page) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default RiwayatTransaksi;
