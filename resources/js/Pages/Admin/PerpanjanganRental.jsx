import AdminLayout from '@/Layouts/AdminLayout';
import {
    Head,
    router,
    usePage,
} from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useState,
} from 'react';

const STATUS = {
    menunggu_persetujuan: {
        label: 'Menunggu Persetujuan',
        className:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
        description:
            'Pengajuan perpanjangan belum diputuskan admin.',
    },

    menunggu_pembayaran: {
        label: 'Menunggu Pembayaran',
        className:
            'border-violet-500/30 bg-violet-500/10 text-violet-300',
        description:
            'Pengajuan disetujui dan pelanggan belum mengirim pembayaran.',
    },

    menunggu_verifikasi_pembayaran: {
        label: 'Menunggu Verifikasi Pembayaran',
        className:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        description:
            'Pelanggan sudah mengirim bukti pembayaran biaya tambahan.',
    },

    pembayaran_ditolak: {
        label: 'Pembayaran Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        description:
            'Pelanggan perlu mengirim ulang bukti pembayaran.',
    },

    selesai: {
        label: 'Selesai',
        className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        description:
            'Pembayaran disetujui dan tanggal baru telah diterapkan.',
    },

    ditolak: {
        label: 'Pengajuan Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        description:
            'Pengajuan awal perpanjangan telah ditolak.',
    },

    disetujui: {
        label: 'Menunggu Pembayaran',
        className:
            'border-violet-500/30 bg-violet-500/10 text-violet-300',
        description:
            'Status lama yang menunggu pembayaran pelanggan.',
    },
};

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-xs font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10';

const textareaClass =
    'w-full resize-none rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-xs font-semibold leading-5 text-white outline-none transition placeholder:text-slate-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/10';

