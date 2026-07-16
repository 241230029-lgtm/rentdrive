import {
    EmptyState,
    Field,
    FlashMessage,
    formatRupiah,
    formatTanggal,
    inputClass,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
    textareaClass,
} from '@/Components/AdminCompact';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Head,
    useForm,
    usePage,
} from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useState,
} from 'react';

function hitungTerlambat(
    tanggalSelesai,
    tanggalKembali,
) {
    if (
        !tanggalSelesai ||
        !tanggalKembali
    ) {
        return 0;
    }

    const end = new Date(
        `${String(
            tanggalSelesai,
        ).split('T')[0]}T00:00:00`,
    );

    const returned = new Date(
        `${String(
            tanggalKembali,
        ).split('T')[0]}T00:00:00`,
    );

    if (
        Number.isNaN(end.getTime()) ||
        Number.isNaN(returned.getTime()) ||
        returned <= end
    ) {
        return 0;
    }

    return Math.floor(
        (returned - end) / 86400000,
    );
}

function KelolaPengembalian({
    pengembalians = [],
    ringkasan = {},
    tanggal_hari_ini = '',
}) {
    const {
        flash = {},
        errors = {},
    } = usePage().props;

    const daftar = Array.isArray(
        pengembalians,
    )
        ? pengembalians
        : [];

    const [search, setSearch] =
        useState('');

    const [status, setStatus] =
        useState('');

    const [selectedId, setSelectedId] =
        useState(daftar[0]?.id ?? null);

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
                item.pelanggan?.name,
                item.pelanggan?.email,
                item.kendaraan
                    ?.nama_kendaraan,
                item.kendaraan?.merek,
                item.kendaraan?.plat_nomor,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [daftar, search, status]);

    const selected = useMemo(() => {
        return (
            filtered.find(
                (item) =>
                    Number(item.id) ===
                    Number(selectedId),
            ) ??
            filtered[0] ??
            null
        );
    }, [filtered, selectedId]);

    const form = useForm({
        tanggal_kembali_aktual:
            tanggal_hari_ini,
        kondisi_kendaraan_kembali:
            '',
        kilometer_kembali: '',
        denda_kerusakan: 0,
        foto_kondisi_kembali: null,
    });

    useEffect(() => {
        if (!selected) {
            return;
        }

        form.setData({
            tanggal_kembali_aktual:
                selected.tanggal_kembali_aktual ??
                tanggal_hari_ini,
            kondisi_kendaraan_kembali:
                selected.kondisi_kendaraan_kembali ??
                '',
            kilometer_kembali:
                selected.kilometer_kembali ??
                '',
            denda_kerusakan:
                selected.denda_kerusakan ??
                0,
            foto_kondisi_kembali:
                null,
        });

        form.clearErrors();
    }, [
        selected?.id,
        tanggal_hari_ini,
    ]);

    const hariTerlambat = useMemo(
        () =>
            hitungTerlambat(
                selected?.tanggal_selesai,
                form.data
                    .tanggal_kembali_aktual,
            ),
        [
            selected?.tanggal_selesai,
            form.data
                .tanggal_kembali_aktual,
        ],
    );

    const dendaTerlambat =
        hariTerlambat *
        Number(
            selected?.kendaraan
                ?.harga_per_hari ?? 0,
        );

    const dendaKerusakan = Math.max(
        0,
        Number(
            form.data.denda_kerusakan ??
                0,
        ) || 0,
    );

    const totalDenda =
        dendaTerlambat +
        dendaKerusakan;

    const submit = (event) => {
        event.preventDefault();

        if (!selected) {
            return;
        }

        const confirmed =
            window.confirm(
                `Selesaikan pengembalian ${selected.nomor_booking}?`,
            );

        if (!confirmed) {
            return;
        }

        form.post(
            route(
                'admin.pengembalian.proses',
                selected.id,
            ),
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Kelola Pengembalian" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <PageHeader
                    eyebrow="Operasional Rental"
                    title="Kelola Pengembalian"
                    description="Catat kondisi, kilometer, foto, dan denda kendaraan."
                    action={
                        <div className="rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2">
                            <p className="text-[9px] font-black uppercase text-slate-600">
                                Hari ini
                            </p>

                            <p className="text-xs font-bold text-[#06B6D4]">
                                {formatTanggal(
                                    tanggal_hari_ini,
                                )}
                            </p>
                        </div>
                    }
                />

                <FlashMessage
                    flash={flash}
                    errors={errors}
                />

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-5">
                    <StatCard
                        label="Total Aktif"
                        value={ringkasan.total}
                    />

                    <StatCard
                        label="Jatuh Tempo"
                        value={
                            ringkasan.jatuh_tempo_hari_ini
                        }
                        valueClass="text-amber-300"
                    />

                    <StatCard
                        label="Terlambat"
                        value={
                            ringkasan.terlambat
                        }
                        valueClass="text-rose-300"
                    />

                    <StatCard
                        label="Berlangsung"
                        value={
                            ringkasan.sedang_berlangsung
                        }
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Verifikasi"
                        value={
                            ringkasan.menunggu_verifikasi
                        }
                        valueClass="text-indigo-300"
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
                        placeholder="Cari booking, pelanggan, kendaraan, atau plat"
                        className={`${inputClass} flex-1`}
                    />

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(
                                event.target.value,
                            )
                        }
                        className={`${inputClass} md:w-60`}
                    >
                        <option value="">
                            Semua status
                        </option>

                        <option value="disetujui_operasional">
                            Disetujui
                        </option>

                        <option value="sedang_berlangsung">
                            Sedang berlangsung
                        </option>

                        <option value="menunggu_verifikasi_pengembalian">
                            Verifikasi pengembalian
                        </option>
                    </select>

                    <div className="flex h-10 items-center rounded-lg border border-slate-800 bg-[#0B1120] px-3 text-xs font-bold text-slate-500">
                        {filtered.length} data
                    </div>
                </section>

                {filtered.length === 0 ? (
                    <Panel className="mt-3">
                        <EmptyState
                            icon="↩"
                            title="Tidak ada pengembalian"
                            description="Belum ada transaksi yang dapat diproses."
                        />
                    </Panel>
                ) : (
                    <section className="mt-3 grid min-h-[620px] overflow-hidden rounded-xl border border-slate-800 bg-[#10192B] xl:grid-cols-[330px_minmax(0,1fr)]">
                        <aside className="border-b border-slate-800 bg-[#0B1120] xl:border-b-0 xl:border-r">
                            <div className="max-h-[620px] space-y-2 overflow-y-auto p-2">
                                {filtered.map(
                                    (item) => (
                                        <button
                                            key={
                                                item.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                setSelectedId(
                                                    item.id,
                                                )
                                            }
                                            className={`w-full rounded-lg border p-3 text-left ${
                                                Number(
                                                    selected?.id,
                                                ) ===
                                                Number(
                                                    item.id,
                                                )
                                                    ? 'border-[#06B6D4]/50 bg-[#06B6D4]/10'
                                                    : 'border-slate-800 bg-[#10192B] hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-[10px] font-black text-[#06B6D4]">
                                                        {
                                                            item.nomor_booking
                                                        }
                                                    </p>

                                                    <p className="mt-1 truncate text-xs font-black text-white">
                                                        {item
                                                            .kendaraan
                                                            ?.nama_kendaraan ??
                                                            '-'}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                                        {item
                                                            .pelanggan
                                                            ?.name ??
                                                            '-'}
                                                    </p>
                                                </div>

                                                <StatusBadge
                                                    status={
                                                        item.status
                                                    }
                                                />
                                            </div>

                                            <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2">
                                                <p className="text-[9px] text-slate-600">
                                                    Jatuh tempo{' '}
                                                    {formatTanggal(
                                                        item.tanggal_selesai,
                                                    )}
                                                </p>

                                                <p className="text-[9px] font-bold text-slate-500">
                                                    {item
                                                        .kendaraan
                                                        ?.plat_nomor ??
                                                        '-'}
                                                </p>
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        </aside>

                        {selected && (
                            <div className="min-w-0">
                                <header className="flex flex-col gap-2 border-b border-slate-800 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-[10px] font-black text-[#06B6D4]">
                                                {
                                                    selected.nomor_booking
                                                }
                                            </p>

                                            <StatusBadge
                                                status={
                                                    selected.status
                                                }
                                            />
                                        </div>

                                        <h2 className="mt-1 text-lg font-black text-white">
                                            {selected
                                                .kendaraan
                                                ?.nama_kendaraan ??
                                                '-'}
                                        </h2>

                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            {selected
                                                .kendaraan
                                                ?.merek ??
                                                '-'}{' '}
                                            ·{' '}
                                            {selected
                                                .kendaraan
                                                ?.plat_nomor ??
                                                '-'}
                                        </p>
                                    </div>

                                    <p className="text-sm font-black text-white">
                                        Rp{' '}
                                        {formatRupiah(
                                            selected.total_harga,
                                        )}
                                    </p>
                                </header>

                                <div className="space-y-3 p-4">
                                    <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                                        <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                            <p className="text-[9px] uppercase text-slate-600">
                                                Pelanggan
                                            </p>

                                            <p className="mt-1 truncate text-xs font-bold text-white">
                                                {selected
                                                    .pelanggan
                                                    ?.name ??
                                                    '-'}
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                            <p className="text-[9px] uppercase text-slate-600">
                                                Mulai
                                            </p>

                                            <p className="mt-1 text-xs font-bold text-white">
                                                {formatTanggal(
                                                    selected.tanggal_mulai,
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                            <p className="text-[9px] uppercase text-slate-600">
                                                Selesai
                                            </p>

                                            <p className="mt-1 text-xs font-bold text-white">
                                                {formatTanggal(
                                                    selected.tanggal_selesai,
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                            <p className="text-[9px] uppercase text-slate-600">
                                                Terlambat
                                            </p>

                                            <p
                                                className={`mt-1 text-xs font-black ${
                                                    hariTerlambat >
                                                    0
                                                        ? 'text-rose-300'
                                                        : 'text-emerald-300'
                                                }`}
                                            >
                                                {
                                                    hariTerlambat
                                                }{' '}
                                                hari
                                            </p>
                                        </div>
                                    </section>

                                    <form
                                        onSubmit={submit}
                                        className="rounded-xl border border-slate-800 bg-[#0B1120] p-3"
                                    >
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                            <Field
                                                id="tanggal_kembali_aktual"
                                                label="Tanggal Kembali"
                                                required
                                                error={
                                                    form
                                                        .errors
                                                        .tanggal_kembali_aktual
                                                }
                                            >
                                                <input
                                                    id="tanggal_kembali_aktual"
                                                    type="date"
                                                    value={
                                                        form
                                                            .data
                                                            .tanggal_kembali_aktual
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        form.setData(
                                                            'tanggal_kembali_aktual',
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className={
                                                        inputClass
                                                    }
                                                />
                                            </Field>

                                            <Field
                                                id="kilometer_kembali"
                                                label="Kilometer Kembali"
                                                required
                                                error={
                                                    form
                                                        .errors
                                                        .kilometer_kembali
                                                }
                                            >
                                                <input
                                                    id="kilometer_kembali"
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        form
                                                            .data
                                                            .kilometer_kembali
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        form.setData(
                                                            'kilometer_kembali',
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className={
                                                        inputClass
                                                    }
                                                />
                                            </Field>

                                            <Field
                                                id="denda_kerusakan"
                                                label="Denda Kerusakan"
                                                error={
                                                    form
                                                        .errors
                                                        .denda_kerusakan
                                                }
                                            >
                                                <input
                                                    id="denda_kerusakan"
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    value={
                                                        form
                                                            .data
                                                            .denda_kerusakan
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        form.setData(
                                                            'denda_kerusakan',
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className={
                                                        inputClass
                                                    }
                                                />
                                            </Field>

                                            <Field
                                                id="foto_kondisi_kembali"
                                                label="Foto Kondisi"
                                                error={
                                                    form
                                                        .errors
                                                        .foto_kondisi_kembali
                                                }
                                            >
                                                <label
                                                    htmlFor="foto_kondisi_kembali"
                                                    className="flex h-10 cursor-pointer items-center justify-center truncate rounded-lg border border-dashed border-slate-600 px-3 text-[11px] font-bold text-slate-300 hover:border-[#06B6D4]"
                                                >
                                                    {form
                                                        .data
                                                        .foto_kondisi_kembali
                                                        ?.name ??
                                                        'Pilih foto'}
                                                </label>

                                                <input
                                                    id="foto_kondisi_kembali"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        form.setData(
                                                            'foto_kondisi_kembali',
                                                            event
                                                                .target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                            </Field>
                                        </div>

                                        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
                                            <Field
                                                id="kondisi_kendaraan_kembali"
                                                label="Kondisi Kendaraan"
                                                required
                                                error={
                                                    form
                                                        .errors
                                                        .kondisi_kendaraan_kembali
                                                }
                                            >
                                                <textarea
                                                    id="kondisi_kendaraan_kembali"
                                                    rows="4"
                                                    value={
                                                        form
                                                            .data
                                                            .kondisi_kendaraan_kembali
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        form.setData(
                                                            'kondisi_kendaraan_kembali',
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Jelaskan kondisi kendaraan"
                                                    className={
                                                        textareaClass
                                                    }
                                                />
                                            </Field>

                                            <div className="rounded-lg border border-slate-800 bg-[#10192B] p-3">
                                                <p className="text-[10px] font-black uppercase text-slate-500">
                                                    Perhitungan Denda
                                                </p>

                                                <div className="mt-2 space-y-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">
                                                            Keterlambatan
                                                        </span>

                                                        <span className="font-bold text-white">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                dendaTerlambat,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">
                                                            Kerusakan
                                                        </span>

                                                        <span className="font-bold text-white">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                dendaKerusakan,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between border-t border-slate-800 pt-2">
                                                        <span className="font-black text-slate-300">
                                                            Total
                                                        </span>

                                                        <span className="font-black text-[#06B6D4]">
                                                            Rp{' '}
                                                            {formatRupiah(
                                                                totalDenda,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex justify-end border-t border-slate-800 pt-3">
                                            <button
                                                type="submit"
                                                disabled={
                                                    form.processing
                                                }
                                                className="h-9 rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120] disabled:opacity-50"
                                            >
                                                {form.processing
                                                    ? 'Memproses...'
                                                    : 'Selesaikan Pengembalian'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </>
    );
}

KelolaPengembalian.layout = (page) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default KelolaPengembalian;
