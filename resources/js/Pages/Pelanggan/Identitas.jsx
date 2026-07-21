import PelangganLayout from '@/Layouts/PelangganLayout';
import {
    Head,
    Link,
    useForm,
    usePage,
} from '@inertiajs/react';
import {
    useMemo,
    useState,
} from 'react';

const informasiStatus = {
    belum_dilengkapi: {
        label: 'Belum Dilengkapi',
        kelas:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
        pesan:
            'Lengkapi identitas pengguna kendaraan untuk booking ini.',
    },

    menunggu_verifikasi: {
        label: 'Menunggu Verifikasi',
        kelas:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        pesan:
            'Identitas booking sudah dikirim dan sedang diperiksa admin.',
    },

    terverifikasi: {
        label: 'Terverifikasi',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        pesan:
            'Identitas booking telah disetujui dan transaksi dapat dilanjutkan.',
    },

    ditolak: {
        label: 'Perlu Diperbaiki',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        pesan:
            'Perbaiki data atau dokumen sesuai keterangan admin.',
    },
};

function formatHarga(nilai) {
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
            month: 'long',
            year: 'numeric',
        },
    ).format(tanggal);
}

function formatWaktu(nilai) {
    if (!nilai) {
        return '-';
    }

    const tanggal = new Date(nilai);

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

function buatUrlFoto(nilai) {
    if (!nilai) {
        return null;
    }

    const lokasi =
        String(nilai).trim();

    if (
        lokasi.startsWith(
            'http://',
        ) ||
        lokasi.startsWith(
            'https://',
        )
    ) {
        try {
            const url = new URL(
                lokasi,
            );

            return url.pathname;
        } catch {
            return lokasi;
        }
    }

    if (
        lokasi.startsWith(
            '/storage/',
        ) ||
        lokasi.startsWith(
            '/images/',
        )
    ) {
        return lokasi;
    }

    const lokasiBersih =
        lokasi.replace(
            /^\/+/,
            '',
        );

    if (
        lokasiBersih.startsWith(
            'storage/',
        ) ||
        lokasiBersih.startsWith(
            'images/',
        )
    ) {
        return `/${lokasiBersih}`;
    }

    return `/storage/${lokasiBersih}`;
}

function IkonKendaraan() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-14 w-14 text-[#06B6D4]"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.5 5.5 8h13l2.5 5.5M5 13.5h14M6.5 17.5h.01M17.5 17.5h.01M5 13.5v5h2M19 13.5v5h-2"
            />
        </svg>
    );
}

function IkonPerisai() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9.5 12 1.7 1.7 3.6-4"
            />
        </svg>
    );
}

function IkonUnggah() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0-4 4m4-4 4 4M5 14v5h14v-5"
            />
        </svg>
    );
}

function FotoKendaraan({
    foto,
    nama,
}) {
    const [
        gagalDimuat,
        setGagalDimuat,
    ] = useState(false);

    if (
        !foto ||
        gagalDimuat
    ) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
                <IkonKendaraan />

                <p className="mt-2 text-xs text-slate-500">
                    Foto kendaraan
                </p>
            </div>
        );
    }

    return (
        <img
            src={foto}
            alt={nama}
            loading="lazy"
            onError={() =>
                setGagalDimuat(
                    true,
                )
            }
            className="h-full w-full object-contain p-4"
        />
    );
}

