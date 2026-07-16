import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useState,
} from 'react';

const informasiStatus = {
    belum_dibayar: {
        label: 'Menunggu Pembayaran',
        kelas:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
        judul: 'Selesaikan Pembayaran',
        keterangan:
            'Booking telah disetujui. Lakukan pembayaran sesuai nominal dan unggah bukti transfer.',
    },

    menunggu_verifikasi: {
        label: 'Menunggu Verifikasi',
        kelas:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        judul: 'Bukti Sedang Diperiksa',
        keterangan:
            'Bukti pembayaran sudah diterima dan sedang diperiksa oleh admin.',
    },

    ditolak: {
        label: 'Perlu Diperbaiki',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        judul: 'Unggah Ulang Bukti',
        keterangan:
            'Bukti sebelumnya belum dapat diverifikasi. Periksa keterangannya lalu unggah bukti baru.',
    },

    disetujui: {
        label: 'Pembayaran Disetujui',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        judul: 'Pembayaran Berhasil',
        keterangan:
            'Pembayaran telah diverifikasi. Booking Anda sudah masuk ke proses operasional.',
    },
};

const formatHarga = (nilai) =>
    Number(nilai ?? 0).toLocaleString(
        'id-ID',
    );

const formatTanggal = (nilai) => {
    if (!nilai) {
        return '-';
    }

    const tanggalNormal =
        String(nilai).split('T')[0];

    const tanggal = new Date(
        `${tanggalNormal}T00:00:00`,
    );

    if (Number.isNaN(tanggal.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(tanggal);
};

const formatTanggalWaktu = (nilai) => {
    if (!nilai) {
        return '-';
    }

    const tanggal = new Date(nilai);

    if (Number.isNaN(tanggal.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(tanggal);
};

/**
 * Mengubah seluruh variasi path gambar menjadi URL relatif.
 *
 * Contoh:
 * kendaraan/file.jpg
 * storage/kendaraan/file.jpg
 * /storage/kendaraan/file.jpg
 * http://localhost/storage/kendaraan/file.jpg
 *
 * Semuanya akan menjadi:
 * /storage/kendaraan/file.jpg
 */
const buatUrlGambar = (nilai) => {
    if (
        !nilai ||
        nilai === 'WALK_IN_CASH'
    ) {
        return null;
    }

    const value = String(nilai)
        .trim()
        .replace(/\\/g, '/');

    if (
        value.startsWith('blob:') ||
        value.startsWith('data:')
    ) {
        return value;
    }

    if (
        value.startsWith('http://') ||
        value.startsWith('https://')
    ) {
        try {
            const url = new URL(value);

            /*
             * Hanya mengambil pathname agar gambar
             * selalu memakai domain dan port aplikasi
             * yang sedang dibuka.
             */
            return url.pathname;
        } catch {
            return null;
        }
    }

    if (value.startsWith('/storage/')) {
        return value;
    }

    if (value.startsWith('storage/')) {
        return `/${value}`;
    }

    if (value.startsWith('/')) {
        return value;
    }

    return `/storage/${value}`;
};

function IkonStatus({
    status,
}) {
    if (status === 'disetujui') {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-7 w-7"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8 12 2.5 2.5L16 9"
                />
            </svg>
        );
    }

    if (status === 'ditolak') {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-7 w-7"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 9 6 6M15 9l-6 6"
                />
            </svg>
        );
    }

    if (
        status ===
        'menunggu_verifikasi'
    ) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />

                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7v5l3 2"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-7 w-7"
            aria-hidden="true"
        >
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9h18M7 15h3"
            />
        </svg>
    );
}

function IkonGambar() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-8 w-8"
            aria-hidden="true"
        >
            <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
            />

            <circle
                cx="9"
                cy="9"
                r="1.5"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4 17 5-5 3 3 2-2 6 5"
            />
        </svg>
    );
}

function GambarDenganFallback({
    src,
    alt,
    className = '',
    placeholder = 'Gambar tidak tersedia',
}) {
    const [gagal, setGagal] =
        useState(false);

    useEffect(() => {
        setGagal(false);
    }, [src]);

    if (!src || gagal) {
        return (
            <div
                className={`flex flex-col items-center justify-center text-center text-slate-600 ${className}`}
            >
                <IkonGambar />

                <p className="mt-2 text-xs">
                    {placeholder}
                </p>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() =>
                setGagal(true)
            }
            className={className}
        />
    );
}