function formatRupiah(value) {
    return Number(
        value ?? 0,
    ).toLocaleString('id-ID');
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

function Badge({
    status,
}) {
    const info =
        STATUS[status] ?? {
            label:
                String(
                    status ?? '-',
                ).replaceAll(
                    '_',
                    ' ',
                ),

            className:
                'border-slate-600 bg-slate-800 text-slate-300',
        };

    return (
        <span
            className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-center text-[8px] font-black uppercase tracking-wider ${info.className}`}
        >
            {info.label}
        </span>
    );
}

function StatCard({
    label,
    value,
    valueClass = 'text-white',
}) {
    return (
        <article className="rounded-xl border border-slate-800 bg-[#10192B] px-3 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                {label}
            </p>

            <p
                className={`mt-1 text-xl font-black ${valueClass}`}
            >
                {value}
            </p>
        </article>
    );
}

function InfoItem({
    label,
    value,
    valueClass = 'text-white',
}) {
    return (
        <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                {label}
            </p>

            <p
                className={`mt-1 break-words text-xs font-bold leading-5 ${valueClass}`}
            >
                {value ?? '-'}
            </p>
        </div>
    );
}

function ModalBukti({
    data,
    onClose,
}) {
    const [
        gagal,
        setGagal,
    ] = useState(false);

    useEffect(() => {
        if (!data) {
            return undefined;
        }

        setGagal(false);

        const handleKeyDown = (
            event,
        ) => {
            if (
                event.key ===
                'Escape'
            ) {
                onClose();
            }
        };

        const overflowLama =
            document.body.style.overflow;

        document.body.style.overflow =
            'hidden';

        window.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                overflowLama;

            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, [
        data,
        onClose,
    ]);

    if (!data) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onMouseDown={(
                event,
            ) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <section className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#10192B] shadow-2xl">
                <header className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                            Dokumen Pembayaran
                        </p>

                        <h2 className="mt-1 text-sm font-black text-white">
                            Bukti Pembayaran Perpanjangan
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-xl text-slate-400 transition hover:border-rose-400 hover:text-rose-300"
                    >
                        ×
                    </button>
                </header>

                <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#050914] p-4">
                    {!gagal ? (
                        <img
                            src={data.url}
                            alt="Bukti pembayaran perpanjangan"
                            onError={() =>
                                setGagal(true)
                            }
                            className="max-h-[76vh] max-w-full rounded-lg object-contain"
                        />
                    ) : (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-5 text-center">
                            <p className="text-sm font-black text-rose-300">
                                Bukti pembayaran gagal dimuat
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Pastikan file masih tersedia pada penyimpanan.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="flex justify-end border-t border-slate-700 px-4 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-lg bg-[#06B6D4] px-5 text-xs font-black text-[#0B1120]"
                    >
                        Tutup
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default function PerpanjanganRental({
    daftarPerpanjangan = [],
    ringkasan = {},
    perpanjanganTerpilih = null,
}) {
    const {
        flash = {},
        errors = {},
    } = usePage().props;

    const daftar =
        Array.isArray(
            daftarPerpanjangan,
        )
            ? daftarPerpanjangan
            : [];

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        filterStatus,
        setFilterStatus,
    ] = useState('');

    const [
        selectedId,
        setSelectedId,
    ] = useState(
        perpanjanganTerpilih ??
            daftar[0]?.id ??
            null,
    );

    const [
        alasanPenolakan,
        setAlasanPenolakan,
    ] = useState('');

    const [
        alasanPenolakanPembayaran,
        setAlasanPenolakanPembayaran,
    ] = useState('');

    const [
        processing,
        setProcessing,
    ] = useState(false);

    const [
        modalBukti,
        setModalBukti,
    ] = useState(null);

    const filtered =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            return daftar.filter(
                (item) => {
                    if (
                        filterStatus &&
                        item.status !==
                            filterStatus
                    ) {
                        return false;
                    }

                    if (!keyword) {
                        return true;
                    }

                    return [
                        item.sewa
                            ?.nomor_booking,
                        item.sewa
                            ?.pelanggan
                            ?.name,
                        item.sewa
                            ?.pelanggan
                            ?.email,
                        item.sewa
                            ?.kendaraan
                            ?.nama_kendaraan,
                        item.status,
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()
                        .includes(
                            keyword,
                        );
                },
            );
        }, [
            daftar,
            search,
            filterStatus,
        ]);

    const selected =
        useMemo(() => {
            return (
                filtered.find(
                    (item) =>
                        Number(
                            item.id,
                        ) ===
                        Number(
                            selectedId,
                        ),
                ) ??
                filtered[0] ??
                null
            );
        }, [
            filtered,
            selectedId,
        ]);

    useEffect(() => {
        if (
            !perpanjanganTerpilih
        ) {
            return;
        }

        const ditemukan =
            daftar.find(
                (item) =>
                    Number(
                        item.id,
                    ) ===
                    Number(
                        perpanjanganTerpilih,
                    ),
            );

        if (ditemukan) {
            setSelectedId(
                ditemukan.id,
            );
        }
    }, [
        daftar,
        perpanjanganTerpilih,
    ]);

    useEffect(() => {
        if (
            !selected &&
            filtered[0]
        ) {
            setSelectedId(
                filtered[0].id,
            );
        }
    }, [
        filtered,
        selected,
    ]);

    useEffect(() => {
        setAlasanPenolakan('');
        setAlasanPenolakanPembayaran('');
    }, [selected?.id]);

    const daftarError =
        Object.values(
            errors ?? {},
        ).flat();

    const prosesPengajuan = (
        aksi,
    ) => {
        if (
            !selected ||
            processing ||
            !selected.boleh_diverifikasi
        ) {
            return;
        }

        if (
            aksi === 'tolak' &&
            alasanPenolakan
                .trim()
                .length < 10
        ) {
            window.alert(
                'Alasan penolakan minimal 10 karakter.',
            );

            return;
        }

        const pesan =
            aksi === 'setujui'
                ? `Setujui pengajuan perpanjangan booking ${selected.sewa?.nomor_booking}? Pelanggan akan diarahkan ke pembayaran Rp ${formatRupiah(selected.biaya_tambahan)}.`
                : `Tolak pengajuan perpanjangan booking ${selected.sewa?.nomor_booking}?`;

        if (
            !window.confirm(pesan)
        ) {
            return;
        }

        setProcessing(true);

        router.post(
            route(
                'admin.perpanjangan.verifikasi',
                selected.id,
            ),
            {
                aksi,

                alasan_penolakan:
                    aksi === 'tolak'
                        ? alasanPenolakan.trim()
                        : null,
            },
            {
                preserveScroll: true,

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const prosesPembayaran = (
        aksi,
    ) => {
        if (
            !selected ||
            processing ||
            !selected
                .boleh_verifikasi_pembayaran
        ) {
            return;
        }

        if (
            aksi === 'tolak' &&
            alasanPenolakanPembayaran
                .trim()
                .length < 10
        ) {
            window.alert(
                'Alasan penolakan pembayaran minimal 10 karakter.',
            );

            return;
        }

        const pesan =
            aksi === 'setujui'
                ? `Setujui pembayaran Rp ${formatRupiah(selected.biaya_tambahan)}? Tanggal selesai akan berubah menjadi ${formatTanggal(selected.tanggal_selesai_baru)}.`
                : `Tolak pembayaran perpanjangan booking ${selected.sewa?.nomor_booking}?`;

        if (
            !window.confirm(pesan)
        ) {
            return;
        }

        setProcessing(true);

        router.post(
            route(
                'admin.perpanjangan.verifikasi-pembayaran',
                selected.id,
            ),
            {
                aksi,

                alasan_penolakan_pembayaran:
                    aksi === 'tolak'
                        ? alasanPenolakanPembayaran.trim()
                        : null,
            },
            {
                preserveScroll: true,

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const statusInfo =
        selected
            ? STATUS[
                  selected.status
              ] ?? null
            : null;

    return (
        <>
            <Head title="Perpanjangan Rental" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <header>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                        Operasional Rental
                    </p>

                    <h1 className="mt-1 text-2xl font-black text-white">
                        Perpanjangan Rental
                    </h1>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                        Periksa pengajuan, pembayaran
                        biaya tambahan, dan penerapan
                        tanggal selesai baru.
                    </p>
                </header>

                {flash?.success && (
                    <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-300">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
                        {flash.error}
                    </div>
                )}

                {daftarError.length >
                    0 && (
                    <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                        {daftarError.map(
                            (
                                error,
                                index,
                            ) => (
                                <p
                                    key={`${error}-${index}`}
                                    className="text-xs leading-5 text-rose-300"
                                >
                                    {error}
                                </p>
                            ),
                        )}
                    </div>
                )}

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-6">
                    <StatCard
                        label="Total"
                        value={Number(
                            ringkasan.total ??
                                0,
                        )}
                    />

                    <StatCard
                        label="Pengajuan"
                        value={Number(
                            ringkasan
                                .menunggu_persetujuan ??
                                0,
                        )}
                        valueClass="text-amber-300"
                    />

                    <StatCard
                        label="Menunggu Bayar"
                        value={Number(
                            ringkasan
                                .menunggu_pembayaran ??
                                0,
                        )}
                        valueClass="text-violet-300"
                    />

                    <StatCard
                        label="Verifikasi Bayar"
                        value={Number(
                            ringkasan
                                .menunggu_verifikasi_pembayaran ??
                                0,
                        )}
                        valueClass="text-sky-300"
                    />

                    <StatCard
                        label="Selesai"
                        value={Number(
                            ringkasan.selesai ??
                                0,
                        )}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Nominal Proses"
                        value={`Rp ${formatRupiah(
                            ringkasan
                                .nominal_menunggu,
                        )}`}
                        valueClass="text-[#06B6D4]"
                    />
                </section>

                <section className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 md:flex-row">
                    <input
                        type="search"
                        value={search}
                        onChange={(
                            event,
                        ) =>
                            setSearch(
                                event.target.value,
                            )
                        }
                        placeholder="Cari booking, pelanggan, atau kendaraan"
                        className={`${inputClass} flex-1`}
                    />

                    <select
                        value={filterStatus}
                        onChange={(
                            event,
                        ) =>
                            setFilterStatus(
                                event.target.value,
                            )
                        }
                        className={`${inputClass} md:w-72`}
                    >
                        <option value="">
                            Semua status
                        </option>

                        {Object.entries(
                            STATUS,
                        ).map(
                            ([
                                value,
                                info,
                            ]) => (
                                <option
                                    key={
                                        value
                                    }
                                    value={
                                        value
                                    }
                                >
                                    {
                                        info.label
                                    }
                                </option>
                            ),
                        )}
                    </select>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch('');
                            setFilterStatus('');
                        }}
                        className="h-10 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-400 transition hover:border-slate-500 hover:text-white"
                    >
                        Reset
                    </button>
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <aside className="h-fit overflow-hidden rounded-xl border border-slate-800 bg-[#10192B]">
                        <header className="border-b border-slate-800 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                Daftar Pengajuan
                            </p>

                            <h2 className="mt-1 text-sm font-black text-white">
                                Perpanjangan Rental
                            </h2>
                        </header>

                        {filtered.length ===
                        0 ? (
                            <div className="flex min-h-56 items-center justify-center px-5 text-center text-xs text-slate-500">
                                Data perpanjangan tidak ditemukan.
                            </div>
                        ) : (
                            <div className="max-h-[720px] divide-y divide-slate-800 overflow-y-auto">
                                {filtered.map(
                                    (item) => {
                                        const aktif =
                                            Number(
                                                item.id,
                                            ) ===
                                            Number(
                                                selected
                                                    ?.id,
                                            );

                                        return (
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
                                                className={`w-full px-4 py-3 text-left transition ${
                                                    aktif
                                                        ? 'bg-[#06B6D4]/10'
                                                        : 'hover:bg-white/[0.025]'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-black text-white">
                                                            {item
                                                                .sewa
                                                                ?.nomor_booking ??
                                                                '-'}
                                                        </p>

                                                        <p className="mt-1 truncate text-[10px] text-slate-500">
                                                            {item
                                                                .sewa
                                                                ?.pelanggan
                                                                ?.name ??
                                                                '-'}
                                                        </p>
                                                    </div>

                                                    <div className="max-w-36">
                                                        <Badge
                                                            status={
                                                                item.status
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <p className="mt-2 truncate text-[10px] text-slate-500">
                                                    {item
                                                        .sewa
                                                        ?.kendaraan
                                                        ?.nama_kendaraan ??
                                                        '-'}
                                                </p>

                                                <div className="mt-2 flex items-end justify-between gap-2">
                                                    <p className="text-sm font-black text-violet-300">
                                                        +
                                                        {
                                                            item.jumlah_hari_tambahan
                                                        }{' '}
                                                        hari
                                                    </p>

                                                    <p className="text-xs font-black text-[#06B6D4]">
                                                        Rp{' '}
                                                        {formatRupiah(
                                                            item.biaya_tambahan,
                                                        )}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </aside>

                    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-[#10192B]">
                        {!selected ? (
                            <div className="flex min-h-64 items-center justify-center text-xs text-slate-500">
                                Pilih data perpanjangan.
                            </div>
                        ) : (
                            <>
                                <header className="flex flex-col gap-2 border-b border-slate-800 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                            Detail Perpanjangan
                                        </p>

                                        <h2 className="mt-1 text-base font-black text-white">
                                            {selected
                                                .sewa
                                                ?.nomor_booking ??
                                                '-'}
                                        </h2>

                                        <p className="mt-1 text-[10px] text-slate-500">
                                            Diajukan{' '}
                                            {formatWaktu(
                                                selected.diajukan_pada,
                                            )}
                                        </p>
                                    </div>

                                    <Badge
                                        status={
                                            selected.status
                                        }
                                    />
                                </header>

                                <div className="p-4">
                                    {statusInfo
                                        ?.description && (
                                        <div className="mb-3 rounded-lg border border-slate-800 bg-[#0B1120] px-3 py-2.5 text-xs leading-5 text-slate-400">
                                            {
                                                statusInfo.description
                                            }
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                                        <InfoItem
                                            label="Pelanggan"
                                            value={
                                                selected
                                                    .sewa
                                                    ?.pelanggan
                                                    ?.name
                                            }
                                        />

                                        <InfoItem
                                            label="Email"
                                            value={
                                                selected
                                                    .sewa
                                                    ?.pelanggan
                                                    ?.email
                                            }
                                        />

                                        <InfoItem
                                            label="Telepon"
                                            value={
                                                selected
                                                    .sewa
                                                    ?.pelanggan
                                                    ?.no_telepon
                                            }
                                        />

                                        <InfoItem
                                            label="Kendaraan"
                                            value={
                                                selected
                                                    .sewa
                                                    ?.kendaraan
                                                    ?.nama_kendaraan
                                            }
                                        />

                                        <InfoItem
                                            label="Tanggal Mulai"
                                            value={formatTanggal(
                                                selected
                                                    .sewa
                                                    ?.tanggal_mulai,
                                            )}
                                        />

                                        <InfoItem
                                            label="Selesai Lama"
                                            value={formatTanggal(
                                                selected
                                                    .tanggal_selesai_lama,
                                            )}
                                        />

                                        <InfoItem
                                            label="Selesai Baru"
                                            value={formatTanggal(
                                                selected
                                                    .tanggal_selesai_baru,
                                            )}
                                            valueClass="text-violet-300"
                                        />

                                        <InfoItem
                                            label="Tambahan Durasi"
                                            value={`${Number(
                                                selected
                                                    .jumlah_hari_tambahan ??
                                                    0,
                                            )} hari`}
                                            valueClass="text-violet-300"
                                        />
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                                        <InfoItem
                                            label="Harga per Hari"
                                            value={`Rp ${formatRupiah(
                                                selected
                                                    .harga_per_hari,
                                            )}`}
                                        />

                                        <InfoItem
                                            label="Biaya Tambahan"
                                            value={`Rp ${formatRupiah(
                                                selected
                                                    .biaya_tambahan,
                                            )}`}
                                            valueClass="text-[#06B6D4]"
                                        />

                                        <InfoItem
                                            label="Total Saat Ini"
                                            value={`Rp ${formatRupiah(
                                                selected
                                                    .sewa
                                                    ?.total_harga,
                                            )}`}
                                        />

                                        <InfoItem
                                            label="Estimasi Total Baru"
                                            value={`Rp ${formatRupiah(
                                                selected
                                                    .sewa
                                                    ?.estimasi_total_baru,
                                            )}`}
                                            valueClass="text-emerald-300"
                                        />
                                    </div>

                                    <div className="mt-3 rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                            Alasan Pengajuan
                                        </p>

                                        <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-300">
                                            {selected
                                                .alasan_pengajuan ||
                                                '-'}
                                        </p>
                                    </div>

                                    {selected
                                        .alasan_penolakan && (
                                        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                                Alasan Pengajuan Ditolak
                                            </p>

                                            <p className="mt-2 whitespace-pre-line text-xs leading-5 text-rose-100/80">
                                                {
                                                    selected
                                                        .alasan_penolakan
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {selected
                                        .alasan_penolakan_pembayaran && (
                                        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                                Alasan Pembayaran Ditolak
                                            </p>

                                            <p className="mt-2 whitespace-pre-line text-xs leading-5 text-rose-100/80">
                                                {
                                                    selected
                                                        .alasan_penolakan_pembayaran
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {selected.boleh_diverifikasi && (
                                        <section className="mt-4 border-t border-slate-800 pt-4">
                                            <p className="text-sm font-black text-white">
                                                Keputusan Pengajuan
                                            </p>

                                            <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                                Persetujuan ini belum menerapkan tanggal baru. Pelanggan masih harus membayar.
                                            </p>

                                            <textarea
                                                rows="3"
                                                value={
                                                    alasanPenolakan
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setAlasanPenolakan(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Alasan penolakan, minimal 10 karakter."
                                                className={`mt-3 ${textareaClass}`}
                                            />

                                            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        processing
                                                    }
                                                    onClick={() =>
                                                        prosesPengajuan(
                                                            'tolak',
                                                        )
                                                    }
                                                    className="h-10 rounded-lg border border-rose-500/40 bg-rose-500/10 px-5 text-xs font-black text-rose-300 disabled:opacity-50"
                                                >
                                                    Tolak Pengajuan
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        processing
                                                    }
                                                    onClick={() =>
                                                        prosesPengajuan(
                                                            'setujui',
                                                        )
                                                    }
                                                    className="h-10 rounded-lg bg-[#06B6D4] px-5 text-xs font-black text-[#0B1120] disabled:opacity-50"
                                                >
                                                    Setujui Pengajuan
                                                </button>
                                            </div>
                                        </section>
                                    )}

                                    {selected
                                        .boleh_verifikasi_pembayaran && (
                                        <section className="mt-4 overflow-hidden rounded-xl border border-sky-500/30 bg-sky-500/5">
                                            <header className="border-b border-sky-500/20 px-4 py-3">
                                                <p className="text-[9px] font-black uppercase tracking-wider text-sky-300">
                                                    Verifikasi Pembayaran
                                                </p>

                                                <h3 className="mt-1 text-sm font-black text-white">
                                                    Pembayaran Rp{' '}
                                                    {formatRupiah(
                                                        selected.biaya_tambahan,
                                                    )}
                                                </h3>

                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    Dikirim{' '}
                                                    {formatWaktu(
                                                        selected.dibayar_pada,
                                                    )}
                                                </p>
                                            </header>

                                            <div className="p-4">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <InfoItem
                                                        label="Metode Pembayaran"
                                                        value={
                                                            selected.metode_pembayaran ===
                                                            'transfer'
                                                                ? 'Transfer'
                                                                : selected.metode_pembayaran ??
                                                                  '-'
                                                        }
                                                    />

                                                    <InfoItem
                                                        label="Nominal"
                                                        value={`Rp ${formatRupiah(
                                                            selected.biaya_tambahan,
                                                        )}`}
                                                        valueClass="text-sky-300"
                                                    />
                                                </div>

                                                {selected
                                                    .bukti_pembayaran_tersedia ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setModalBukti({
                                                                url:
                                                                    selected.url_bukti_pembayaran,
                                                            })
                                                        }
                                                        className="mt-3 h-10 w-full rounded-lg border border-sky-500/40 bg-sky-500/10 px-5 text-xs font-black text-sky-300 transition hover:bg-sky-500/20"
                                                    >
                                                        Lihat Bukti Pembayaran
                                                    </button>
                                                ) : (
                                                    <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300">
                                                        File bukti pembayaran tidak tersedia.
                                                    </div>
                                                )}

                                                <textarea
                                                    rows="3"
                                                    value={
                                                        alasanPenolakanPembayaran
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        setAlasanPenolakanPembayaran(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Alasan penolakan pembayaran, minimal 10 karakter."
                                                    className={`mt-3 ${textareaClass}`}
                                                />

                                                <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            processing
                                                        }
                                                        onClick={() =>
                                                            prosesPembayaran(
                                                                'tolak',
                                                            )
                                                        }
                                                        className="h-10 rounded-lg border border-rose-500/40 bg-rose-500/10 px-5 text-xs font-black text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                                                    >
                                                        Tolak Pembayaran
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            processing ||
                                                            !selected
                                                                .bukti_pembayaran_tersedia
                                                        }
                                                        onClick={() =>
                                                            prosesPembayaran(
                                                                'setujui',
                                                            )
                                                        }
                                                        className="h-10 rounded-lg bg-emerald-500 px-5 text-xs font-black text-white transition hover:bg-emerald-400 disabled:opacity-50"
                                                    >
                                                        Setujui Pembayaran
                                                    </button>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {!selected.boleh_diverifikasi &&
                                        !selected
                                            .boleh_verifikasi_pembayaran && (
                                            <section className="mt-4 rounded-lg border border-slate-800 bg-[#0B1120] px-4 py-3">
                                                {selected.status ===
                                                    'menunggu_pembayaran' && (
                                                    <>
                                                        <p className="text-xs font-black text-violet-300">
                                                            Menunggu Pembayaran Pelanggan
                                                        </p>

                                                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                                            Pelanggan belum mengirim bukti pembayaran sebesar Rp{' '}
                                                            {formatRupiah(
                                                                selected.biaya_tambahan,
                                                            )}
                                                            .
                                                        </p>
                                                    </>
                                                )}

                                                {selected.status ===
                                                    'pembayaran_ditolak' && (
                                                    <>
                                                        <p className="text-xs font-black text-rose-300">
                                                            Menunggu Pengiriman Ulang
                                                        </p>

                                                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                                            Pembayaran telah ditolak dan pelanggan dapat mengirim bukti baru.
                                                        </p>
                                                    </>
                                                )}

                                                {selected.status ===
                                                    'selesai' && (
                                                    <>
                                                        <p className="text-xs font-black text-emerald-300">
                                                            Perpanjangan Telah Selesai
                                                        </p>

                                                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                                            Pembayaran disetujui pada{' '}
                                                            {formatWaktu(
                                                                selected.pembayaran_diperiksa_pada,
                                                            )}
                                                            . Tanggal baru telah diterapkan.
                                                        </p>
                                                    </>
                                                )}

                                                {selected.status ===
                                                    'ditolak' && (
                                                    <>
                                                        <p className="text-xs font-black text-rose-300">
                                                            Pengajuan Ditolak
                                                        </p>

                                                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                                            Pengajuan awal tidak dilanjutkan ke pembayaran.
                                                        </p>
                                                    </>
                                                )}
                                            </section>
                                        )}
                                </div>
                            </>
                        )}
                    </section>
                </section>
            </main>

            <ModalBukti
                data={modalBukti}
                onClose={() =>
                    setModalBukti(
                        null,
                    )
                }
            />
        </>
    );
}

PerpanjanganRental.layout = (
    page,
) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);
