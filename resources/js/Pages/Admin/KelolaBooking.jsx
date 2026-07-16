import AdminLayout from '@/Layouts/AdminLayout';
import {
    Head,
    Link,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useState,
} from 'react';

const STATUS_INFO = {
    menunggu_konfirmasi_admin: {
        label: 'Konfirmasi Booking',
        className:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },

    menunggu_identitas: {
        label: 'Menunggu Identitas',
        className:
            'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    },

    menunggu_verifikasi_identitas: {
        label: 'Verifikasi Identitas',
        className:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },

    identitas_ditolak: {
        label: 'Identitas Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    menunggu_pembayaran: {
        label: 'Menunggu Pembayaran',
        className:
            'border-violet-500/30 bg-violet-500/10 text-violet-300',
    },

    menunggu_verifikasi_pembayaran: {
        label: 'Verifikasi Pembayaran',
        className:
            'border-blue-500/30 bg-blue-500/10 text-blue-300',
    },

    ditolak_pembayaran: {
        label: 'Pembayaran Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    disetujui_operasional: {
        label: 'Disetujui',
        className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },

    sedang_berlangsung: {
        label: 'Sedang Berlangsung',
        className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },

    menunggu_verifikasi_pengembalian: {
        label: 'Verifikasi Pengembalian',
        className:
            'border-orange-500/30 bg-orange-500/10 text-orange-300',
    },

    selesai: {
        label: 'Selesai',
        className:
            'border-slate-500/30 bg-slate-500/10 text-slate-300',
    },

    ditolak_booking: {
        label: 'Booking Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    dibatalkan: {
        label: 'Dibatalkan',
        className:
            'border-slate-500/30 bg-slate-500/10 text-slate-400',
    },
};

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-xs font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10 disabled:cursor-not-allowed disabled:opacity-50';

const textareaClass =
    'w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-xs font-semibold leading-5 text-white outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10 disabled:cursor-not-allowed disabled:opacity-50';

function formatRupiah(nilai) {
    return Number(nilai ?? 0).toLocaleString(
        'id-ID',
    );
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

    if (Number.isNaN(tanggal.getTime())) {
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

    const tanggal = new Date(nilai);

    if (Number.isNaN(tanggal.getTime())) {
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

function tanggalHariIni() {
    const sekarang = new Date();

    const lokal = new Date(
        sekarang.getTime() -
            sekarang.getTimezoneOffset() *
                60000,
    );

    return lokal
        .toISOString()
        .split('T')[0];
}

function buatUrlFile(nilai) {
    if (!nilai) {
        return null;
    }

    const path = String(nilai).trim();

    if (
        path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('/') ||
        path.startsWith('blob:')
    ) {
        return path;
    }

    return `/storage/${path}`;
}

function Label({
    htmlFor,
    children,
    required = false,
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500"
        >
            {children}

            {required && (
                <span className="ml-1 text-rose-400">
                    *
                </span>
            )}
        </label>
    );
}

function FieldError({
    message,
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1.5 text-[11px] leading-4 text-rose-400">
            {message}
        </p>
    );
}

function StatusBadge({
    status,
}) {
    const info =
        STATUS_INFO[status] ?? {
            label: String(
                status ?? '-',
            ).replaceAll('_', ' '),

            className:
                'border-slate-600 bg-slate-800 text-slate-300',
        };

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${info.className}`}
        >
            {info.label}
        </span>
    );
}

function SummaryCard({
    label,
    value,
    valueClass = 'text-white',
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-[#10192B] px-3 py-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                {label}
            </p>

            <p
                className={`mt-0.5 text-xl font-black ${valueClass}`}
            >
                {Number(value ?? 0)}
            </p>
        </div>
    );
}

function DetailItem({
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
                className={`mt-1 break-words text-xs font-bold ${valueClass}`}
            >
                {value ?? '-'}
            </p>
        </div>
    );
}

function FlashMessage({
    flash,
    errors,
}) {
    const daftarError = Object.values(
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

            {daftarError.length > 0 && (
                <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                    <p className="text-xs font-black text-rose-300">
                        Periksa kembali data yang
                        dimasukkan.
                    </p>

                    <div className="mt-2 space-y-1">
                        {daftarError.map(
                            (error, index) => (
                                <p
                                    key={`${error}-${index}`}
                                    className="text-[11px] leading-5 text-rose-200/80"
                                >
                                    • {error}
                                </p>
                            ),
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

function FileInput({
    id,
    label,
    file,
    error,
    onChange,
}) {
    const namaFile =
        file?.name ?? null;

    return (
        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <label
                        htmlFor={id}
                        className="text-xs font-black text-white"
                    >
                        {label}

                        <span className="ml-1 text-rose-400">
                            *
                        </span>
                    </label>

                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        JPG, PNG, atau WebP.
                        Maksimal 3 MB.
                    </p>
                </div>

                {namaFile && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[8px] font-black uppercase text-emerald-300">
                        Dipilih
                    </span>
                )}
            </div>

            <label
                htmlFor={id}
                className="mt-3 flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#10192B] px-3 py-3 text-center transition hover:border-[#06B6D4]"
            >
                <span className="text-xl">
                    ↑
                </span>

                <span className="mt-1 text-[11px] font-bold text-slate-300">
                    {namaFile
                        ? 'Ganti dokumen'
                        : 'Pilih dokumen'}
                </span>

                {namaFile && (
                    <span className="mt-1 max-w-full truncate text-[10px] text-[#06B6D4]">
                        {namaFile}
                    </span>
                )}
            </label>

            <input
                id={id}
                name={id}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={onChange}
                className="sr-only"
            />

            <FieldError
                message={error}
            />
        </div>
    );
}

function KelolaBooking({
    bookings = [],
    kendaraans = [],
}) {
    const {
        flash = {},
        errors = {},
    } = usePage().props;

    const daftarBooking =
        Array.isArray(bookings)
            ? bookings
            : [];

    const daftarKendaraan =
        Array.isArray(kendaraans)
            ? kendaraans
            : [];

    const [tabAktif, setTabAktif] =
        useState('online');

    const [pencarian, setPencarian] =
        useState('');

    const [
        filterStatus,
        setFilterStatus,
    ] = useState('');

    const [
        detailBooking,
        setDetailBooking,
    ] = useState(null);

    const [
        targetPenolakan,
        setTargetPenolakan,
    ] = useState(null);

    const [
        prosesAksi,
        setProsesAksi,
    ] = useState(null);

    const [
        hasilKetersediaan,
        setHasilKetersediaan,
    ] = useState(null);

    const [
        memeriksaKetersediaan,
        setMemeriksaKetersediaan,
    ] = useState(false);

    const [
        fileInputKey,
        setFileInputKey,
    ] = useState(0);

    const hariIni =
        useMemo(
            () => tanggalHariIni(),
            [],
        );

    const walkInForm = useForm({
        nama_pelanggan: '',
        email: '',
        no_telepon: '',
        alamat: '',
        nik: '',
        nomor_sim: '',
        dokumen_ktp: null,
        dokumen_sim: null,
        kendaraan_id: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        metode_pembayaran: 'cash',
    });

    const penolakanForm = useForm({
        aksi: 'tolak',
        kategori_penolakan:
            'lainnya',
        alasan_penolakan: '',
    });

    const kendaraanWalkIn =
        useMemo(() => {
            return daftarKendaraan.find(
                (kendaraan) =>
                    Number(kendaraan.id) ===
                    Number(
                        walkInForm.data
                            .kendaraan_id,
                    ),
            );
        }, [
            daftarKendaraan,
            walkInForm.data.kendaraan_id,
        ]);

    const durasiWalkIn =
        useMemo(() => {
            if (
                !walkInForm.data
                    .tanggal_mulai ||
                !walkInForm.data
                    .tanggal_selesai
            ) {
                return 0;
            }

            const mulai = new Date(
                `${walkInForm.data.tanggal_mulai}T00:00:00`,
            );

            const selesai = new Date(
                `${walkInForm.data.tanggal_selesai}T00:00:00`,
            );

            if (
                Number.isNaN(
                    mulai.getTime(),
                ) ||
                Number.isNaN(
                    selesai.getTime(),
                ) ||
                selesai <= mulai
            ) {
                return 0;
            }

            return Math.max(
                1,
                Math.round(
                    (selesai - mulai) /
                        86400000,
                ),
            );
        }, [
            walkInForm.data.tanggal_mulai,
            walkInForm.data.tanggal_selesai,
        ]);

    const estimasiTotal =
        useMemo(() => {
            return (
                durasiWalkIn *
                Number(
                    kendaraanWalkIn
                        ?.harga_per_hari ??
                        0,
                )
            );
        }, [
            durasiWalkIn,
            kendaraanWalkIn,
        ]);

    const hasilFilter =
        useMemo(() => {
            const keyword = pencarian
                .trim()
                .toLowerCase();

            return daftarBooking.filter(
                (booking) => {
                    if (
                        filterStatus &&
                        booking.status !==
                            filterStatus
                    ) {
                        return false;
                    }

                    if (!keyword) {
                        return true;
                    }

                    return [
                        booking.nomor_booking,
                        booking.user?.name,
                        booking.user?.email,
                        booking.user
                            ?.no_telepon,
                        booking.kendaraan
                            ?.nama_kendaraan,
                        booking.kendaraan
                            ?.merek,
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()
                        .includes(keyword);
                },
            );
        }, [
            daftarBooking,
            pencarian,
            filterStatus,
        ]);

    const ringkasan =
        useMemo(() => {
            return {
                total:
                    daftarBooking.length,

                konfirmasi:
                    daftarBooking.filter(
                        (booking) =>
                            booking.status ===
                            'menunggu_konfirmasi_admin',
                    ).length,

                identitas:
                    daftarBooking.filter(
                        (booking) =>
                            [
                                'menunggu_identitas',
                                'menunggu_verifikasi_identitas',
                                'identitas_ditolak',
                            ].includes(
                                booking.status,
                            ),
                    ).length,

                pembayaran:
                    daftarBooking.filter(
                        (booking) =>
                            [
                                'menunggu_pembayaran',
                                'menunggu_verifikasi_pembayaran',
                                'ditolak_pembayaran',
                            ].includes(
                                booking.status,
                            ),
                    ).length,

                aktif:
                    daftarBooking.filter(
                        (booking) =>
                            [
                                'disetujui_operasional',
                                'sedang_berlangsung',
                                'menunggu_verifikasi_pengembalian',
                            ].includes(
                                booking.status,
                            ),
                    ).length,
            };
        }, [daftarBooking]);

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

        const booking =
            daftarBooking.find(
                (item) =>
                    Number(item.id) ===
                    Number(sewaId),
            );

        if (booking) {
            setDetailBooking(
                booking,
            );
        }
    }, [daftarBooking]);

    const resetFilter = () => {
        setPencarian('');
        setFilterStatus('');
    };

    const setujuiBooking = (
        booking,
    ) => {
        const yakin =
            window.confirm(
                `Setujui booking ${booking.nomor_booking}?`,
            );

        if (!yakin) {
            return;
        }

        const aksiKey =
            `booking-${booking.id}`;

        setProsesAksi(aksiKey);

        router.post(
            route(
                'admin.booking.konfirmasi',
                booking.id,
            ),
            {
                aksi: 'setujui',
            },
            {
                preserveScroll: true,

                onFinish: () => {
                    setProsesAksi(null);
                },
            },
        );
    };

    const setujuiPembayaran = (
        booking,
    ) => {
        const yakin =
            window.confirm(
                `Setujui pembayaran ${booking.nomor_booking}?`,
            );

        if (!yakin) {
            return;
        }

        const aksiKey =
            `pembayaran-${booking.id}`;

        setProsesAksi(aksiKey);

        router.post(
            route(
                'admin.booking.verifikasi',
                booking.id,
            ),
            {
                aksi: 'setujui',
            },
            {
                preserveScroll: true,

                onFinish: () => {
                    setProsesAksi(null);
                },
            },
        );
    };

    const bukaPenolakan = (
        booking,
        jenis,
    ) => {
        setDetailBooking(null);

        setTargetPenolakan({
            booking,
            jenis,
        });

        penolakanForm.reset();

        penolakanForm.setData(
            'aksi',
            'tolak',
        );

        penolakanForm.setData(
            'kategori_penolakan',
            'lainnya',
        );

        penolakanForm.setData(
            'alasan_penolakan',
            '',
        );
    };

    const tutupPenolakan = () => {
        if (
            penolakanForm.processing
        ) {
            return;
        }

        setTargetPenolakan(null);
        penolakanForm.reset();
    };

    const kirimPenolakan = (
        event,
    ) => {
        event.preventDefault();

        if (!targetPenolakan) {
            return;
        }

        const routeTujuan =
            targetPenolakan.jenis ===
            'booking'
                ? route(
                      'admin.booking.konfirmasi',
                      targetPenolakan
                          .booking.id,
                  )
                : route(
                      'admin.booking.verifikasi',
                      targetPenolakan
                          .booking.id,
                  );

        penolakanForm.post(
            routeTujuan,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setTargetPenolakan(
                        null,
                    );

                    penolakanForm.reset();
                },
            },
        );
    };

    const cekKetersediaan =
        async () => {
            if (
                !walkInForm.data
                    .kendaraan_id ||
                !walkInForm.data
                    .tanggal_mulai ||
                !walkInForm.data
                    .tanggal_selesai
            ) {
                setHasilKetersediaan({
                    tersedia: false,
                    lokal: true,
                    pesan:
                        'Pilih kendaraan dan tanggal sewa terlebih dahulu.',
                });

                return;
            }

            setMemeriksaKetersediaan(
                true,
            );

            setHasilKetersediaan(
                null,
            );

            try {
                const parameter =
                    new URLSearchParams({
                        kendaraan_id:
                            walkInForm.data
                                .kendaraan_id,

                        tanggal_mulai:
                            walkInForm.data
                                .tanggal_mulai,

                        tanggal_selesai:
                            walkInForm.data
                                .tanggal_selesai,
                    });

                const response =
                    await fetch(
                        `${route(
                            'admin.booking.cek-ketersediaan',
                        )}?${parameter.toString()}`,
                        {
                            headers: {
                                Accept:
                                    'application/json',

                                'X-Requested-With':
                                    'XMLHttpRequest',
                            },
                        },
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    const pesanError =
                        Object.values(
                            data.errors ??
                                {},
                        )?.[0]?.[0];

                    throw new Error(
                        pesanError ??
                            data.message ??
                            'Ketersediaan gagal diperiksa.',
                    );
                }

                setHasilKetersediaan(
                    data,
                );
            } catch (error) {
                setHasilKetersediaan({
                    tersedia: false,
                    lokal: true,
                    pesan:
                        error?.message ??
                        'Ketersediaan gagal diperiksa.',
                });
            } finally {
                setMemeriksaKetersediaan(
                    false,
                );
            }
        };

    const simpanWalkIn = (
        event,
    ) => {
        event.preventDefault();

        walkInForm.post(
            route(
                'admin.booking.walkin',
            ),
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    walkInForm.reset();

                    setHasilKetersediaan(
                        null,
                    );

                    setFileInputKey(
                        (nilai) =>
                            nilai + 1,
                    );
                },
            },
        );
    };

    return (
        <>
            <Head title="Kelola Booking" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                            Operasional Rental
                        </p>

                        <h1 className="mt-1 text-2xl font-black text-white">
                            Kelola Booking
                        </h1>

                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                            Proses booking online
                            dan masukkan transaksi
                            pelanggan yang datang
                            langsung ke lokasi.
                        </p>
                    </div>

                    <div className="flex rounded-xl border border-slate-800 bg-[#10192B] p-1">
                        <button
                            type="button"
                            onClick={() =>
                                setTabAktif(
                                    'online',
                                )
                            }
                            className={`h-9 rounded-lg px-4 text-[10px] font-black uppercase tracking-wider transition ${
                                tabAktif ===
                                'online'
                                    ? 'bg-[#06B6D4] text-[#0B1120]'
                                    : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            Booking Online
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setTabAktif(
                                    'walk_in',
                                )
                            }
                            className={`h-9 rounded-lg px-4 text-[10px] font-black uppercase tracking-wider transition ${
                                tabAktif ===
                                'walk_in'
                                    ? 'bg-[#06B6D4] text-[#0B1120]'
                                    : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            Booking Walk-In
                        </button>
                    </div>
                </header>

                <FlashMessage
                    flash={flash}
                    errors={errors}
                />

                {tabAktif ===
                    'online' && (
                    <>
                        <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-5">
                            <SummaryCard
                                label="Total Booking"
                                value={
                                    ringkasan.total
                                }
                            />

                            <SummaryCard
                                label="Perlu Konfirmasi"
                                value={
                                    ringkasan.konfirmasi
                                }
                                valueClass="text-amber-300"
                            />

                            <SummaryCard
                                label="Tahap Identitas"
                                value={
                                    ringkasan.identitas
                                }
                                valueClass="text-sky-300"
                            />

                            <SummaryCard
                                label="Tahap Pembayaran"
                                value={
                                    ringkasan.pembayaran
                                }
                                valueClass="text-violet-300"
                            />

                            <SummaryCard
                                label="Aktif"
                                value={
                                    ringkasan.aktif
                                }
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

                                {Object.entries(
                                    STATUS_INFO,
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
                                onClick={
                                    resetFilter
                                }
                                className="h-10 rounded-lg border border-slate-700 px-3 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white"
                            >
                                Reset
                            </button>

                            <div className="flex h-10 items-center rounded-lg border border-slate-800 bg-[#0B1120] px-3 text-xs font-bold text-slate-500">
                                {
                                    hasilFilter.length
                                }{' '}
                                data
                            </div>
                        </section>

                        <section className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-[#10192B]">
                            {hasilFilter.length ===
                            0 ? (
                                <div className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
                                    <span className="text-4xl opacity-40">
                                        📋
                                    </span>

                                    <p className="mt-3 text-sm font-black text-white">
                                        Booking tidak
                                        ditemukan
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Belum ada data
                                        atau filter tidak
                                        sesuai.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1180px] border-collapse text-left">
                                        <thead className="border-b border-slate-800 bg-[#0B1120] text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
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
                                                    Total
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
                                            {hasilFilter.map(
                                                (
                                                    booking,
                                                ) => {
                                                    const prosesBooking =
                                                        prosesAksi ===
                                                        `booking-${booking.id}`;

                                                    const prosesPembayaran =
                                                        prosesAksi ===
                                                        `pembayaran-${booking.id}`;

                                                    return (
                                                        <tr
                                                            key={
                                                                booking.id
                                                            }
                                                            className="hover:bg-white/[0.02]"
                                                        >
                                                            <td className="px-3 py-3 align-top">
                                                                <p className="text-xs font-black text-white">
                                                                    {
                                                                        booking.nomor_booking
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-[9px] text-slate-600">
                                                                    Dibuat{' '}
                                                                    {formatWaktu(
                                                                        booking.created_at,
                                                                    )}
                                                                </p>
                                                            </td>

                                                            <td className="px-3 py-3 align-top">
                                                                <p className="text-xs font-bold text-slate-200">
                                                                    {booking
                                                                        .user
                                                                        ?.name ??
                                                                        '-'}
                                                                </p>

                                                                <p className="mt-1 text-[10px] text-slate-600">
                                                                    {booking
                                                                        .user
                                                                        ?.email ??
                                                                        '-'}
                                                                </p>

                                                                <p className="mt-0.5 text-[10px] text-slate-600">
                                                                    {booking
                                                                        .user
                                                                        ?.no_telepon ??
                                                                        '-'}
                                                                </p>
                                                            </td>

                                                            <td className="px-3 py-3 align-top">
                                                                <p className="text-xs font-bold text-slate-200">
                                                                    {booking
                                                                        .kendaraan
                                                                        ?.nama_kendaraan ??
                                                                        '-'}
                                                                </p>

                                                                <p className="mt-1 text-[10px] text-slate-600">
                                                                    {booking
                                                                        .kendaraan
                                                                        ?.merek ??
                                                                        '-'}
                                                                </p>
                                                            </td>

                                                            <td className="px-3 py-3 align-top">
                                                                <p className="text-[11px] font-bold text-slate-300">
                                                                    {formatTanggal(
                                                                        booking.tanggal_mulai,
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-[10px] text-slate-600">
                                                                    sampai{' '}
                                                                    {formatTanggal(
                                                                        booking.tanggal_selesai,
                                                                    )}
                                                                </p>
                                                            </td>

                                                            <td className="px-3 py-3 align-top">
                                                                <p className="text-xs font-black text-[#06B6D4]">
                                                                    Rp{' '}
                                                                    {formatRupiah(
                                                                        booking.total_harga,
                                                                    )}
                                                                </p>
                                                            </td>

                                                            <td className="px-3 py-3 align-top">
                                                                <StatusBadge
                                                                    status={
                                                                        booking.status
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="px-3 py-3 align-top">
                                                                <div className="flex flex-wrap justify-end gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setDetailBooking(
                                                                                booking,
                                                                            )
                                                                        }
                                                                        className="h-8 rounded-lg border border-slate-700 px-2.5 text-[10px] font-black text-slate-300 hover:border-slate-500 hover:text-white"
                                                                    >
                                                                        Detail
                                                                    </button>

                                                                    {booking.status ===
                                                                        'menunggu_konfirmasi_admin' && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    prosesBooking
                                                                                }
                                                                                onClick={() =>
                                                                                    bukaPenolakan(
                                                                                        booking,
                                                                                        'booking',
                                                                                    )
                                                                                }
                                                                                className="h-8 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 text-[10px] font-black text-rose-300 disabled:opacity-40"
                                                                            >
                                                                                Tolak
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    prosesBooking
                                                                                }
                                                                                onClick={() =>
                                                                                    setujuiBooking(
                                                                                        booking,
                                                                                    )
                                                                                }
                                                                                className="h-8 rounded-lg bg-[#06B6D4] px-2.5 text-[10px] font-black text-[#0B1120] disabled:opacity-40"
                                                                            >
                                                                                {prosesBooking
                                                                                    ? 'Memproses'
                                                                                    : 'Setujui'}
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    {booking.status ===
                                                                        'menunggu_verifikasi_identitas' && (
                                                                        <Link
                                                                            href={route(
                                                                                'admin.identitas.index',
                                                                                {
                                                                                    sewa: booking.id,
                                                                                },
                                                                            )}
                                                                            className="inline-flex h-8 items-center rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 text-[10px] font-black text-sky-300"
                                                                        >
                                                                            Identitas
                                                                        </Link>
                                                                    )}

                                                                    {booking.status ===
                                                                        'menunggu_verifikasi_pembayaran' && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    prosesPembayaran
                                                                                }
                                                                                onClick={() =>
                                                                                    bukaPenolakan(
                                                                                        booking,
                                                                                        'pembayaran',
                                                                                    )
                                                                                }
                                                                                className="h-8 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 text-[10px] font-black text-rose-300 disabled:opacity-40"
                                                                            >
                                                                                Tolak
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    prosesPembayaran
                                                                                }
                                                                                onClick={() =>
                                                                                    setujuiPembayaran(
                                                                                        booking,
                                                                                    )
                                                                                }
                                                                                className="h-8 rounded-lg bg-blue-500 px-2.5 text-[10px] font-black text-white disabled:opacity-40"
                                                                            >
                                                                                {prosesPembayaran
                                                                                    ? 'Memproses'
                                                                                    : 'Verifikasi'}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {tabAktif ===
                    'walk_in' && (
                    <form
                        onSubmit={
                            simpanWalkIn
                        }
                        className="mt-3"
                    >
                        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_310px]">
                            <div className="space-y-3">
                                <section className="rounded-xl border border-slate-800 bg-[#10192B]">
                                    <header className="border-b border-slate-800 px-4 py-3">
                                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#06B6D4]">
                                            Data Pelanggan
                                        </p>

                                        <h2 className="mt-1 text-sm font-black text-white">
                                            Pelanggan
                                            Walk-In
                                        </h2>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                            Nama pelanggan
                                            diketik langsung.
                                            Sistem akan
                                            menghubungkan atau
                                            membuat akun
                                            pelanggan internal.
                                        </p>
                                    </header>

                                    <div className="grid gap-3 p-4 md:grid-cols-2">
                                        <div>
                                            <Label
                                                htmlFor="nama_pelanggan"
                                                required
                                            >
                                                Nama
                                                Pelanggan
                                            </Label>

                                            <input
                                                id="nama_pelanggan"
                                                type="text"
                                                value={
                                                    walkInForm
                                                        .data
                                                        .nama_pelanggan
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    walkInForm.setData(
                                                        'nama_pelanggan',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Nama lengkap pelanggan"
                                                className={
                                                    inputClass
                                                }
                                            />

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .nama_pelanggan
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="email">
                                                Email
                                                Opsional
                                            </Label>

                                            <input
                                                id="email"
                                                type="email"
                                                value={
                                                    walkInForm
                                                        .data
                                                        .email
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    walkInForm.setData(
                                                        'email',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="nama@email.com"
                                                className={
                                                    inputClass
                                                }
                                            />

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .email
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="no_telepon"
                                                required
                                            >
                                                Nomor
                                                Telepon
                                            </Label>

                                            <input
                                                id="no_telepon"
                                                type="tel"
                                                value={
                                                    walkInForm
                                                        .data
                                                        .no_telepon
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    walkInForm.setData(
                                                        'no_telepon',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="08xxxxxxxxxx"
                                                className={
                                                    inputClass
                                                }
                                            />

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .no_telepon
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="nik"
                                                required
                                            >
                                                NIK
                                            </Label>

                                            <input
                                                id="nik"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength="16"
                                                value={
                                                    walkInForm
                                                        .data
                                                        .nik
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    walkInForm.setData(
                                                        'nik',
                                                        event
                                                            .target
                                                            .value
                                                            .replace(
                                                                /\D/g,
                                                                '',
                                                            )
                                                            .slice(
                                                                0,
                                                                16,
                                                            ),
                                                    )
                                                }
                                                placeholder="16 angka NIK"
                                                className={
                                                    inputClass
                                                }
                                            />

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .nik
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="nomor_sim"
                                                required
                                            >
                                                Nomor SIM
                                            </Label>

                                            <input
                                                id="nomor_sim"
                                                type="text"
                                                value={
                                                    walkInForm
                                                        .data
                                                        .nomor_sim
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    walkInForm.setData(
                                                        'nomor_sim',
                                                        event
                                                            .target
                                                            .value
                                                            .toUpperCase(),
                                                    )
                                                }
                                                placeholder="Nomor SIM pengguna kendaraan"
                                                className={
                                                    inputClass
                                                }
                                            />

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .nomor_sim
                                                }
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label
                                                htmlFor="alamat"
                                                required
                                            >
                                                Alamat
                                                Lengkap
                                            </Label>

                                            <textarea
                                                id="alamat"
                                                rows="3"
                                                value={
                                                    walkInForm
                                                        .data
                                                        .alamat
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    walkInForm.setData(
                                                        'alamat',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Alamat lengkap pelanggan"
                                                className={
                                                    textareaClass
                                                }
                                            />

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .alamat
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-xl border border-slate-800 bg-[#10192B]">
                                    <header className="border-b border-slate-800 px-4 py-3">
                                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#06B6D4]">
                                            Identitas
                                            Transaksi
                                        </p>

                                        <h2 className="mt-1 text-sm font-black text-white">
                                            Foto KTP
                                            dan SIM
                                        </h2>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                            Dokumen disimpan
                                            khusus untuk
                                            transaksi Walk-In
                                            ini dan langsung
                                            dianggap telah
                                            diperiksa admin.
                                        </p>
                                    </header>

                                    <div
                                        key={
                                            fileInputKey
                                        }
                                        className="grid gap-3 p-4 md:grid-cols-2"
                                    >
                                        <FileInput
                                            id="dokumen_ktp"
                                            label="Foto KTP"
                                            file={
                                                walkInForm
                                                    .data
                                                    .dokumen_ktp
                                            }
                                            error={
                                                walkInForm
                                                    .errors
                                                    .dokumen_ktp
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                walkInForm.setData(
                                                    'dokumen_ktp',
                                                    event
                                                        .target
                                                        .files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />

                                        <FileInput
                                            id="dokumen_sim"
                                            label="Foto SIM"
                                            file={
                                                walkInForm
                                                    .data
                                                    .dokumen_sim
                                            }
                                            error={
                                                walkInForm
                                                    .errors
                                                    .dokumen_sim
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                walkInForm.setData(
                                                    'dokumen_sim',
                                                    event
                                                        .target
                                                        .files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                    </div>
                                </section>

                                <section className="rounded-xl border border-slate-800 bg-[#10192B]">
                                    <header className="border-b border-slate-800 px-4 py-3">
                                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#06B6D4]">
                                            Informasi
                                            Penyewaan
                                        </p>

                                        <h2 className="mt-1 text-sm font-black text-white">
                                            Kendaraan,
                                            Jadwal, dan
                                            Pembayaran
                                        </h2>
                                    </header>

                                    <div className="grid gap-3 p-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <Label
                                                htmlFor="kendaraan_id"
                                                required
                                            >
                                                Kendaraan
                                            </Label>

                                            <select
                                                id="kendaraan_id"
                                                value={
                                                    walkInForm
                                                        .data
                                                        .kendaraan_id
                                                }
                                                onChange={(
                                                    event,
                                                ) => {
                                                    walkInForm.setData(
                                                        'kendaraan_id',
                                                        event
                                                            .target
                                                            .value,
                                                    );

                                                    setHasilKetersediaan(
                                                        null,
                                                    );
                                                }}
                                                className={
                                                    inputClass
                                                }
                                            >
                                                <option value="">
                                                    Pilih
                                                    kendaraan
                                                </option>

                                                {daftarKendaraan.map(
                                                    (
                                                        kendaraan,
                                                    ) => {
                                                        const tidakAktif =
                                                            [
                                                                'perbaikan',
                                                                'tidak_aktif',
                                                            ].includes(
                                                                kendaraan.status,
                                                            );

                                                        return (
                                                            <option
                                                                key={
                                                                    kendaraan.id
                                                                }
                                                                value={
                                                                    kendaraan.id
                                                                }
                                                                disabled={
                                                                    tidakAktif
                                                                }
                                                            >
                                                                {
                                                                    kendaraan.nama_kendaraan
                                                                }{' '}
                                                                —{' '}
                                                                {
                                                                    kendaraan.merek
                                                                }{' '}
                                                                — Rp{' '}
                                                                {formatRupiah(
                                                                    kendaraan.harga_per_hari,
                                                                )}
                                                                /hari
                                                                {tidakAktif
                                                                    ? ' — Tidak tersedia'
                                                                    : ''}
                                                            </option>
                                                        );
                                                    },
                                                )}
                                            </select>

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .kendaraan_id
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="tanggal_mulai"
                                                required
                                            >
                                                Tanggal
                                                Mulai
                                            </Label>

                                            <input
                                                id="tanggal_mulai"
                                                type="date"
                                                min={
                                                    hariIni
                                                }
                                                value={
                                                    walkInForm
                                                        .data
                                                        .tanggal_mulai
                                                }
                                                onChange={(
                                                    event,
                                                ) => {
                                                    walkInForm.setData(
                                                        'tanggal_mulai',
                                                        event
                                                            .target
                                                            .value,
                                                    );

                                                    setHasilKetersediaan(
                                                        null,
                                                    );
                                                }}
                                                className={
                                                    inputClass
                                                }
                                            />

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .tanggal_mulai
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="tanggal_selesai"
                                                required
                                            >
                                                Tanggal
                                                Selesai
                                            </Label>

                                            <input
                                                id="tanggal_selesai"
                                                type="date"
                                                min={
                                                    walkInForm
                                                        .data
                                                        .tanggal_mulai ||
                                                    hariIni
                                                }
                                                value={
                                                    walkInForm
                                                        .data
                                                        .tanggal_selesai
                                                }
                                                onChange={(
                                                    event,
                                                ) => {
                                                    walkInForm.setData(
                                                        'tanggal_selesai',
                                                        event
                                                            .target
                                                            .value,
                                                    );

                                                    setHasilKetersediaan(
                                                        null,
                                                    );
                                                }}
                                                className={
                                                    inputClass
                                                }
                                            />

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .tanggal_selesai
                                                }
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    memeriksaKetersediaan
                                                }
                                                onClick={
                                                    cekKetersediaan
                                                }
                                                className="h-9 rounded-lg border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3 text-[10px] font-black uppercase tracking-wider text-[#06B6D4] disabled:opacity-50"
                                            >
                                                {memeriksaKetersediaan
                                                    ? 'Memeriksa...'
                                                    : 'Cek Ketersediaan'}
                                            </button>

                                            {hasilKetersediaan && (
                                                <div
                                                    className={`mt-2 rounded-lg border px-3 py-2.5 text-xs font-semibold leading-5 ${
                                                        hasilKetersediaan.tersedia
                                                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                                            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                                                    }`}
                                                >
                                                    {
                                                        hasilKetersediaan.pesan
                                                    }

                                                    {!hasilKetersediaan.lokal &&
                                                        typeof hasilKetersediaan.unit_tersedia !==
                                                            'undefined' && (
                                                            <span className="ml-1">
                                                                Unit
                                                                tersedia:{' '}
                                                                {
                                                                    hasilKetersediaan.unit_tersedia
                                                                }
                                                                .
                                                            </span>
                                                        )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label
                                                htmlFor="metode_pembayaran"
                                                required
                                            >
                                                Metode
                                                Pembayaran
                                            </Label>

                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <label
                                                    className={`cursor-pointer rounded-xl border p-3 transition ${
                                                        walkInForm
                                                            .data
                                                            .metode_pembayaran ===
                                                        'cash'
                                                            ? 'border-[#06B6D4]/50 bg-[#06B6D4]/10'
                                                            : 'border-slate-800 bg-[#0B1120] hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name="metode_pembayaran"
                                                            value="cash"
                                                            checked={
                                                                walkInForm
                                                                    .data
                                                                    .metode_pembayaran ===
                                                                'cash'
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                walkInForm.setData(
                                                                    'metode_pembayaran',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="border-slate-600 bg-[#0B1120] text-[#06B6D4] focus:ring-[#06B6D4]"
                                                        />

                                                        <div>
                                                            <p className="text-xs font-black text-white">
                                                                Cash
                                                            </p>

                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                Pembayaran
                                                                tunai
                                                                diterima
                                                                langsung.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>

                                                <label
                                                    className={`cursor-pointer rounded-xl border p-3 transition ${
                                                        walkInForm
                                                            .data
                                                            .metode_pembayaran ===
                                                        'transfer'
                                                            ? 'border-[#06B6D4]/50 bg-[#06B6D4]/10'
                                                            : 'border-slate-800 bg-[#0B1120] hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name="metode_pembayaran"
                                                            value="transfer"
                                                            checked={
                                                                walkInForm
                                                                    .data
                                                                    .metode_pembayaran ===
                                                                'transfer'
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                walkInForm.setData(
                                                                    'metode_pembayaran',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="border-slate-600 bg-[#0B1120] text-[#06B6D4] focus:ring-[#06B6D4]"
                                                        />

                                                        <div>
                                                            <p className="text-xs font-black text-white">
                                                                Transfer
                                                            </p>

                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                Transfer
                                                                diterima
                                                                dan dicatat
                                                                admin.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            <FieldError
                                                message={
                                                    walkInForm
                                                        .errors
                                                        .metode_pembayaran
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside className="h-fit rounded-xl border border-slate-800 bg-[#10192B] xl:sticky xl:top-4">
                                <header className="border-b border-slate-800 px-4 py-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#06B6D4]">
                                        Ringkasan
                                    </p>

                                    <h2 className="mt-1 text-sm font-black text-white">
                                        Transaksi
                                        Walk-In
                                    </h2>
                                </header>

                                <div className="space-y-2 p-4">
                                    <DetailItem
                                        label="Pelanggan"
                                        value={
                                            walkInForm
                                                .data
                                                .nama_pelanggan ||
                                            '-'
                                        }
                                    />

                                    <DetailItem
                                        label="Kendaraan"
                                        value={
                                            kendaraanWalkIn
                                                ? `${kendaraanWalkIn.nama_kendaraan} — ${kendaraanWalkIn.merek}`
                                                : '-'
                                        }
                                    />

                                    <DetailItem
                                        label="Jadwal"
                                        value={
                                            walkInForm
                                                .data
                                                .tanggal_mulai &&
                                            walkInForm
                                                .data
                                                .tanggal_selesai
                                                ? `${formatTanggal(
                                                      walkInForm
                                                          .data
                                                          .tanggal_mulai,
                                                  )} — ${formatTanggal(
                                                      walkInForm
                                                          .data
                                                          .tanggal_selesai,
                                                  )}`
                                                : '-'
                                        }
                                    />

                                    <DetailItem
                                        label="Durasi"
                                        value={`${durasiWalkIn} hari`}
                                    />

                                    <DetailItem
                                        label="Pembayaran"
                                        value={
                                            walkInForm
                                                .data
                                                .metode_pembayaran ===
                                            'cash'
                                                ? 'Cash'
                                                : 'Transfer'
                                        }
                                        valueClass="text-emerald-300"
                                    />

                                    <div className="rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/5 p-4">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                                            Total
                                            Pembayaran
                                        </p>

                                        <p className="mt-1 text-2xl font-black text-[#06B6D4]">
                                            Rp{' '}
                                            {formatRupiah(
                                                estimasiTotal,
                                            )}
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                            Nilai akhir
                                            dihitung kembali
                                            oleh sistem ketika
                                            transaksi disimpan.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                                        <p className="text-[10px] font-bold leading-5 text-emerald-300">
                                            Identitas langsung
                                            terverifikasi dan
                                            pembayaran langsung
                                            tercatat diterima
                                            admin.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            walkInForm.processing
                                        }
                                        className="h-10 w-full rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {walkInForm.processing
                                            ? 'Menyimpan Transaksi...'
                                            : 'Simpan Booking Walk-In'}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            walkInForm.processing
                                        }
                                        onClick={() => {
                                            walkInForm.reset();

                                            setHasilKetersediaan(
                                                null,
                                            );

                                            setFileInputKey(
                                                (
                                                    nilai,
                                                ) =>
                                                    nilai +
                                                    1,
                                            );
                                        }}
                                        className="h-9 w-full rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-400 hover:border-slate-500 hover:text-white disabled:opacity-50"
                                    >
                                        Bersihkan Form
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </form>
                )}
            </main>

            {detailBooking && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setDetailBooking(
                                null,
                            );
                        }
                    }}
                >
                    <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-700 bg-[#10192B] shadow-2xl">
                        <header className="flex items-start justify-between border-b border-slate-700 px-4 py-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#06B6D4]">
                                    Detail Booking
                                </p>

                                <h2 className="mt-1 text-lg font-black text-white">
                                    {
                                        detailBooking.nomor_booking
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setDetailBooking(
                                        null,
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-sm font-black text-slate-400 hover:text-white"
                            >
                                ×
                            </button>
                        </header>

                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                <DetailItem
                                    label="Pelanggan"
                                    value={
                                        detailBooking
                                            .user
                                            ?.name
                                    }
                                />

                                <DetailItem
                                    label="Email"
                                    value={
                                        detailBooking
                                            .user
                                            ?.email
                                    }
                                />

                                <DetailItem
                                    label="Telepon"
                                    value={
                                        detailBooking
                                            .user
                                            ?.no_telepon
                                    }
                                />

                                <DetailItem
                                    label="Kendaraan"
                                    value={
                                        detailBooking
                                            .kendaraan
                                            ?.nama_kendaraan
                                    }
                                />

                                <DetailItem
                                    label="Merek"
                                    value={
                                        detailBooking
                                            .kendaraan
                                            ?.merek
                                    }
                                />

                                <DetailItem
                                    label="Status"
                                    value={
                                        STATUS_INFO[
                                            detailBooking
                                                .status
                                        ]?.label ??
                                        detailBooking.status
                                    }
                                />

                                <DetailItem
                                    label="Tanggal Mulai"
                                    value={formatTanggal(
                                        detailBooking.tanggal_mulai,
                                    )}
                                />

                                <DetailItem
                                    label="Tanggal Selesai"
                                    value={formatTanggal(
                                        detailBooking.tanggal_selesai,
                                    )}
                                />

                                <DetailItem
                                    label="Total Harga"
                                    value={`Rp ${formatRupiah(
                                        detailBooking.total_harga,
                                    )}`}
                                    valueClass="text-[#06B6D4]"
                                />
                            </div>

                            {detailBooking.alasan_penolakan && (
                                <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                        Alasan
                                        Penolakan
                                    </p>

                                    <p className="mt-2 whitespace-pre-line text-xs leading-5 text-rose-100/80">
                                        {
                                            detailBooking.alasan_penolakan
                                        }
                                    </p>
                                </div>
                            )}

                            {detailBooking.bukti_pembayaran && (
                                <div className="mt-3 rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                    <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-500">
                                        Bukti
                                        Pembayaran
                                    </p>

                                    <img
                                        src={buatUrlFile(
                                            detailBooking.bukti_pembayaran,
                                        )}
                                        alt="Bukti pembayaran"
                                        className="max-h-72 w-full rounded-lg border border-slate-700 object-contain"
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {targetPenolakan && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            tutupPenolakan();
                        }
                    }}
                >
                    <form
                        onSubmit={
                            kirimPenolakan
                        }
                        className="w-full max-w-md rounded-xl border border-slate-700 bg-[#10192B] shadow-2xl"
                    >
                        <header className="border-b border-slate-700 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#06B6D4]">
                                {
                                    targetPenolakan
                                        .booking
                                        .nomor_booking
                                }
                            </p>

                            <h2 className="mt-1 text-lg font-black text-white">
                                Tolak{' '}
                                {targetPenolakan.jenis ===
                                'booking'
                                    ? 'Booking'
                                    : 'Pembayaran'}
                            </h2>
                        </header>

                        <div className="p-4">
                            <Label
                                htmlFor="alasan_penolakan"
                                required
                            >
                                Alasan Penolakan
                            </Label>

                            <textarea
                                id="alasan_penolakan"
                                rows="5"
                                value={
                                    penolakanForm
                                        .data
                                        .alasan_penolakan
                                }
                                onChange={(
                                    event,
                                ) =>
                                    penolakanForm.setData(
                                        'alasan_penolakan',
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Jelaskan alasan penolakan minimal 10 karakter."
                                className={
                                    textareaClass
                                }
                            />

                            <FieldError
                                message={
                                    penolakanForm
                                        .errors
                                        .alasan_penolakan
                                }
                            />

                            <FieldError
                                message={
                                    penolakanForm
                                        .errors
                                        .kategori_penolakan
                                }
                            />
                        </div>

                        <footer className="flex justify-end gap-2 border-t border-slate-700 px-4 py-3">
                            <button
                                type="button"
                                disabled={
                                    penolakanForm.processing
                                }
                                onClick={
                                    tutupPenolakan
                                }
                                className="h-9 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    penolakanForm.processing
                                }
                                className="h-9 rounded-lg bg-rose-600 px-4 text-xs font-black text-white hover:bg-rose-500 disabled:opacity-50"
                            >
                                {penolakanForm.processing
                                    ? 'Memproses...'
                                    : 'Konfirmasi Penolakan'}
                            </button>
                        </footer>
                    </form>
                </div>
            )}
        </>
    );
}

KelolaBooking.layout = (page) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default KelolaBooking;