function ModalGambar({
    gambar,
    onClose,
}) {
    if (!gambar) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-modal-gambar"
        >
            <section className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-[#10192B] shadow-2xl">
                <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#06B6D4]">
                            Pratinjau Gambar
                        </p>

                        <h2
                            id="judul-modal-gambar"
                            className="mt-0.5 truncate text-base font-black text-white"
                        >
                            {gambar.judul}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-xl font-bold text-slate-400 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300"
                        aria-label="Tutup gambar"
                    >
                        ×
                    </button>
                </header>

                <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/30 p-3 sm:p-5">
                    <GambarDenganFallback
                        src={gambar.src}
                        alt={gambar.alt}
                        placeholder="Gambar gagal dimuat"
                        className="max-h-[76vh] max-w-full rounded-lg object-contain"
                    />
                </div>

                <footer className="shrink-0 border-t border-slate-700 px-4 py-2.5 text-center text-[10px] text-slate-500">
                    Klik area gelap atau tekan
                    tombol Esc untuk menutup.
                </footer>
            </section>
        </div>
    );
}

export default function Pembayaran({
    pembayaran,
    informasiPembayaran = {},
    flash,
}) {
    const [tersalin, setTersalin] =
        useState(false);

    const [preview, setPreview] =
        useState(null);

    const [
        gambarTerbuka,
        setGambarTerbuka,
    ] = useState(null);

    const form = useForm({
        bukti_pembayaran: null,
    });

    const status =
        informasiStatus[
            pembayaran?.status_pembayaran
        ] ??
        informasiStatus.belum_dibayar;

    const urlFotoKendaraan =
        buatUrlGambar(
            pembayaran?.kendaraan
                ?.foto_kendaraan,
        );

    const urlBuktiPembayaran =
        buatUrlGambar(
            pembayaran?.bukti_pembayaran,
        );

    const durasiHari = useMemo(() => {
        if (
            !pembayaran?.tanggal_mulai ||
            !pembayaran?.tanggal_selesai
        ) {
            return 0;
        }

        const mulai = new Date(
            `${String(
                pembayaran.tanggal_mulai,
            ).split('T')[0]}T00:00:00`,
        );

        const selesai = new Date(
            `${String(
                pembayaran.tanggal_selesai,
            ).split('T')[0]}T00:00:00`,
        );

        const selisih =
            (selesai.getTime() -
                mulai.getTime()) /
            86400000;

        return selisih > 0
            ? Math.floor(selisih)
            : 1;
    }, [
        pembayaran?.tanggal_mulai,
        pembayaran?.tanggal_selesai,
    ]);

    const rekeningTerkonfigurasi =
        Boolean(
            informasiPembayaran?.nama_bank &&
                informasiPembayaran?.nomor_rekening &&
                informasiPembayaran?.atas_nama,
        );

    useEffect(() => {
        if (
            !form.data.bukti_pembayaran
        ) {
            setPreview(null);

            return undefined;
        }

        const url = URL.createObjectURL(
            form.data.bukti_pembayaran,
        );

        setPreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [
        form.data.bukti_pembayaran,
    ]);

    useEffect(() => {
        if (!gambarTerbuka) {
            document.body.style.overflow =
                '';

            return undefined;
        }

        document.body.style.overflow =
            'hidden';

        const tutupDenganEscape = (
            event,
        ) => {
            if (event.key === 'Escape') {
                setGambarTerbuka(null);
            }
        };

        window.addEventListener(
            'keydown',
            tutupDenganEscape,
        );

        return () => {
            document.body.style.overflow =
                '';

            window.removeEventListener(
                'keydown',
                tutupDenganEscape,
            );
        };
    }, [gambarTerbuka]);

    const bukaGambar = ({
        src,
        judul,
        alt,
    }) => {
        if (!src) {
            return;
        }

        setGambarTerbuka({
            src,
            judul,
            alt,
        });
    };

    const salinNomorRekening =
        async () => {
            if (
                !informasiPembayaran?.nomor_rekening
            ) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    informasiPembayaran.nomor_rekening,
                );

                setTersalin(true);

                window.setTimeout(
                    () =>
                        setTersalin(false),
                    1800,
                );
            } catch {
                setTersalin(false);
            }
        };

    const kirimBukti = (event) => {
        event.preventDefault();

        form.post(
            route(
                'pelanggan.sewa.pembayaran.unggah',
                pembayaran.id,
            ),
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    form.reset();
                },
            },
        );
    };

    return (
        <>
            <Head title="Pembayaran" />

            <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                            Pembayaran Booking
                        </p>

                        <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                            Detail Pembayaran
                        </h1>
                    </div>

                    <Link
                        href={route(
                            'pelanggan.riwayat',
                            {
                                sewa:
                                    pembayaran.id,
                            },
                        )}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-bold text-[#CBD5E1] transition hover:border-[#06B6D4] hover:text-[#06B6D4] sm:w-auto"
                    >
                        Kembali ke Riwayat
                    </Link>
                </div>

                {flash?.success && (
                    <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-300">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-300">
                        {flash.error}
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
                    <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#10192B] shadow-xl">
                        <div className="relative flex h-52 items-center justify-center border-b border-slate-800 bg-[#0B1120] p-4">
                            {urlFotoKendaraan ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        bukaGambar(
                                            {
                                                src: urlFotoKendaraan,

                                                judul:
                                                    pembayaran
                                                        ?.kendaraan
                                                        ?.nama_kendaraan ??
                                                    'Foto Kendaraan',

                                                alt:
                                                    pembayaran
                                                        ?.kendaraan
                                                        ?.nama_kendaraan ??
                                                    'Foto kendaraan',
                                            },
                                        )
                                    }
                                    className="group relative flex h-full w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-lg"
                                    aria-label="Perbesar foto kendaraan"
                                >
                                    <GambarDenganFallback
                                        src={
                                            urlFotoKendaraan
                                        }
                                        alt={
                                            pembayaran
                                                ?.kendaraan
                                                ?.nama_kendaraan ??
                                            'Foto kendaraan'
                                        }
                                        placeholder="Foto kendaraan tidak tersedia"
                                        className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.03]"
                                    />

                                    <span className="absolute bottom-2 right-2 rounded-lg border border-slate-600 bg-[#0B1120]/90 px-2.5 py-1 text-[9px] font-bold text-slate-300 opacity-0 backdrop-blur transition group-hover:opacity-100">
                                        Klik untuk
                                        memperbesar
                                    </span>
                                </button>
                            ) : (
                                <div className="text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#06B6D4]/10 text-[#06B6D4]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="h-9 w-9"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 13.5 5.5 8h13l2.5 5.5M5 13.5h14M6.5 17.5h.01M17.5 17.5h.01M5 13.5v5h2M19 13.5v5h-2"
                                            />
                                        </svg>
                                    </div>

                                    <p className="mt-3 text-xs text-slate-500">
                                        Foto belum
                                        tersedia
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#06B6D4]">
                                {
                                    pembayaran.nomor_booking
                                }
                            </p>

                            <h2 className="mt-2 text-xl font-extrabold text-white">
                                {pembayaran
                                    ?.kendaraan
                                    ?.nama_kendaraan ??
                                    'Kendaraan RentDrive'}
                            </h2>

                            <p className="mt-1 text-sm text-[#94A3B8]">
                                {pembayaran
                                    ?.kendaraan
                                    ?.merek ??
                                    'RentDrive'}
                            </p>

                            <div className="mt-5 space-y-3 border-t border-slate-800 pt-4 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[#64748B]">
                                        Tanggal sewa
                                    </span>

                                    <span className="text-right font-bold text-white">
                                        {formatTanggal(
                                            pembayaran.tanggal_mulai,
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[#64748B]">
                                        Tanggal
                                        selesai
                                    </span>

                                    <span className="text-right font-bold text-white">
                                        {formatTanggal(
                                            pembayaran.tanggal_selesai,
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[#64748B]">
                                        Durasi
                                    </span>

                                    <span className="font-bold text-white">
                                        {durasiHari}{' '}
                                        hari
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/10 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#06B6D4]">
                                    Total Pembayaran
                                </p>

                                <p className="mt-1 text-2xl font-black text-white">
                                    Rp{' '}
                                    {formatHarga(
                                        pembayaran.total_harga,
                                    )}
                                </p>
                            </div>
                        </div>
                    </aside>

                    <section className="space-y-5">
                        <div className="rounded-2xl border border-slate-800 bg-[#1E293B] p-5 shadow-xl sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex gap-3">
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${status.kelas}`}
                                    >
                                        <IkonStatus
                                            status={
                                                pembayaran.status_pembayaran
                                            }
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-extrabold text-white">
                                            {
                                                status.judul
                                            }
                                        </h2>

                                        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#94A3B8]">
                                            {
                                                status.keterangan
                                            }
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${status.kelas}`}
                                >
                                    {status.label}
                                </span>
                            </div>
                        </div>

                        {pembayaran.status_pembayaran ===
                            'ditolak' &&
                            pembayaran.alasan_penolakan && (
                                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-rose-300">
                                        Keterangan
                                        Admin
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-rose-100/80">
                                        {
                                            pembayaran.alasan_penolakan
                                        }
                                    </p>
                                </div>
                            )}

                        {pembayaran.dapat_mengunggah && (
                            <div className="rounded-2xl border border-slate-800 bg-[#10192B] p-5 shadow-xl sm:p-6">
                                <h2 className="text-lg font-extrabold text-white">
                                    Instruksi
                                    Pembayaran
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                                    Transfer sesuai
                                    total pembayaran,
                                    lalu unggah bukti
                                    yang jelas dan
                                    tidak terpotong.
                                </p>

                                {rekeningTerkonfigurasi ? (
                                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl border border-slate-700 bg-[#0B1120] p-4">
                                            <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                                Bank
                                            </p>

                                            <p className="mt-1 font-extrabold text-white">
                                                {
                                                    informasiPembayaran.nama_bank
                                                }
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-700 bg-[#0B1120] p-4 sm:col-span-2">
                                            <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                                Nomor Rekening
                                            </p>

                                            <div className="mt-1 flex items-center justify-between gap-3">
                                                <p className="break-all text-lg font-extrabold text-white">
                                                    {
                                                        informasiPembayaran.nomor_rekening
                                                    }
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        salinNomorRekening
                                                    }
                                                    className="shrink-0 rounded-lg border border-[#06B6D4]/40 px-3 py-1.5 text-xs font-bold text-[#06B6D4] hover:bg-[#06B6D4]/10"
                                                >
                                                    {tersalin
                                                        ? 'Tersalin'
                                                        : 'Salin'}
                                                </button>
                                            </div>

                                            <p className="mt-2 text-xs text-[#64748B]">
                                                Atas nama:{' '}
                                                <span className="font-bold text-[#CBD5E1]">
                                                    {
                                                        informasiPembayaran.atas_nama
                                                    }
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-200">
                                        Informasi rekening
                                        perusahaan belum
                                        dikonfigurasi.
                                        Hubungi admin
                                        sebelum melakukan
                                        transfer.
                                    </div>
                                )}

                                <div className="mt-5 rounded-xl border border-slate-700 bg-[#0B1120] p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                                        Catatan
                                    </p>

                                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[#94A3B8]">
                                        <li>
                                            • Bayar tepat
                                            sesuai nominal
                                            transaksi.
                                        </li>

                                        <li>
                                            • Gunakan format
                                            JPG, JPEG, PNG,
                                            atau WebP
                                            maksimal 2 MB.
                                        </li>

                                        <li>
                                            • Batas pembayaran{' '}
                                            {Number(
                                                informasiPembayaran.batas_waktu_jam ??
                                                    24,
                                            )}{' '}
                                            jam setelah
                                            booking
                                            disetujui.
                                        </li>
                                    </ul>
                                </div>

                                <form
                                    onSubmit={
                                        kirimBukti
                                    }
                                    className="mt-5"
                                >
                                    <label
                                        htmlFor="bukti_pembayaran"
                                        className="text-sm font-bold text-white"
                                    >
                                        Bukti Pembayaran
                                    </label>

                                    <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                                        <div>
                                            <input
                                                id="bukti_pembayaran"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'bukti_pembayaran',
                                                        event
                                                            .target
                                                            .files?.[0] ??
                                                            null,
                                                    )
                                                }
                                                className="block w-full rounded-xl border border-slate-700 bg-[#1E293B] px-3 py-2.5 text-xs text-[#94A3B8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#06B6D4] file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#0B1120]"
                                            />

                                            {form.errors
                                                .bukti_pembayaran && (
                                                <p className="mt-2 text-xs leading-5 text-rose-400">
                                                    {
                                                        form
                                                            .errors
                                                            .bukti_pembayaran
                                                    }
                                                </p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={
                                                    form.processing ||
                                                    !form
                                                        .data
                                                        .bukti_pembayaran
                                                }
                                                className="mt-4 w-full rounded-xl bg-[#06B6D4] px-5 py-3 text-sm font-bold text-[#0B1120] transition hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                            >
                                                {form.processing
                                                    ? 'Mengunggah...'
                                                    : pembayaran.status_pembayaran ===
                                                        'ditolak'
                                                      ? 'Kirim Ulang Bukti'
                                                      : 'Kirim Bukti Pembayaran'}
                                            </button>
                                        </div>

                                        <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-700 bg-[#0B1120] p-3">
                                            {preview ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        bukaGambar(
                                                            {
                                                                src: preview,
                                                                judul:
                                                                    'Pratinjau Bukti Pembayaran',
                                                                alt:
                                                                    'Pratinjau bukti pembayaran',
                                                            },
                                                        )
                                                    }
                                                    className="group flex h-full w-full cursor-zoom-in items-center justify-center"
                                                >
                                                    <img
                                                        src={
                                                            preview
                                                        }
                                                        alt="Pratinjau bukti pembayaran"
                                                        className="max-h-52 w-full object-contain transition group-hover:scale-[1.03]"
                                                    />
                                                </button>
                                            ) : (
                                                <div className="text-center">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        className="mx-auto h-9 w-9 text-slate-600"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M4 5h16v14H4zM7 15l3-3 2 2 2-2 3 3M8 9h.01"
                                                        />
                                                    </svg>

                                                    <p className="mt-2 text-xs text-slate-500">
                                                        Pratinjau
                                                        bukti
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {urlBuktiPembayaran && (
                            <div className="rounded-2xl border border-slate-800 bg-[#10192B] p-5 shadow-xl sm:p-6">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-extrabold text-white">
                                            Bukti Pembayaran
                                        </h2>

                                        <p className="mt-1 text-xs text-[#64748B]">
                                            Terakhir
                                            diperbarui:{' '}
                                            {formatTanggalWaktu(
                                                pembayaran.terakhir_diperbarui,
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            bukaGambar(
                                                {
                                                    src: urlBuktiPembayaran,

                                                    judul:
                                                        'Bukti Pembayaran',

                                                    alt: `Bukti pembayaran ${
                                                        pembayaran.nomor_booking ??
                                                        ''
                                                    }`,
                                                },
                                            )
                                        }
                                        className="inline-flex w-full items-center justify-center rounded-lg border border-[#06B6D4]/50 px-4 py-2 text-sm font-bold text-[#06B6D4] transition hover:bg-[#06B6D4]/10 sm:w-auto"
                                    >
                                        Buka Gambar
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        bukaGambar({
                                            src: urlBuktiPembayaran,

                                            judul:
                                                'Bukti Pembayaran',

                                            alt: `Bukti pembayaran ${
                                                pembayaran.nomor_booking ??
                                                ''
                                            }`,
                                        })
                                    }
                                    className="group mt-4 block w-full cursor-zoom-in overflow-hidden rounded-xl border border-slate-700 bg-[#0B1120]"
                                    aria-label="Perbesar bukti pembayaran"
                                >
                                    <div className="flex min-h-48 max-h-[420px] items-center justify-center p-4">
                                        <GambarDenganFallback
                                            src={
                                                urlBuktiPembayaran
                                            }
                                            alt="Bukti pembayaran"
                                            placeholder="Bukti pembayaran gagal dimuat"
                                            className="max-h-[380px] w-full object-contain transition duration-200 group-hover:scale-[1.02]"
                                        />
                                    </div>

                                    <div className="border-t border-slate-700 px-3 py-2 text-center text-[11px] font-bold text-slate-500 transition group-hover:text-[#06B6D4]">
                                        Klik gambar untuk
                                        memperbesar
                                    </div>
                                </button>
                            </div>
                        )}

                        {pembayaran.status_pembayaran ===
                            'disetujui' && (
                            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-extrabold text-emerald-200">
                                        Pembayaran sudah
                                        diverifikasi
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                                        Pantau proses
                                        penyewaan melalui
                                        halaman riwayat.
                                    </p>
                                </div>

                                <Link
                                    href={route(
                                        'pelanggan.riwayat',
                                        {
                                            sewa:
                                                pembayaran.id,
                                        },
                                    )}
                                    className="inline-flex w-full justify-center rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-300 sm:w-auto"
                                >
                                    Lihat Detail Booking
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <ModalGambar
                gambar={gambarTerbuka}
                onClose={() =>
                    setGambarTerbuka(null)
                }
            />
        </>
    );
}
