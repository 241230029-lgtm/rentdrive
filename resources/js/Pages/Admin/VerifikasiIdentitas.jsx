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

const STATUS_IDENTITAS = {
    menunggu_verifikasi: {
        label: 'Menunggu Verifikasi',
        className:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },

    terverifikasi: {
        label: 'Terverifikasi',
        className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },

    ditolak: {
        label: 'Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    belum_dilengkapi: {
        label: 'Belum Dilengkapi',
        className:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
};

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-xs font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10';

const textareaClass =
    'w-full resize-none rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-xs font-semibold leading-5 text-white outline-none transition placeholder:text-slate-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/10';

function formatRupiah(nilai) {
    return Number(
        nilai ?? 0,
    ).toLocaleString('id-ID');
}

function formatTanggal(nilai) {
    if (!nilai) {
        return '-';
    }

    const tanggalBersih =
        String(nilai).split('T')[0];

    const tanggal = new Date(
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

/**
 * Mengubah URL absolut seperti:
 * http://localhost/admin/identitas/2/dokumen/ktp
 *
 * menjadi URL relatif:
 * /admin/identitas/2/dokumen/ktp
 *
 * Dengan begitu dokumen selalu memakai host dan port
 * halaman aplikasi yang sedang dibuka.
 */
function normalisasiUrlDokumen(url) {
    if (!url) {
        return null;
    }

    const nilai =
        String(url).trim();

    if (!nilai) {
        return null;
    }

    if (
        nilai.startsWith('/')
    ) {
        return nilai;
    }

    try {
        const basis =
            typeof window !==
            'undefined'
                ? window.location.origin
                : 'http://localhost';

        const hasil =
            new URL(
                nilai,
                basis,
            );

        return `${hasil.pathname}${hasil.search}${hasil.hash}`;
    } catch {
        return nilai;
    }
}

function InfoStatus({
    status,
}) {
    const info =
        STATUS_IDENTITAS[
            status
        ] ??
        STATUS_IDENTITAS
            .belum_dilengkapi;

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
                {Number(
                    value ?? 0,
                )}
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

function EmptyState({
    title,
    description,
}) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-[#0B1120] text-xl text-slate-600">
                ≡
            </div>

            <p className="mt-3 text-sm font-black text-white">
                {title}
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function FlashMessage({
    flash,
    errors,
}) {
    const daftarError =
        Object.values(
            errors ?? {},
        ).flat();

    return (
        <>
            {flash?.success && (
                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold leading-5 text-emerald-300">
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold leading-5 text-rose-300">
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
        </>
    );
}

function DokumenCard({
    title,
    available,
    url,
    onOpen,
}) {
    const [
        gagalDimuat,
        setGagalDimuat,
    ] = useState(false);

    const urlDokumen =
        normalisasiUrlDokumen(
            url,
        );

    useEffect(() => {
        setGagalDimuat(false);
    }, [urlDokumen]);

    const dapatDibuka =
        Boolean(
            available &&
                urlDokumen,
        );

    return (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0B1120]">
            <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2.5">
                <div>
                    <p className="text-xs font-black text-white">
                        {title}
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-600">
                        Dokumen privat transaksi
                    </p>
                </div>

                <span
                    className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase ${
                        dapatDibuka
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    }`}
                >
                    {dapatDibuka
                        ? 'Tersedia'
                        : 'Tidak Ada'}
                </span>
            </div>

            <button
                type="button"
                disabled={
                    !dapatDibuka
                }
                onClick={() =>
                    onOpen({
                        title,
                        url:
                            urlDokumen,
                    })
                }
                className="group flex h-48 w-full items-center justify-center overflow-hidden bg-[#10192B] text-center disabled:cursor-not-allowed"
            >
                {dapatDibuka &&
                !gagalDimuat ? (
                    <img
                        src={
                            urlDokumen
                        }
                        alt={
                            title
                        }
                        onError={() =>
                            setGagalDimuat(
                                true,
                            )
                        }
                        className="h-full w-full object-contain p-3 transition duration-200 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="px-5">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-600">
                            ×
                        </div>

                        <p className="mt-2 text-xs font-bold text-slate-500">
                            Pratinjau tidak
                            tersedia
                        </p>
                    </div>
                )}
            </button>

            <button
                type="button"
                disabled={
                    !dapatDibuka
                }
                onClick={() =>
                    onOpen({
                        title,
                        url:
                            urlDokumen,
                    })
                }
                className="flex h-10 w-full items-center justify-center border-t border-slate-700 text-[11px] font-black text-[#06B6D4] transition hover:bg-[#06B6D4]/10 disabled:cursor-not-allowed disabled:text-slate-600"
            >
                Lihat Dokumen
            </button>
        </div>
    );
}

function ModalDokumen({
    dokumen,
    onClose,
}) {
    const [
        gagalDimuat,
        setGagalDimuat,
    ] = useState(false);

    useEffect(() => {
        if (!dokumen) {
            return undefined;
        }

        setGagalDimuat(false);

        const tekanKeyboard = (
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
            tekanKeyboard,
        );

        return () => {
            document.body.style.overflow =
                overflowLama;

            window.removeEventListener(
                'keydown',
                tekanKeyboard,
            );
        };
    }, [
        dokumen,
        onClose,
    ]);

    if (!dokumen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-label={
                dokumen.title
            }
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
            <section className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#10192B] shadow-2xl">
                <header className="flex shrink-0 items-center justify-between border-b border-slate-700 px-4 py-3">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#06B6D4]">
                            Dokumen Identitas
                        </p>

                        <h2 className="mt-1 text-sm font-black text-white sm:text-base">
                            {dokumen.title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-xl font-bold text-slate-400 transition hover:border-rose-400 hover:text-rose-300"
                        aria-label="Tutup dokumen"
                    >
                        ×
                    </button>
                </header>

                <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#050914] p-3 sm:p-5">
                    {!gagalDimuat ? (
                        <img
                            src={
                                dokumen.url
                            }
                            alt={
                                dokumen.title
                            }
                            onError={() =>
                                setGagalDimuat(
                                    true,
                                )
                            }
                            className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-2xl"
                        />
                    ) : (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-5 text-center">
                            <p className="text-sm font-black text-rose-300">
                                Dokumen gagal
                                dimuat
                            </p>

                            <p className="mt-2 text-xs leading-5 text-rose-100/70">
                                Pastikan file masih
                                tersedia dan admin
                                masih dalam keadaan
                                login.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="flex shrink-0 items-center justify-between border-t border-slate-700 px-4 py-3">
                    <p className="text-[10px] text-slate-500">
                        Tekan ESC atau klik
                        area gelap untuk menutup.
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

function VerifikasiIdentitas({
    pelanggans = [],
}) {
    const {
        flash = {},
        errors = {},
    } = usePage().props;

    const daftar =
        Array.isArray(
            pelanggans,
        )
            ? pelanggans
            : [];

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        status,
        setStatus,
    ] = useState('');

    const [
        selectedId,
        setSelectedId,
    ] = useState(
        daftar[0]?.id ??
            null,
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
        dokumenAktif,
        setDokumenAktif,
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
                        status &&
                        item.status_identitas !==
                            status
                    ) {
                        return false;
                    }

                    if (!keyword) {
                        return true;
                    }

                    return [
                        item.name,
                        item.email,
                        item.no_telepon,
                        item.nik,
                        item.nomor_sim,
                        item
                            .bookings?.[0]
                            ?.nomor_booking,
                        item
                            .bookings?.[0]
                            ?.kendaraan
                            ?.nama_kendaraan,
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
            status,
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

    const bookingUtama =
        useMemo(() => {
            if (!selected) {
                return null;
            }

            if (
                Array.isArray(
                    selected.bookings,
                ) &&
                selected.bookings
                    .length > 0
            ) {
                return selected
                    .bookings[0];
            }

            return (
                selected.booking ??
                null
            );
        }, [selected]);

    const ringkasan =
        useMemo(
            () => ({
                total:
                    daftar.length,

                menunggu:
                    daftar.filter(
                        (item) =>
                            item.status_identitas ===
                            'menunggu_verifikasi',
                    ).length,

                terverifikasi:
                    daftar.filter(
                        (item) =>
                            item.status_identitas ===
                            'terverifikasi',
                    ).length,

                ditolak:
                    daftar.filter(
                        (item) =>
                            item.status_identitas ===
                            'ditolak',
                    ).length,
            }),
            [daftar],
        );

    useEffect(() => {
        if (
            selected ||
            !filtered[0]
        ) {
            return;
        }

        setSelectedId(
            filtered[0].id,
        );
    }, [
        selected,
        filtered,
    ]);

    useEffect(() => {
        setAlasanPenolakan(
            '',
        );

        setDokumenAktif(
            null,
        );
    }, [selected?.id]);

    useEffect(() => {
        if (
            typeof window ===
            'undefined'
        ) {
            return;
        }

        const sewaId =
            new URLSearchParams(
                window.location.search,
            ).get('sewa');

        if (!sewaId) {
            return;
        }

        const ditemukan =
            daftar.find(
                (item) =>
                    Number(
                        item.id,
                    ) ===
                    Number(
                        sewaId,
                    ),
            );

        if (ditemukan) {
            setSelectedId(
                ditemukan.id,
            );
        }
    }, [daftar]);

    const dapatDiverifikasi =
        selected
            ?.status_identitas ===
            'menunggu_verifikasi';

    const prosesIdentitas = (
        aksi,
    ) => {
        if (
            !selected ||
            processing
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

        const pesanKonfirmasi =
            aksi === 'setujui'
                ? `Setujui identitas untuk transaksi ${bookingUtama?.nomor_booking ?? selected.name}?`
                : `Tolak identitas untuk transaksi ${bookingUtama?.nomor_booking ?? selected.name}?`;

        if (
            !window.confirm(
                pesanKonfirmasi,
            )
        ) {
            return;
        }

        setProcessing(true);

        router.post(
            route(
                'admin.identitas.verifikasi',
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

                onSuccess: () => {
                    setAlasanPenolakan(
                        '',
                    );
                },

                onFinish: () => {
                    setProcessing(
                        false,
                    );
                },
            },
        );
    };

    return (
        <>
            <Head title="Verifikasi Identitas" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                            Pemeriksaan Dokumen
                        </p>

                        <h1 className="mt-1 text-2xl font-black text-white">
                            Verifikasi Identitas
                        </h1>

                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                            Periksa KTP, SIM,
                            serta data pengguna
                            kendaraan untuk setiap
                            transaksi.
                        </p>
                    </div>
                </header>

                <FlashMessage
                    flash={
                        flash
                    }
                    errors={
                        errors
                    }
                />

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Identitas"
                        value={
                            ringkasan.total
                        }
                    />

                    <StatCard
                        label="Menunggu"
                        value={
                            ringkasan.menunggu
                        }
                        valueClass="text-sky-300"
                    />

                    <StatCard
                        label="Terverifikasi"
                        value={
                            ringkasan.terverifikasi
                        }
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Ditolak"
                        value={
                            ringkasan.ditolak
                        }
                        valueClass="text-rose-300"
                    />
                </section>

                <section className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 md:flex-row">
                    <input
                        type="search"
                        value={
                            search
                        }
                        onChange={(
                            event,
                        ) =>
                            setSearch(
                                event
                                    .target
                                    .value,
                            )
                        }
                        placeholder="Cari nama, NIK, nomor booking, atau kendaraan"
                        className={`${inputClass} flex-1`}
                    />

                    <select
                        value={
                            status
                        }
                        onChange={(
                            event,
                        ) =>
                            setStatus(
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

                        <option value="menunggu_verifikasi">
                            Menunggu Verifikasi
                        </option>

                        <option value="terverifikasi">
                            Terverifikasi
                        </option>

                        <option value="ditolak">
                            Ditolak
                        </option>
                    </select>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                        }}
                        className="h-10 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-400 transition hover:border-slate-500 hover:text-white"
                    >
                        Reset
                    </button>
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[330px_minmax(0,1fr)]">
                    <aside className="h-fit overflow-hidden rounded-xl border border-slate-800 bg-[#10192B]">
                        <header className="border-b border-slate-800 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#06B6D4]">
                                Daftar Transaksi
                            </p>

                            <h2 className="mt-1 text-sm font-black text-white">
                                Identitas Pelanggan
                            </h2>
                        </header>

                        {filtered.length ===
                        0 ? (
                            <EmptyState
                                title="Data tidak ditemukan"
                                description="Belum ada identitas atau filter tidak sesuai."
                            />
                        ) : (
                            <div className="max-h-[680px] divide-y divide-slate-800 overflow-y-auto">
                                {filtered.map(
                                    (
                                        item,
                                    ) => {
                                        const booking =
                                            Array.isArray(
                                                item.bookings,
                                            )
                                                ? item
                                                      .bookings[0]
                                                : item.booking;

                                        const aktif =
                                            Number(
                                                item.id,
                                            ) ===
                                            Number(
                                                selected?.id,
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
                                                                item.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 truncate text-[10px] font-bold text-[#06B6D4]">
                                                            {booking?.nomor_booking ??
                                                                `Transaksi #${item.id}`}
                                                        </p>
                                                    </div>

                                                    <InfoStatus
                                                        status={
                                                            item.status_identitas
                                                        }
                                                    />
                                                </div>

                                                <p className="mt-2 truncate text-[10px] text-slate-500">
                                                    {booking
                                                        ?.kendaraan
                                                        ?.nama_kendaraan ??
                                                        item.email ??
                                                        '-'}
                                                </p>

                                                <p className="mt-1 text-[9px] text-slate-600">
                                                    Dikirim{' '}
                                                    {formatWaktu(
                                                        item.identitas_dikirim_pada,
                                                    )}
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
                            <EmptyState
                                title="Pilih identitas"
                                description="Pilih transaksi pada daftar untuk melihat data dan dokumen."
                            />
                        ) : (
                            <>
                                <header className="flex flex-col gap-3 border-b border-slate-800 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#06B6D4]">
                                            Detail Identitas
                                        </p>

                                        <h2 className="mt-1 text-base font-black text-white">
                                            {selected.name}
                                        </h2>

                                        <p className="mt-1 text-[10px] text-slate-500">
                                            {bookingUtama?.nomor_booking ??
                                                `Transaksi #${selected.id}`}
                                        </p>
                                    </div>

                                    <InfoStatus
                                        status={
                                            selected.status_identitas
                                        }
                                    />
                                </header>

                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                                        <InfoItem
                                            label="Nama Pengguna"
                                            value={
                                                selected.name
                                            }
                                        />

                                        <InfoItem
                                            label="Email Akun"
                                            value={
                                                selected.email
                                            }
                                        />

                                        <InfoItem
                                            label="Nomor Telepon"
                                            value={
                                                selected.no_telepon
                                            }
                                        />

                                        <InfoItem
                                            label="Waktu Pengiriman"
                                            value={formatWaktu(
                                                selected.identitas_dikirim_pada,
                                            )}
                                        />

                                        <InfoItem
                                            label="NIK"
                                            value={
                                                selected.nik ??
                                                '-'
                                            }
                                        />

                                        <InfoItem
                                            label="Nomor SIM"
                                            value={
                                                selected.nomor_sim ??
                                                '-'
                                            }
                                        />

                                        <InfoItem
                                            label="Kendaraan"
                                            value={
                                                bookingUtama
                                                    ?.kendaraan
                                                    ?.nama_kendaraan ??
                                                '-'
                                            }
                                        />

                                        <InfoItem
                                            label="Jadwal Sewa"
                                            value={
                                                bookingUtama
                                                    ? `${formatTanggal(
                                                          bookingUtama.tanggal_mulai,
                                                      )} — ${formatTanggal(
                                                          bookingUtama.tanggal_selesai,
                                                      )}`
                                                    : '-'
                                            }
                                        />
                                    </div>

                                    <div className="mt-3 rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                            Alamat Lengkap
                                        </p>

                                        <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-300">
                                            {selected.alamat ||
                                                'Alamat belum tersedia.'}
                                        </p>
                                    </div>

                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                        <DokumenCard
                                            title="Dokumen KTP"
                                            available={
                                                selected.memiliki_ktp
                                            }
                                            url={
                                                selected.url_ktp
                                            }
                                            onOpen={
                                                setDokumenAktif
                                            }
                                        />

                                        <DokumenCard
                                            title="Dokumen SIM"
                                            available={
                                                selected.memiliki_sim
                                            }
                                            url={
                                                selected.url_sim
                                            }
                                            onOpen={
                                                setDokumenAktif
                                            }
                                        />
                                    </div>

                                    {selected.alasan_penolakan_identitas && (
                                        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                                Penolakan Sebelumnya
                                            </p>

                                            <p className="mt-2 whitespace-pre-line text-xs leading-5 text-rose-100/80">
                                                {
                                                    selected.alasan_penolakan_identitas
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {bookingUtama && (
                                        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                                            <InfoItem
                                                label="Nomor Booking"
                                                value={
                                                    bookingUtama.nomor_booking
                                                }
                                            />

                                            <InfoItem
                                                label="Status Booking"
                                                value={String(
                                                    bookingUtama.status ??
                                                        '-',
                                                ).replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            />

                                            <InfoItem
                                                label="Total Harga"
                                                value={`Rp ${formatRupiah(
                                                    bookingUtama.total_harga,
                                                )}`}
                                                valueClass="text-[#06B6D4]"
                                            />

                                            <InfoItem
                                                label="Diperiksa"
                                                value={formatWaktu(
                                                    selected.identitas_diperiksa_pada,
                                                )}
                                            />
                                        </div>
                                    )}

                                    {dapatDiverifikasi ? (
                                        <div className="mt-4 border-t border-slate-800 pt-4">
                                            <div>
                                                <label
                                                    htmlFor="alasan_penolakan"
                                                    className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500"
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
                                                    placeholder="Diisi hanya ketika identitas ditolak, minimal 10 karakter."
                                                    className={
                                                        textareaClass
                                                    }
                                                />
                                            </div>

                                            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        processing
                                                    }
                                                    onClick={() =>
                                                        prosesIdentitas(
                                                            'tolak',
                                                        )
                                                    }
                                                    className="h-10 rounded-lg border border-rose-500/40 bg-rose-500/10 px-5 text-xs font-black text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {processing
                                                        ? 'Memproses...'
                                                        : 'Tolak Identitas'}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        processing
                                                    }
                                                    onClick={() =>
                                                        prosesIdentitas(
                                                            'setujui',
                                                        )
                                                    }
                                                    className="h-10 rounded-lg bg-[#06B6D4] px-5 text-xs font-black text-[#0B1120] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {processing
                                                        ? 'Memproses...'
                                                        : 'Setujui Identitas'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-lg border border-slate-800 bg-[#0B1120] px-4 py-3">
                                            <p className="text-xs font-bold text-slate-400">
                                                Identitas ini sudah diproses dan tidak memerlukan tindakan baru.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </section>
            </main>

            <ModalDokumen
                dokumen={
                    dokumenAktif
                }
                onClose={() =>
                    setDokumenAktif(
                        null,
                    )
                }
            />
        </>
    );
}

VerifikasiIdentitas.layout = (
    page,
) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default VerifikasiIdentitas;
