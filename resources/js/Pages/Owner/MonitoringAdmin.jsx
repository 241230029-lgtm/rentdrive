import {
    EmptyState,
    formatWaktu,
    inputClass,
    PageHeader,
    Panel,
    StatCard,
} from '@/Components/AdminCompact';
import OwnerLayout from '@/Layouts/OwnerLayout';
import { Head } from '@inertiajs/react';
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

function namaAdmin(item) {
    return (
        item?.user?.name ??
        item?.admin?.name ??
        item?.pelaku?.name ??
        item?.nama_admin ??
        'Administrator'
    );
}

function emailAdmin(item) {
    return (
        item?.user?.email ??
        item?.admin?.email ??
        item?.pelaku?.email ??
        item?.email_admin ??
        '-'
    );
}

function tanggalHariIni(value) {
    if (!value) {
        return false;
    }

    const tanggal = new Date(value);
    const sekarang = new Date();

    if (
        Number.isNaN(tanggal.getTime())
    ) {
        return false;
    }

    return (
        tanggal.getFullYear() ===
            sekarang.getFullYear() &&
        tanggal.getMonth() ===
            sekarang.getMonth() &&
        tanggal.getDate() ===
            sekarang.getDate()
    );
}

function MonitoringAdmin(props) {
    const aktivitas = ambilArray(
        props.aktivitas,
        props.logs,
        props.log_aktivitas,
        props.aktivitas_admin,
        props.aktivitasAdmin,
    );

    const admins = ambilArray(
        props.admins,
        props.daftar_admin,
        props.administrators,
    );

    const [pencarian, setPencarian] =
        useState('');

    const [
        filterAdmin,
        setFilterAdmin,
    ] = useState('');

    const [
        detailAktivitas,
        setDetailAktivitas,
    ] = useState(null);

    const namaAdminUnik = useMemo(() => {
        return [
            ...new Set(
                aktivitas
                    .map((item) =>
                        namaAdmin(item),
                    )
                    .filter(Boolean),
            ),
        ].sort();
    }, [aktivitas]);

    const hasilFilter = useMemo(() => {
        const keyword = pencarian
            .trim()
            .toLowerCase();

        return aktivitas.filter(
            (item) => {
                const nama =
                    namaAdmin(item);

                if (
                    filterAdmin &&
                    nama !== filterAdmin
                ) {
                    return false;
                }

                if (!keyword) {
                    return true;
                }

                const teks = [
                    nama,
                    emailAdmin(item),
                    item.jenis_aktivitas,
                    item.jenis,
                    item.aksi,
                    item.deskripsi,
                    item.keterangan,
                    item.alamat_ip,
                    item.ip_address,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return teks.includes(keyword);
            },
        );
    }, [
        aktivitas,
        pencarian,
        filterAdmin,
    ]);

    const aktivitasHariIni =
        useMemo(() => {
            return aktivitas.filter(
                (item) =>
                    tanggalHariIni(
                        item.created_at,
                    ),
            ).length;
        }, [aktivitas]);

    const adminAktif =
        admins.length > 0
            ? admins.length
            : namaAdminUnik.length;

    return (
        <>
            <Head title="Monitoring Admin" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <PageHeader
                    eyebrow="Audit Operasional"
                    title="Monitoring Admin"
                    description="Pantau tindakan administrator, waktu aktivitas, dan alamat IP."
                />

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Aktivitas"
                        value={aktivitas.length}
                    />

                    <StatCard
                        label="Aktivitas Hari Ini"
                        value={aktivitasHariIni}
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Admin Terdeteksi"
                        value={adminAktif}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Hasil Filter"
                        value={hasilFilter.length}
                    />
                </section>

                <section className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 md:flex-row">
                    <input
                        type="search"
                        value={pencarian}
                        onChange={(event) =>
                            setPencarian(
                                event.target.value,
                            )
                        }
                        placeholder="Cari admin, aktivitas, keterangan, atau alamat IP"
                        className={`${inputClass} flex-1`}
                    />

                    <select
                        value={filterAdmin}
                        onChange={(event) =>
                            setFilterAdmin(
                                event.target.value,
                            )
                        }
                        className={`${inputClass} md:w-60`}
                    >
                        <option value="">
                            Semua administrator
                        </option>

                        {namaAdminUnik.map(
                            (nama) => (
                                <option
                                    key={nama}
                                    value={nama}
                                >
                                    {nama}
                                </option>
                            ),
                        )}
                    </select>

                    <button
                        type="button"
                        onClick={() => {
                            setPencarian('');
                            setFilterAdmin('');
                        }}
                        className="h-10 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white"
                    >
                        Reset
                    </button>
                </section>

                <Panel
                    title="Log Aktivitas Administrator"
                    description={`${hasilFilter.length} aktivitas ditampilkan.`}
                    className="mt-3"
                >
                    {hasilFilter.length ===
                    0 ? (
                        <EmptyState
                            icon="◎"
                            title="Aktivitas tidak ditemukan"
                            description="Belum ada aktivitas atau pencarian tidak sesuai."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-left">
                                <thead className="border-b border-slate-800 bg-[#0B1120] text-[9px] font-black uppercase tracking-wider text-slate-600">
                                    <tr>
                                        <th className="px-3 py-2.5">
                                            Waktu
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Administrator
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Jenis Aktivitas
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Keterangan
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Alamat IP
                                        </th>

                                        <th className="px-3 py-2.5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800">
                                    {hasilFilter.map(
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
                                                <td className="whitespace-nowrap px-3 py-2.5">
                                                    <p className="text-[10px] font-bold text-slate-400">
                                                        {formatWaktu(
                                                            item.created_at,
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <p className="max-w-48 truncate text-xs font-black text-white">
                                                        {namaAdmin(
                                                            item,
                                                        )}
                                                    </p>

                                                    <p className="mt-0.5 max-w-48 truncate text-[9px] text-slate-600">
                                                        {emailAdmin(
                                                            item,
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <span className="inline-flex rounded-full border border-[#06B6D4]/20 bg-[#06B6D4]/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-[#06B6D4]">
                                                        {item.jenis_aktivitas ??
                                                            item.jenis ??
                                                            item.aksi ??
                                                            'Aktivitas'}
                                                    </span>
                                                </td>

                                                <td className="max-w-md px-3 py-2.5">
                                                    <p className="line-clamp-2 text-[11px] leading-5 text-slate-400">
                                                        {item.deskripsi ??
                                                            item.keterangan ??
                                                            '-'}
                                                    </p>
                                                </td>

                                                <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">
                                                    {item.alamat_ip ??
                                                        item.ip_address ??
                                                        '-'}
                                                </td>

                                                <td className="px-3 py-2.5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDetailAktivitas(
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

            {detailAktivitas && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setDetailAktivitas(
                                null,
                            );
                        }
                    }}
                >
                    <section className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-700 bg-[#10192B] shadow-2xl">
                        <header className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                    Detail Aktivitas
                                </p>

                                <h2 className="mt-0.5 text-lg font-black text-white">
                                    {detailAktivitas.jenis_aktivitas ??
                                        detailAktivitas.jenis ??
                                        detailAktivitas.aksi ??
                                        'Aktivitas Admin'}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setDetailAktivitas(
                                        null,
                                    )
                                }
                                className="h-8 rounded-lg border border-slate-700 px-3 text-xs font-bold text-slate-300"
                            >
                                Tutup
                            </button>
                        </header>

                        <div className="space-y-3 p-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                    <p className="text-[9px] font-black uppercase text-slate-600">
                                        Administrator
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-white">
                                        {namaAdmin(
                                            detailAktivitas,
                                        )}
                                    </p>

                                    <p className="mt-0.5 truncate text-[9px] text-slate-600">
                                        {emailAdmin(
                                            detailAktivitas,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                    <p className="text-[9px] font-black uppercase text-slate-600">
                                        Waktu
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-white">
                                        {formatWaktu(
                                            detailAktivitas.created_at,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                    <p className="text-[9px] font-black uppercase text-slate-600">
                                        Alamat IP
                                    </p>

                                    <p className="mt-1 font-mono text-xs font-bold text-white">
                                        {detailAktivitas.alamat_ip ??
                                            detailAktivitas.ip_address ??
                                            '-'}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                    <p className="text-[9px] font-black uppercase text-slate-600">
                                        ID Aktivitas
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-white">
                                        {detailAktivitas.id ??
                                            '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                    Deskripsi
                                </p>

                                <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-300">
                                    {detailAktivitas.deskripsi ??
                                        detailAktivitas.keterangan ??
                                        '-'}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}

MonitoringAdmin.layout = (page) => (
    <OwnerLayout>
        {page}
    </OwnerLayout>
);

export default MonitoringAdmin;