function LangkahProses({
    nomor,
    judul,
    aktif = false,
    selesai = false,
}) {
    const kelasNomor =
        selesai
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : aktif
              ? 'border-[#06B6D4] bg-[#06B6D4] text-[#0B1120]'
              : 'border-slate-700 bg-[#0B1120] text-slate-500';

    const kelasJudul =
        aktif || selesai
            ? 'text-white'
            : 'text-slate-500';

    return (
        <div className="flex min-w-0 items-center gap-2">
            <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-black ${kelasNomor}`}
            >
                {selesai
                    ? '✓'
                    : nomor}
            </span>

            <span
                className={`truncate text-[10px] font-bold uppercase tracking-wider ${kelasJudul}`}
            >
                {judul}
            </span>
        </div>
    );
}

function InputError({
    pesan,
}) {
    if (!pesan) {
        return null;
    }

    return (
        <p className="mt-1.5 text-xs leading-5 text-rose-400">
            {pesan}
        </p>
    );
}

function TextField({
    id,
    label,
    value,
    onChange,
    error,
    placeholder,
    type = 'text',
    maxLength,
    inputMode,
    autoComplete = 'off',
    helper,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-bold text-slate-300"
            >
                {label}
            </label>

            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={
                    onChange
                }
                placeholder={
                    placeholder
                }
                maxLength={
                    maxLength
                }
                inputMode={
                    inputMode
                }
                autoComplete={
                    autoComplete
                }
                className="h-11 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
            />

            {helper && (
                <p className="mt-1 text-[10px] leading-4 text-slate-600">
                    {helper}
                </p>
            )}

            <InputError
                pesan={error}
            />
        </div>
    );
}

function FileInput({
    id,
    label,
    keterangan,
    memilikiFile,
    file,
    error,
    onChange,
}) {
    const namaFile =
        file?.name ?? null;

    return (
        <div className="rounded-xl border border-slate-700 bg-[#0B1120] p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <label
                        htmlFor={id}
                        className="block text-sm font-bold text-white"
                    >
                        {label}
                    </label>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {keterangan}
                    </p>
                </div>

                {memilikiFile &&
                    !namaFile && (
                        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                            Tersimpan
                        </span>
                    )}
            </div>

            <label
                htmlFor={id}
                className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 bg-[#1E293B] px-4 py-4 text-center text-xs font-bold text-slate-300 transition hover:border-[#06B6D4] hover:text-[#06B6D4]"
            >
                <IkonUnggah />

                <span>
                    {namaFile
                        ? 'Ganti file'
                        : memilikiFile
                          ? 'Pilih file pengganti'
                          : 'Pilih file'}
                </span>
            </label>

            <input
                id={id}
                name={id}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={
                    onChange
                }
                className="sr-only"
            />

            {namaFile && (
                <div className="mt-3 rounded-lg border border-[#06B6D4]/20 bg-[#06B6D4]/5 px-3 py-2">
                    <p className="truncate text-xs font-medium text-[#06B6D4]">
                        {namaFile}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                        {(
                            Number(
                                file?.size ??
                                    0,
                            ) /
                            1024 /
                            1024
                        ).toFixed(
                            2,
                        )}{' '}
                        MB
                    </p>
                </div>
            )}

            <InputError
                pesan={error}
            />
        </div>
    );
}

function Identitas({
    sewa,
    identitas,
    boleh_mengirim = false,
}) {
    const {
        flash = {},
    } = usePage().props;

    const fotoKendaraan =
        buatUrlFoto(
            sewa?.kendaraan
                ?.foto_kendaraan,
        );

    const form = useForm({
        nama_pengguna:
            identitas
                ?.nama_pengguna ??
            '',


        no_telepon:
            identitas
                ?.no_telepon ??
            '',

        alamat:
            identitas
                ?.alamat ??
            '',

        dokumen_ktp:
            null,

        dokumen_sim:
            null,

        persetujuan_privasi:
            false,
    });

    const status =
        informasiStatus[
            identitas?.status
        ] ??
        informasiStatus
            .belum_dilengkapi;

    const rentangTanggal =
        useMemo(() => {
            return `${formatTanggal(
                sewa?.tanggal_mulai,
            )} — ${formatTanggal(
                sewa?.tanggal_selesai,
            )}`;
        }, [
            sewa?.tanggal_mulai,
            sewa?.tanggal_selesai,
        ]);

    const sedangMenungguVerifikasi =
        sewa?.status ===
            'menunggu_verifikasi_identitas' ||
        identitas?.status ===
            'menunggu_verifikasi';

    const identitasDitolak =
        sewa?.status ===
            'identitas_ditolak' ||
        identitas?.status ===
            'ditolak';

    const kirimIdentitas = (
        event,
    ) => {
        event.preventDefault();

        if (
            !sewa?.id ||
            form.processing
        ) {
            return;
        }

        form.post(
            route(
                'pelanggan.identitas.store',
                sewa.id,
            ),
            {
                forceFormData:
                    true,

                preserveScroll:
                    true,

                onSuccess: () => {
                    form.reset(
                        'dokumen_ktp',
                        'dokumen_sim',
                        'persetujuan_privasi',
                    );
                },
            },
        );
    };

    return (
        <>
            <Head title="Verifikasi Identitas Booking" />

            <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {flash?.success && (
                    <div
                        role="status"
                        className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-300"
                    >
                        {
                            flash.success
                        }
                    </div>
                )}

                {flash?.error && (
                    <div
                        role="alert"
                        className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-300"
                    >
                        {
                            flash.error
                        }
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#10192B] shadow-xl">
                    <header className="border-b border-slate-800 px-5 py-5 sm:px-7 sm:py-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                    Identitas
                                    Khusus
                                    Transaksi
                                </p>

                                <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                    Verifikasi
                                    Identitas
                                    Booking
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                                    Isi data
                                    orang yang
                                    akan
                                    menggunakan
                                    kendaraan.
                                    Identitas
                                    wajib
                                    dikirim
                                    kembali
                                    pada setiap
                                    booking.
                                </p>
                            </div>

                            <span
                                className={`w-fit rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${status.kelas}`}
                            >
                                {
                                    status.label
                                }
                            </span>
                        </div>

                        <div className="mt-5 grid gap-3 rounded-xl border border-slate-800 bg-[#0B1120] p-4 sm:grid-cols-3">
                            <LangkahProses
                                nomor="1"
                                judul="Booking"
                                selesai
                            />

                            <LangkahProses
                                nomor="2"
                                judul="Identitas"
                                aktif
                                selesai={
                                    identitas?.status ===
                                    'terverifikasi'
                                }
                            />

                            <LangkahProses
                                nomor="3"
                                judul="Pembayaran"
                            />
                        </div>
                    </header>

                    <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
                        <aside className="border-b border-slate-800 bg-[#0B1120] lg:border-b-0 lg:border-r">
                            <div className="aspect-[16/10] border-b border-slate-800 bg-[#10192B] lg:aspect-square">
                                <FotoKendaraan
                                    foto={
                                        fotoKendaraan
                                    }
                                    nama={
                                        sewa
                                            ?.kendaraan
                                            ?.nama_kendaraan ??
                                        'Kendaraan RentDrive'
                                    }
                                />
                            </div>

                            <div className="p-5">
                                <p className="break-all text-[10px] font-bold uppercase tracking-[0.16em] text-[#06B6D4]">
                                    {sewa?.nomor_booking ??
                                        'Nomor booking'}
                                </p>

                                <h2 className="mt-2 text-xl font-extrabold text-white">
                                    {sewa
                                        ?.kendaraan
                                        ?.nama_kendaraan ??
                                        'Kendaraan RentDrive'}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    {sewa
                                        ?.kendaraan
                                        ?.merek ??
                                        'RentDrive'}
                                </p>

                                <div className="mt-5 space-y-4 border-t border-slate-800 pt-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            Jadwal
                                            sewa
                                        </p>

                                        <p className="mt-1.5 text-sm font-bold leading-6 text-white">
                                            {
                                                rentangTanggal
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            Total
                                            booking
                                        </p>

                                        <p className="mt-1.5 text-lg font-black text-[#06B6D4]">
                                            Rp{' '}
                                            {formatHarga(
                                                sewa?.total_harga,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={route(
                                        'pelanggan.riwayat',
                                    )}
                                    className="mt-5 block rounded-lg border border-slate-700 px-4 py-2.5 text-center text-xs font-bold text-slate-300 transition hover:border-[#06B6D4] hover:text-[#06B6D4]"
                                >
                                    Kembali ke
                                    Riwayat
                                </Link>
                            </div>
                        </aside>

                        <section className="min-w-0 p-4 sm:p-6">
                            <div
                                className={`rounded-xl border px-4 py-3 ${status.kelas}`}
                            >
                                <p className="text-sm font-bold">
                                    {
                                        status.label
                                    }
                                </p>

                                <p className="mt-1 text-xs leading-5 opacity-80">
                                    {
                                        status.pesan
                                    }
                                </p>
                            </div>

                            <div className="mt-4 rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/5 px-4 py-3">
                                <p className="text-xs font-bold text-[#06B6D4]">
                                    Identitas
                                    berlaku hanya
                                    untuk booking
                                    ini
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Dokumen dari
                                    transaksi
                                    sebelumnya
                                    tidak dipakai
                                    secara
                                    otomatis.
                                    Pengguna
                                    kendaraan
                                    boleh berbeda
                                    dari pemilik
                                    akun.
                                </p>
                            </div>

                            {identitasDitolak &&
                                identitas
                                    ?.alasan_penolakan && (
                                    <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-300">
                                            Keterangan
                                            Admin
                                        </p>

                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-rose-100/80">
                                            {
                                                identitas.alasan_penolakan
                                            }
                                        </p>
                                    </div>
                                )}

                            {sedangMenungguVerifikasi && (
                                <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-4">
                                    <p className="text-sm font-bold text-sky-300">
                                        Dokumen
                                        sedang
                                        diperiksa
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-sky-100/70">
                                        Admin akan
                                        memeriksa
                                        nama
                                        pengguna,
                                        NIK, nomor
                                        SIM,
                                        telepon,
                                        alamat, KTP,
                                        dan SIM.
                                    </p>

                                    {identitas?.dikirim_pada && (
                                        <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-sky-300/70">
                                            Dikirim{' '}
                                            {formatWaktu(
                                                identitas.dikirim_pada,
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}

                            {form.errors
                                ?.identitas && (
                                <div
                                    role="alert"
                                    className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                                >
                                    {
                                        form
                                            .errors
                                            .identitas
                                    }
                                </div>
                            )}

                            {boleh_mengirim ? (
                                <form
                                    onSubmit={
                                        kirimIdentitas
                                    }
                                    className="mt-5 space-y-5"
                                >
                                    <div>
                                        <h2 className="text-lg font-extrabold text-white">
                                            Data
                                            Pengguna
                                            Kendaraan
                                        </h2>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Isi data
                                            sesuai
                                            KTP dan
                                            SIM yang
                                            diunggah
                                            untuk
                                            booking
                                            ini.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <TextField
                                            id="nama_pengguna"
                                            label="Nama Lengkap Pengguna"
                                            value={
                                                form
                                                    .data
                                                    .nama_pengguna
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'nama_pengguna',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            error={
                                                form
                                                    .errors
                                                    .nama_pengguna
                                            }
                                            placeholder="Nama sesuai KTP"
                                            maxLength={
                                                150
                                            }
                                            autoComplete="name"
                                        />  
                                        <TextField
                                            id="no_telepon"
                                            label="Nomor Telepon Pengguna"
                                            value={
                                                form
                                                    .data
                                                    .no_telepon
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'no_telepon',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            error={
                                                form
                                                    .errors
                                                    .no_telepon
                                            }
                                            placeholder="Contoh: 081234567890"
                                            type="tel"
                                            maxLength={
                                                20
                                            }
                                            inputMode="tel"
                                            autoComplete="tel"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="alamat"
                                            className="mb-1.5 block text-xs font-bold text-slate-300"
                                        >
                                            Alamat
                                            Lengkap
                                            Pengguna
                                        </label>

                                        <textarea
                                            id="alamat"
                                            name="alamat"
                                            rows="4"
                                            value={
                                                form
                                                    .data
                                                    .alamat
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'alamat',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Masukkan alamat lengkap sesuai identitas pengguna kendaraan"
                                            maxLength={
                                                1000
                                            }
                                            className="w-full resize-none rounded-lg border border-slate-700 bg-[#0B1120] px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                        />

                                        <div className="mt-1 flex items-start justify-between gap-3">
                                            <InputError
                                                pesan={
                                                    form
                                                        .errors
                                                        .alamat
                                                }
                                            />

                                            <span className="ml-auto shrink-0 text-[10px] text-slate-600">
                                                {
                                                    form
                                                        .data
                                                        .alamat
                                                        .length
                                                }
                                                /1000
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-slate-700 bg-[#0B1120] px-4 py-3">
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 shrink-0 text-[#06B6D4]">
                                                <IkonPerisai />
                                            </span>

                                            <div>
                                                <p className="text-xs font-bold text-white">
                                                    Keamanan
                                                    Dokumen
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    Dokumen
                                                    disimpan
                                                    secara
                                                    privat dan
                                                    hanya dapat
                                                    diperiksa
                                                    oleh admin.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-extrabold text-white">
                                            Dokumen
                                            Identitas
                                            Booking
                                        </h2>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            KTP dan
                                            SIM wajib
                                            diunggah
                                            kembali
                                            untuk
                                            setiap
                                            booking
                                            baru.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FileInput
                                            id="dokumen_ktp"
                                            label="Foto KTP"
                                            keterangan="Gunakan KTP pengguna kendaraan. JPG, PNG, atau WebP maksimal 3 MB."
                                            memilikiFile={Boolean(
                                                identitas?.memiliki_ktp,
                                            )}
                                            file={
                                                form
                                                    .data
                                                    .dokumen_ktp
                                            }
                                            error={
                                                form
                                                    .errors
                                                    .dokumen_ktp
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
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
                                            keterangan="Gunakan SIM pengguna kendaraan. JPG, PNG, atau WebP maksimal 3 MB."
                                            memilikiFile={Boolean(
                                                identitas?.memiliki_sim,
                                            )}
                                            file={
                                                form
                                                    .data
                                                    .dokumen_sim
                                            }
                                            error={
                                                form
                                                    .errors
                                                    .dokumen_sim
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'dokumen_sim',
                                                    event
                                                        .target
                                                        .files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-[#0B1120] p-4 transition hover:border-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    form
                                                        .data
                                                        .persetujuan_privasi
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'persetujuan_privasi',
                                                        event
                                                            .target
                                                            .checked,
                                                    )
                                                }
                                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-[#1E293B] text-[#06B6D4] focus:ring-[#06B6D4]"
                                            />

                                            <span className="text-xs leading-5 text-slate-400">
                                                Saya
                                                menyetujui
                                                penggunaan
                                                nama, NIK,
                                                nomor SIM,
                                                telepon,
                                                alamat,
                                                KTP, dan
                                                SIM untuk
                                                verifikasi
                                                booking ini.
                                            </span>
                                        </label>

                                        <InputError
                                            pesan={
                                                form
                                                    .errors
                                                    .persetujuan_privasi
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-center text-[10px] leading-5 text-slate-600 sm:max-w-sm sm:text-left">
                                            Setelah
                                            dikirim,
                                            data hanya
                                            dapat
                                            diperbaiki
                                            apabila
                                            ditolak
                                            oleh admin.
                                        </p>

                                        <button
                                            type="submit"
                                            disabled={
                                                form.processing
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#06B6D4] px-5 py-3 text-sm font-black text-[#0B1120] transition hover:bg-[#22D3EE] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <IkonUnggah />

                                            {form.processing
                                                ? 'Mengirim...'
                                                : identitasDitolak
                                                  ? 'Kirim Ulang Identitas'
                                                  : 'Kirim untuk Diverifikasi'}
                                        </button>
                                    </div>

                                    {form.progress && (
                                        <div className="overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-2 rounded-full bg-[#06B6D4] transition-all"
                                                style={{
                                                    width: `${form.progress.percentage}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <div className="mt-5 rounded-xl border border-slate-800 bg-[#0B1120] px-5 py-8 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#06B6D4]">
                                        <IkonPerisai />
                                    </div>

                                    <h2 className="mt-4 text-lg font-extrabold text-white">
                                        Identitas
                                        booking
                                        sudah
                                        dikirim
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                        Tunggu
                                        hingga admin
                                        selesai
                                        memeriksa
                                        dokumen
                                        untuk
                                        booking ini.
                                    </p>

                                    <Link
                                        href={route(
                                            'pelanggan.riwayat',
                                        )}
                                        className="mt-5 inline-flex rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:border-[#06B6D4] hover:text-[#06B6D4]"
                                    >
                                        Lihat
                                        Riwayat
                                        Sewa
                                    </Link>
                                </div>
                            )}
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}

Identitas.layout = (
    page,
) => (
    <PelangganLayout>
        {page}
    </PelangganLayout>
);

export default Identitas;
