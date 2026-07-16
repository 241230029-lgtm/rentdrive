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

const STATUS_DENDA = {
    belum_dibayar: {
        label: 'Belum Dibayar',
        className:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },

    menunggu_verifikasi: {
        label: 'Menunggu Verifikasi',
        className:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },

    ditolak: {
        label: 'Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    lunas: {
        label: 'Lunas',
        className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
};

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-xs font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10';

const textareaClass =
    'w-full resize-none rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-xs font-semibold leading-5 text-white outline-none transition placeholder:text-slate-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/10';

function formatRupiah(nilai) {
    return Number(
        nilai ?? 0,
    ).toLocaleString(
        'id-ID',
    );
}

function formatTanggal(nilai) {
    if (!nilai) {
        return '-';
    }

    const tanggalBersih =
        String(nilai).split('T')[0];

    const tanggal =
        new Date(
            `${tanggalBersih}T00:00:00`,
        );

    if (
        Number.isNaN(
            tanggal.getTime(),
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
    ).format(tanggal);
}

function formatWaktu(nilai) {
    if (!nilai) {
        return '-';
    }

    const tanggal =
        new Date(nilai);

    if (
        Number.isNaN(
            tanggal.getTime(),
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
    ).format(tanggal);
}

function BadgeDenda({
    status,
}) {
    const info =
        STATUS_DENDA[status] ?? {
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
            className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${info.className}`}
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
        <div className="rounded-lg border border-slate-800 bg-[#0B1120] px-3 py-2.5">
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

        const keydown = (
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
            document.body.style
                .overflow;

        document.body.style.overflow =
            'hidden';

        window.addEventListener(
            'keydown',
            keydown,
        );

        return () => {
            document.body.style.overflow =
                overflowLama;

            window.removeEventListener(
                'keydown',
                keydown,
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-5"
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
                <header className="flex items-start justify-between border-b border-slate-700 px-4 py-3">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#06B6D4]">
                            Bukti Pembayaran Denda
                        </p>

                        <h2 className="mt-1 text-sm font-black text-white">
                            {data.nomor_booking}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-xl font-bold text-slate-400 hover:border-rose-400 hover:text-rose-300"
                    >
                        ×
                    </button>
                </header>

                <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#050914] p-4">
                    {!gagal ? (
                        <img
                            src={
                                data.url
                            }
                            alt="Bukti pembayaran denda"
                            onError={() =>
                                setGagal(
                                    true,
                                )
                            }
                            className="max-h-[76vh] max-w-full rounded-lg object-contain"
                        />
                    ) : (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-5 text-center">
                            <p className="text-sm font-black text-rose-300">
                                Bukti pembayaran gagal dimuat
                            </p>

                            <p className="mt-2 text-xs text-rose-100/70">
                                Pastikan file masih tersedia.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
                    <p className="text-[10px] text-slate-500">
                        Tekan ESC atau klik area gelap untuk menutup.
                    </p>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="h-9 rounded-lg bg-[#06B6D4] px-5 text-xs font-black text-[#0B1120]"
                    >
                        Tutup
                    </button>
                </footer>
            </section>
        </div>
    );
}

function VerifikasiPembayaranDenda({
    pembayaranDendas = [],
    ringkasan = {},
    sewaTerpilih = null,
}) {
    const {
        flash = {},
        errors = {},
    } = usePage().props;

    const daftar =
        Array.isArray(
            pembayaranDendas,
        )
            ? pembayaranDendas
            : [];

    const [
        pencarian,
        setPencarian,
    ] = useState('');

    const [
        filterStatus,
        setFilterStatus,
    ] = useState('');

    const [
        selectedId,
        setSelectedId,
    ] = useState(
        sewaTerpilih
        ?? daftar[0]?.id
        ?? null,
    );

    const [
        alasanPenolakan,
        setAlasanPenolakan,
    ] = useState('');

    const [
        processing,
        setProcessing,
    ] = useState(false);

    const [
        modalBukti,
        setModalBukti,
    ] = useState(null);

    const hasilFilter =
        useMemo(() => {
            const keyword =
                pencarian
                    .trim()
                    .toLowerCase();

            return daftar.filter(
                (item) => {
                    if (
                        filterStatus &&
                        item
                            .status_pembayaran_denda
                        !==
                        filterStatus
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
                        item.pelanggan
                            ?.no_telepon,
                        item.kendaraan
                            ?.nama_kendaraan,
                        item.kendaraan
                            ?.merek,
                        item
                            .status_pembayaran_denda,
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
            pencarian,
            filterStatus,
        ]);

    const selected =
        useMemo(() => {
            return (
                hasilFilter.find(
                    (item) =>
                        Number(
                            item.id,
                        ) ===
                        Number(
                            selectedId,
                        ),
                )
                ?? hasilFilter[0]
                ?? null
            );
        }, [
            hasilFilter,
            selectedId,
        ]);

    useEffect(() => {
        if (
            selected ||
            !hasilFilter[0]
        ) {
            return;
        }

        setSelectedId(
            hasilFilter[0].id,
        );
    }, [
        selected,
        hasilFilter,
    ]);

    useEffect(() => {
        if (
            sewaTerpilih
        ) {
            const ditemukan =
                daftar.find(
                    (item) =>
                        Number(
                            item.id,
                        ) ===
                        Number(
                            sewaTerpilih,
                        ),
                );

            if (ditemukan) {
                setSelectedId(
                    ditemukan.id,
                );
            }
        }
    }, [
        daftar,
        sewaTerpilih,
    ]);

    useEffect(() => {
        setAlasanPenolakan('');
        setModalBukti(null);
    }, [selected?.id]);

    const daftarError =
        Object.values(
            errors ?? {},
        ).flat();

    const prosesVerifikasi = (
        aksi,
    ) => {
        if (
            !selected ||
            processing
        ) {
            return;
        }

        if (
            !selected
                .boleh_diverifikasi
        ) {
            window.alert(
                'Pembayaran ini belum dapat diverifikasi.',
            );

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
                ? `Setujui pembayaran denda ${selected.nomor_booking} sebesar Rp ${formatRupiah(selected.total_denda)}?`
                : `Tolak pembayaran denda ${selected.nomor_booking}?`;

        if (
            !window.confirm(
                pesan,
            )
        ) {
            return;
        }

        setProcessing(true);

        router.post(
            route(
                'admin.denda.verifikasi',
                selected.id,
            ),
            {
                aksi,

                alasan_penolakan:
                    aksi === 'tolak'
                        ? alasanPenolakan
                            .trim()
                        : null,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setAlasanPenolakan('');
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Verifikasi Pembayaran Denda" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <header>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                        Transaksi Denda
                    </p>

                    <h1 className="mt-1 text-2xl font-black text-white">
                        Verifikasi Pembayaran Denda
                    </h1>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                        Periksa bukti pembayaran denda, lalu setujui atau tolak pembayaran pelanggan.
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
                                    key={
                                        index
                                    }
                                    className="text-xs leading-5 text-rose-300"
                                >
                                    {error}
                                </p>
                            ),
                        )}
                    </div>
                )}

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-5">
                    <StatCard
                        label="Total Tagihan"
                        value={Number(
                            ringkasan
                                .total_tagihan
                            ?? 0,
                        )}
                    />

                    <StatCard
                        label="Belum Dibayar"
                        value={Number(
                            ringkasan
                                .belum_dibayar
                            ?? 0,
                        )}
                        valueClass="text-amber-300"
                    />

                    <StatCard
                        label="Perlu Verifikasi"
                        value={Number(
                            ringkasan
                                .menunggu_verifikasi
                            ?? 0,
                        )}
                        valueClass="text-sky-300"
                    />

                    <StatCard
                        label="Ditolak"
                        value={Number(
                            ringkasan
                                .ditolak
                            ?? 0,
                        )}
                        valueClass="text-rose-300"
                    />

                    <StatCard
                        label="Lunas"
                        value={Number(
                            ringkasan
                                .lunas
                            ?? 0,
                        )}
                        valueClass="text-emerald-300"
                    />
                </section>

                <section className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 md:flex-row">
                    <input
                        type="search"
                        value={
                            pencarian
                        }
                        onChange={(
                            event,
                        ) =>
                            setPencarian(
                                event
                                    .target
                                    .value,
                            )
                        }
                        placeholder="Cari booking, pelanggan, atau kendaraan"
                        className={`${inputClass} flex-1`}
                    />

                    <select
                        value={
                            filterStatus
                        }
                        onChange={(
                            event,
                        ) =>
                            setFilterStatus(
                                event
                                    .target
                                    .value,
                            )
                        }
                        className={`${inputClass} md:w-64`}
                    >
                        <option value="">
                            Semua status
                        </option>

                        <option value="belum_dibayar">
                            Belum Dibayar
                        </option>

                        <option value="menunggu_verifikasi">
                            Menunggu Verifikasi
                        </option>

                        <option value="ditolak">
                            Ditolak
                        </option>

                        <option value="lunas">
                            Lunas
                        </option>
                    </select>

                    <button
                        type="button"
                        onClick={() => {
                            setPencarian('');
                            setFilterStatus('');
                        }}
                        className="h-10 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-400 hover:border-slate-500 hover:text-white"
                    >
                        Reset
                    </button>
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
                    <aside className="h-fit overflow-hidden rounded-xl border border-slate-800 bg-[#10192B]">
                        <header className="border-b border-slate-800 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                Daftar Tagihan
                            </p>

                            <h2 className="mt-1 text-sm font-black text-white">
                                Pembayaran Denda
                            </h2>
                        </header>

                        {hasilFilter.length ===
                        0 ? (
                            <div className="flex min-h-56 items-center justify-center px-5 text-center text-xs text-slate-500">
                                Data pembayaran denda tidak ditemukan.
                            </div>
                        ) : (
                            <div className="max-h-[700px] divide-y divide-slate-800 overflow-y-auto">
                                {hasilFilter.map(
                                    (
                                        item,
                                    ) => {
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
                                                            {
                                                                item.nomor_booking
                                                            }
                                                        </p>

                                                        <p className="mt-1 truncate text-[10px] text-slate-500">
                                                            {item
                                                                .pelanggan
                                                                ?.name
                                                            ?? '-'}
                                                        </p>
                                                    </div>

                                                    <BadgeDenda
                                                        status={
                                                            item
                                                                .status_pembayaran_denda
                                                        }
                                                    />
                                                </div>

                                                <p className="mt-2 text-sm font-black text-rose-300">
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        item.total_denda,
                                                    )}
                                                </p>

                                                <p className="mt-1 truncate text-[9px] text-slate-600">
                                                    {item
                                                        .kendaraan
                                                        ?.nama_kendaraan
                                                    ?? '-'}
                                                </p>
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
                                Pilih pembayaran denda untuk melihat detail.
                            </div>
                        ) : (
                            <>
                                <header className="flex flex-col gap-2 border-b border-slate-800 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                            Detail Pembayaran
                                        </p>

                                        <h2 className="mt-1 text-base font-black text-white">
                                            {
                                                selected.nomor_booking
                                            }
                                        </h2>

                                        <p className="mt-1 text-[10px] text-slate-500">
                                            Dikirim{' '}
                                            {formatWaktu(
                                                selected
                                                    .denda_dibayar_pada,
                                            )}
                                        </p>
                                    </div>

                                    <BadgeDenda
                                        status={
                                            selected
                                                .status_pembayaran_denda
                                        }
                                    />
                                </header>

                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                                        <InfoItem
                                            label="Pelanggan"
                                            value={
                                                selected
                                                    .pelanggan
                                                    ?.name
                                            }
                                        />

                                        <InfoItem
                                            label="Email"
                                            value={
                                                selected
                                                    .pelanggan
                                                    ?.email
                                            }
                                        />

                                        <InfoItem
                                            label="Telepon"
                                            value={
                                                selected
                                                    .pelanggan
                                                    ?.no_telepon
                                            }
                                        />

                                        <InfoItem
                                            label="Kendaraan"
                                            value={
                                                selected
                                                    .kendaraan
                                                    ?.nama_kendaraan
                                            }
                                        />

                                        <InfoItem
                                            label="Tanggal Sewa"
                                            value={`${formatTanggal(
                                                selected
                                                    .tanggal_mulai,
                                            )} — ${formatTanggal(
                                                selected
                                                    .tanggal_selesai,
                                            )}`}
                                        />

                                        <InfoItem
                                            label="Tanggal Kembali"
                                            value={formatTanggal(
                                                selected
                                                    .tanggal_kembali_aktual,
                                            )}
                                        />

                                        <InfoItem
                                            label="Metode"
                                            value={
                                                selected
                                                    .metode_pembayaran_denda
                                                ===
                                                'transfer'
                                                    ? 'Transfer'
                                                    : selected
                                                        .metode_pembayaran_denda
                                                    ?? '-'
                                            }
                                        />

                                        <InfoItem
                                            label="Total Denda"
                                            value={`Rp ${formatRupiah(
                                                selected.total_denda,
                                            )}`}
                                            valueClass="text-rose-300"
                                        />
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <InfoItem
                                            label="Denda Keterlambatan"
                                            value={`Rp ${formatRupiah(
                                                selected
                                                    .denda_keterlambatan,
                                            )}`}
                                        />

                                        <InfoItem
                                            label="Denda Kerusakan"
                                            value={`Rp ${formatRupiah(
                                                selected
                                                    .denda_kerusakan,
                                            )}`}
                                        />
                                    </div>

                                    <section className="mt-3 overflow-hidden rounded-xl border border-slate-700 bg-[#0B1120]">
                                        <header className="flex items-center justify-between border-b border-slate-700 px-3 py-2.5">
                                            <div>
                                                <p className="text-xs font-black text-white">
                                                    Bukti Pembayaran
                                                </p>

                                                <p className="mt-1 text-[9px] text-slate-600">
                                                    Dokumen pembayaran privat
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase ${
                                                    selected
                                                        .memiliki_bukti
                                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                                        : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                                                }`}
                                            >
                                                {selected
                                                    .memiliki_bukti
                                                    ? 'Tersedia'
                                                    : 'Tidak Ada'}
                                            </span>
                                        </header>

                                        <button
                                            type="button"
                                            disabled={
                                                !selected
                                                    .memiliki_bukti
                                            }
                                            onClick={() =>
                                                setModalBukti({
                                                    url:
                                                        selected
                                                            .url_bukti,

                                                    nomor_booking:
                                                        selected
                                                            .nomor_booking,
                                                })
                                            }
                                            className="flex h-52 w-full items-center justify-center bg-[#10192B] disabled:cursor-not-allowed"
                                        >
                                            {selected
                                                .memiliki_bukti ? (
                                                <img
                                                    src={
                                                        selected
                                                            .url_bukti
                                                    }
                                                    alt="Bukti pembayaran denda"
                                                    className="h-full w-full object-contain p-3"
                                                />
                                            ) : (
                                                <p className="text-xs text-slate-600">
                                                    Pelanggan belum mengirim bukti pembayaran.
                                                </p>
                                            )}
                                        </button>

                                        {selected
                                            .memiliki_bukti && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setModalBukti({
                                                        url:
                                                            selected
                                                                .url_bukti,

                                                        nomor_booking:
                                                            selected
                                                                .nomor_booking,
                                                    })
                                                }
                                                className="flex h-10 w-full items-center justify-center border-t border-slate-700 text-xs font-black text-[#06B6D4]"
                                            >
                                                Lihat Bukti Pembayaran
                                            </button>
                                        )}
                                    </section>

                                    {selected
                                        .alasan_penolakan && (
                                        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                                Alasan Penolakan Sebelumnya
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
                                        .boleh_diverifikasi ? (
                                        <div className="mt-4 border-t border-slate-800 pt-4">
                                            <label
                                                htmlFor="alasan_penolakan"
                                                className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500"
                                            >
                                                Alasan Penolakan
                                            </label>

                                            <textarea
                                                id="alasan_penolakan"
                                                rows="3"
                                                value={
                                                    alasanPenolakan
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setAlasanPenolakan(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Diisi hanya ketika pembayaran ditolak, minimal 10 karakter."
                                                className={
                                                    textareaClass
                                                }
                                            />

                                            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        processing
                                                    }
                                                    onClick={() =>
                                                        prosesVerifikasi(
                                                            'tolak',
                                                        )
                                                    }
                                                    className="h-10 rounded-lg border border-rose-500/40 bg-rose-500/10 px-5 text-xs font-black text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                                                >
                                                    {processing
                                                        ? 'Memproses...'
                                                        : 'Tolak Pembayaran'}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        processing
                                                    }
                                                    onClick={() =>
                                                        prosesVerifikasi(
                                                            'setujui',
                                                        )
                                                    }
                                                    className="h-10 rounded-lg bg-[#06B6D4] px-5 text-xs font-black text-[#0B1120] hover:bg-cyan-300 disabled:opacity-50"
                                                >
                                                    {processing
                                                        ? 'Memproses...'
                                                        : 'Setujui Pembayaran'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-lg border border-slate-800 bg-[#0B1120] px-4 py-3">
                                            <p className="text-xs font-bold text-slate-400">
                                                Pembayaran ini tidak memerlukan tindakan verifikasi saat ini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </section>
            </main>

            <ModalBukti
                data={
                    modalBukti
                }
                onClose={() =>
                    setModalBukti(
                        null,
                    )
                }
            />
        </>
    );
}

VerifikasiPembayaranDenda.layout = (
    page,
) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default VerifikasiPembayaranDenda;
