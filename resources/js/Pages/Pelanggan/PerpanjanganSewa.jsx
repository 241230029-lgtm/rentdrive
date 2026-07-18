import PelangganLayout from '@/Layouts/PelangganLayout';
import {
    Head,
    Link,
    useForm,
    usePage,
} from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useState,
} from 'react';

const STATUS_PERPANJANGAN = {
    menunggu_persetujuan: {
        label: 'Menunggu Persetujuan',
        className:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        description:
            'Permintaan sedang diperiksa oleh admin.',
    },

    menunggu_pembayaran: {
        label: 'Menunggu Pembayaran',
        className:
            'border-violet-500/30 bg-violet-500/10 text-violet-300',
        description:
            'Permintaan disetujui. Selesaikan pembayaran biaya tambahan.',
    },

    menunggu_verifikasi_pembayaran: {
        label: 'Verifikasi Pembayaran',
        className:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        description:
            'Bukti pembayaran sedang diperiksa oleh admin.',
    },

    pembayaran_ditolak: {
        label: 'Pembayaran Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        description:
            'Bukti pembayaran perlu diperbaiki dan dikirim ulang.',
    },

    selesai: {
        label: 'Perpanjangan Selesai',
        className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        description:
            'Pembayaran disetujui dan tanggal selesai baru telah diterapkan.',
    },

    ditolak: {
        label: 'Pengajuan Ditolak',
        className:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        description:
            'Permintaan perpanjangan belum dapat disetujui.',
    },

    disetujui: {
        label: 'Menunggu Pembayaran',
        className:
            'border-violet-500/30 bg-violet-500/10 text-violet-300',
        description:
            'Permintaan telah disetujui dan menunggu pembayaran.',
    },
};

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-xs font-semibold text-white outline-none transition focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10';

const textareaClass =
    'w-full resize-none rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-xs font-semibold leading-5 text-white outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10';

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

function tambahSatuHari(value) {
    if (!value) {
        return '';
    }

    const date =
        new Date(
            `${value}T00:00:00`,
        );

    date.setDate(
        date.getDate() + 1,
    );

    const local =
        new Date(
            date.getTime() -
                date.getTimezoneOffset() *
                    60000,
        );

    return local
        .toISOString()
        .split('T')[0];
}

function hitungSelisihHari(
    tanggalAwal,
    tanggalAkhir,
) {
    if (
        !tanggalAwal ||
        !tanggalAkhir
    ) {
        return 0;
    }

    const awal =
        new Date(
            `${tanggalAwal}T00:00:00`,
        );

    const akhir =
        new Date(
            `${tanggalAkhir}T00:00:00`,
        );

    const selisih =
        akhir.getTime() -
        awal.getTime();

    if (
        !Number.isFinite(
            selisih,
        ) ||
        selisih <= 0
    ) {
        return 0;
    }

    return Math.round(
        selisih / 86400000,
    );
}

function buatUrlFoto(path) {
    if (!path) {
        return null;
    }

    const value =
        String(path).trim();

    if (
        value.startsWith('/') ||
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('blob:')
    ) {
        return value;
    }

    return `/storage/${value}`;
}

function InfoCard({
    label,
    value,
    valueClass = 'text-white',
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-3">
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

function InputError({
    message,
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1.5 text-[11px] leading-5 text-rose-400">
            {message}
        </p>
    );
}

function BadgeStatus({
    status,
}) {
    const info =
        STATUS_PERPANJANGAN[
            status
        ] ?? {
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
            className={`inline-flex rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${info.className}`}
        >
            {info.label}
        </span>
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

        const handler = (
            event,
        ) => {
            if (
                event.key ===
                'Escape'
            ) {
                onClose();
            }
        };

        const overflow =
            document.body.style
                .overflow;

        document.body.style.overflow =
            'hidden';

        window.addEventListener(
            'keydown',
            handler,
        );

        return () => {
            document.body.style.overflow =
                overflow;

            window.removeEventListener(
                'keydown',
                handler,
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
                            Bukti Pembayaran
                        </p>

                        <h2 className="mt-1 text-sm font-black text-white">
                            Pembayaran Perpanjangan
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-xl text-slate-400 hover:border-rose-400 hover:text-rose-300"
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

export default function PerpanjanganSewa({
    sewa,
    perpanjanganTerakhir = null,
    bolehMengajukan = false,
    memilikiDendaBelumLunas = false,
    alasanTidakDapatMengajukan = null,
}) {
    const {
        flash = {},
        errors = {},
    } = usePage().props;

    const pengajuanForm =
        useForm({
            tanggal_selesai_baru:
                '',

            alasan_pengajuan:
                '',
        });

    const pembayaranForm =
        useForm({
            metode_pembayaran:
                'transfer',

            bukti_pembayaran:
                null,
        });

    const [
        konfirmasiTerbuka,
        setKonfirmasiTerbuka,
    ] = useState(false);

    const [
        modalBukti,
        setModalBukti,
    ] = useState(null);

    const [
        previewBukti,
        setPreviewBukti,
    ] = useState(null);

    const tanggalMinimum =
        useMemo(
            () =>
                tambahSatuHari(
                    sewa?.tanggal_selesai,
                ),
            [
                sewa?.tanggal_selesai,
            ],
        );

    const jumlahHariTambahan =
        useMemo(
            () =>
                hitungSelisihHari(
                    sewa?.tanggal_selesai,
                    pengajuanForm
                        .data
                        .tanggal_selesai_baru,
                ),
            [
                sewa?.tanggal_selesai,
                pengajuanForm
                    .data
                    .tanggal_selesai_baru,
            ],
        );

    const hargaPerHari =
        Number(
            sewa?.kendaraan
                ?.harga_per_hari ??
                0,
        );

    const biayaTambahan =
        jumlahHariTambahan *
        hargaPerHari;

    const statusPerpanjangan =
        perpanjanganTerakhir
            ?.status ??
        null;

    const infoStatus =
        statusPerpanjangan
            ? STATUS_PERPANJANGAN[
                  statusPerpanjangan
              ]
            : null;

    const perluMembayar =
        Boolean(
            perpanjanganTerakhir
                ?.boleh_membayar,
        );

    const sedangDiverifikasi =
        statusPerpanjangan ===
        'menunggu_verifikasi_pembayaran';

    const prosesSelesai =
        statusPerpanjangan ===
        'selesai';

    useEffect(() => {
        return () => {
            if (previewBukti) {
                URL.revokeObjectURL(
                    previewBukti,
                );
            }
        };
    }, [previewBukti]);

    const pilihBukti = (
        event,
    ) => {
        const file =
            event.target
                .files?.[0] ??
            null;

        pembayaranForm.setData(
            'bukti_pembayaran',
            file,
        );

        pembayaranForm.clearErrors(
            'bukti_pembayaran',
        );

        if (previewBukti) {
            URL.revokeObjectURL(
                previewBukti,
            );
        }

        setPreviewBukti(
            file
                ? URL.createObjectURL(
                      file,
                  )
                : null,
        );
    };

    const bukaKonfirmasiPengajuan = (
        event,
    ) => {
        event.preventDefault();

        pengajuanForm.clearErrors();

        if (
            !pengajuanForm.data
                .tanggal_selesai_baru
        ) {
            pengajuanForm.setError(
                'tanggal_selesai_baru',
                'Tanggal selesai baru wajib dipilih.',
            );

            return;
        }

        if (
            jumlahHariTambahan < 1
        ) {
            pengajuanForm.setError(
                'tanggal_selesai_baru',
                'Tanggal selesai baru harus setelah tanggal selesai saat ini.',
            );

            return;
        }

        if (
            jumlahHariTambahan > 30
        ) {
            pengajuanForm.setError(
                'tanggal_selesai_baru',
                'Perpanjangan maksimal 30 hari.',
            );

            return;
        }

        if (
            pengajuanForm.data
                .alasan_pengajuan
                .trim()
                .length < 10
        ) {
            pengajuanForm.setError(
                'alasan_pengajuan',
                'Alasan pengajuan minimal 10 karakter.',
            );

            return;
        }

        setKonfirmasiTerbuka(
            true,
        );
    };

    const kirimPengajuan =
        () => {
            setKonfirmasiTerbuka(
                false,
            );

            pengajuanForm.post(
                route(
                    'pelanggan.perpanjangan.store',
                    sewa.id,
                ),
                {
                    preserveScroll:
                        true,

                    onSuccess:
                        () => {
                            pengajuanForm.reset();
                        },
                },
            );
        };

    const kirimPembayaran = (
        event,
    ) => {
        event.preventDefault();

        if (
            !pembayaranForm
                .data
                .bukti_pembayaran
        ) {
            pembayaranForm.setError(
                'bukti_pembayaran',
                'Bukti pembayaran wajib dipilih.',
            );

            return;
        }

        if (
            !window.confirm(
                `Kirim pembayaran perpanjangan sebesar Rp ${formatRupiah(
                    perpanjanganTerakhir
                        ?.biaya_tambahan,
                )}?`,
            )
        ) {
            return;
        }

        pembayaranForm.post(
            route(
                'pelanggan.perpanjangan.pembayaran',
                perpanjanganTerakhir.id,
            ),
            {
                forceFormData:
                    true,

                preserveScroll:
                    true,

                onSuccess:
                    () => {
                        pembayaranForm.reset();

                        if (
                            previewBukti
                        ) {
                            URL.revokeObjectURL(
                                previewBukti,
                            );
                        }

                        setPreviewBukti(
                            null,
                        );
                    },
            },
        );
    };

    const daftarError =
        Object.values(
            errors ?? {},
        ).flat();

    return (
        <>
            <Head title="Perpanjangan Rental" />

            <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                            Transaksi Rental
                        </p>

                        <h1 className="mt-1 text-2xl font-black text-white">
                            Perpanjangan Rental
                        </h1>

                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                            Ajukan tambahan durasi,
                            selesaikan pembayaran,
                            dan pantau prosesnya.
                        </p>
                    </div>

                    <Link
                        href={route(
                            'pelanggan.riwayat',
                            {
                                sewa:
                                    sewa?.id,
                            },
                        )}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 px-4 text-xs font-black text-slate-300 hover:border-[#06B6D4] hover:text-[#06B6D4]"
                    >
                        Kembali ke Riwayat
                    </Link>
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

                <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-3">
                        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#10192B]">
                            <header className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                        Detail Transaksi
                                    </p>

                                    <h2 className="mt-1 text-base font-black text-white">
                                        {sewa
                                            ?.nomor_booking ??
                                            '-'}
                                    </h2>
                                </div>

                                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[9px] font-black uppercase text-cyan-300">
                                    {String(
                                        sewa?.status ??
                                            '-',
                                    ).replaceAll(
                                        '_',
                                        ' ',
                                    )}
                                </span>
                            </header>

                            <div className="p-4">
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-[#0B1120] sm:w-40">
                                        {sewa
                                            ?.kendaraan
                                            ?.foto_kendaraan ? (
                                            <img
                                                src={buatUrlFoto(
                                                    sewa
                                                        .kendaraan
                                                        .foto_kendaraan,
                                                )}
                                                alt={
                                                    sewa
                                                        .kendaraan
                                                        .nama_kendaraan
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl opacity-30">
                                                🚗
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-black text-white">
                                            {sewa
                                                ?.kendaraan
                                                ?.nama_kendaraan ??
                                                'Kendaraan'}
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {sewa
                                                ?.kendaraan
                                                ?.merek ??
                                                '-'}
                                        </p>

                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <InfoCard
                                                label="Mulai Rental"
                                                value={formatTanggal(
                                                    sewa
                                                        ?.tanggal_mulai,
                                                )}
                                            />

                                            <InfoCard
                                                label="Selesai Saat Ini"
                                                value={formatTanggal(
                                                    sewa
                                                        ?.tanggal_selesai,
                                                )}
                                            />

                                            <InfoCard
                                                label="Harga per Hari"
                                                value={`Rp ${formatRupiah(
                                                    hargaPerHari,
                                                )}`}
                                                valueClass="text-[#06B6D4]"
                                            />

                                            <InfoCard
                                                label="Total Sewa Saat Ini"
                                                value={`Rp ${formatRupiah(
                                                    sewa
                                                        ?.total_harga,
                                                )}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {perpanjanganTerakhir && (
                            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#10192B]">
                                <header className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                            Pengajuan Terakhir
                                        </p>

                                        <h2 className="mt-1 text-sm font-black text-white">
                                            Riwayat Perpanjangan
                                        </h2>
                                    </div>

                                    <BadgeStatus
                                        status={
                                            statusPerpanjangan
                                        }
                                    />
                                </header>

                                <div className="p-4">
                                    <p className="rounded-lg border border-slate-800 bg-[#0B1120] px-3 py-2.5 text-xs leading-5 text-slate-400">
                                        {infoStatus
                                            ?.description ??
                                            'Status pengajuan sedang diproses.'}
                                    </p>

                                    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                                        <InfoCard
                                            label="Tanggal Lama"
                                            value={formatTanggal(
                                                perpanjanganTerakhir
                                                    .tanggal_selesai_lama,
                                            )}
                                        />

                                        <InfoCard
                                            label="Tanggal Baru"
                                            value={formatTanggal(
                                                perpanjanganTerakhir
                                                    .tanggal_selesai_baru,
                                            )}
                                            valueClass="text-violet-300"
                                        />

                                        <InfoCard
                                            label="Tambahan"
                                            value={`${Number(
                                                perpanjanganTerakhir
                                                    .jumlah_hari_tambahan ??
                                                    0,
                                            )} hari`}
                                        />

                                        <InfoCard
                                            label="Biaya Tambahan"
                                            value={`Rp ${formatRupiah(
                                                perpanjanganTerakhir
                                                    .biaya_tambahan,
                                            )}`}
                                            valueClass="text-[#06B6D4]"
                                        />
                                    </div>

                                    <div className="mt-3 rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                            Alasan Pengajuan
                                        </p>

                                        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-300">
                                            {perpanjanganTerakhir
                                                .alasan_pengajuan}
                                        </p>
                                    </div>

                                    {perpanjanganTerakhir
                                        .alasan_penolakan && (
                                        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                                Alasan Pengajuan Ditolak
                                            </p>

                                            <p className="mt-2 text-xs leading-5 text-rose-100/80">
                                                {
                                                    perpanjanganTerakhir
                                                        .alasan_penolakan
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {perpanjanganTerakhir
                                        .alasan_penolakan_pembayaran && (
                                        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                            <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                                Alasan Pembayaran Ditolak
                                            </p>

                                            <p className="mt-2 text-xs leading-5 text-rose-100/80">
                                                {
                                                    perpanjanganTerakhir
                                                        .alasan_penolakan_pembayaran
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {perluMembayar && (
                            <form
                                onSubmit={
                                    kirimPembayaran
                                }
                                className="overflow-hidden rounded-2xl border border-violet-500/30 bg-[#10192B]"
                            >
                                <header className="border-b border-slate-800 px-4 py-3">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-violet-300">
                                        Pembayaran Perpanjangan
                                    </p>

                                    <h2 className="mt-1 text-base font-black text-white">
                                        Lanjutkan Pembayaran
                                    </h2>

                                    <p className="mt-1 text-[10px] text-slate-500">
                                        Bayar biaya tambahan agar
                                        tanggal selesai baru dapat diterapkan.
                                    </p>
                                </header>

                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <InfoCard
                                            label="Nominal Pembayaran"
                                            value={`Rp ${formatRupiah(
                                                perpanjanganTerakhir
                                                    .biaya_tambahan,
                                            )}`}
                                            valueClass="text-violet-300"
                                        />

                                        <InfoCard
                                            label="Metode"
                                            value="Transfer"
                                        />
                                    </div>

                                    <div className="mt-3 rounded-xl border border-slate-800 bg-[#0B1120] p-4">
                                        <p className="text-xs font-black text-white">
                                            Rekening Pembayaran Dummy
                                        </p>

                                        <p className="mt-2 text-sm font-black text-[#06B6D4]">
                                            Bank RentDrive
                                        </p>

                                        <p className="mt-1 text-lg font-black text-white">
                                            1234 5678 9000
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-500">
                                            Atas nama RentDrive Rental
                                        </p>
                                    </div>

                                    <div className="mt-3">
                                        <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500">
                                            Bukti Pembayaran
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={
                                                pilihBukti
                                            }
                                            className="block w-full rounded-lg border border-slate-700 bg-[#0B1120] p-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-[#06B6D4] file:px-3 file:py-2 file:text-xs file:font-black file:text-[#0B1120]"
                                        />

                                        <InputError
                                            message={
                                                pembayaranForm
                                                    .errors
                                                    .bukti_pembayaran
                                            }
                                        />
                                    </div>

                                    {previewBukti && (
                                        <div className="mt-3 overflow-hidden rounded-xl border border-slate-700 bg-[#0B1120]">
                                            <img
                                                src={
                                                    previewBukti
                                                }
                                                alt="Pratinjau bukti pembayaran"
                                                className="h-60 w-full object-contain p-3"
                                            />
                                        </div>
                                    )}
                                </div>

                                <footer className="border-t border-slate-800 px-4 py-3">
                                    <button
                                        type="submit"
                                        disabled={
                                            pembayaranForm.processing
                                        }
                                        className="h-10 w-full rounded-lg bg-violet-500 px-5 text-xs font-black text-white hover:bg-violet-400 disabled:opacity-50"
                                    >
                                        {pembayaranForm.processing
                                            ? 'Mengirim Pembayaran...'
                                            : `Bayar Rp ${formatRupiah(
                                                  perpanjanganTerakhir
                                                      .biaya_tambahan,
                                              )}`}
                                    </button>
                                </footer>
                            </form>
                        )}

                        {sedangDiverifikasi && (
                            <section className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
                                <p className="text-sm font-black text-sky-300">
                                    Pembayaran Sedang Diverifikasi
                                </p>

                                <p className="mt-2 text-xs leading-5 text-slate-300">
                                    Bukti pembayaran dikirim pada{' '}
                                    {formatWaktu(
                                        perpanjanganTerakhir
                                            ?.dibayar_pada,
                                    )}
                                    . Tanggal selesai baru belum berlaku
                                    sampai pembayaran disetujui admin.
                                </p>

                                {perpanjanganTerakhir
                                    ?.memiliki_bukti_pembayaran && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setModalBukti({
                                                url:
                                                    perpanjanganTerakhir
                                                        .url_bukti_pembayaran,
                                            })
                                        }
                                        className="mt-3 h-9 rounded-lg border border-sky-400/40 bg-sky-500/10 px-4 text-xs font-black text-sky-200"
                                    >
                                        Lihat Bukti Pembayaran
                                    </button>
                                )}
                            </section>
                        )}

                        {prosesSelesai && (
                            <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                <p className="text-sm font-black text-emerald-300">
                                    Perpanjangan Berhasil
                                </p>

                                <p className="mt-2 text-xs leading-5 text-slate-300">
                                    Pembayaran telah disetujui.
                                    Tanggal selesai baru menjadi{' '}
                                    {formatTanggal(
                                        perpanjanganTerakhir
                                            ?.tanggal_selesai_baru,
                                    )}
                                    .
                                </p>
                            </section>
                        )}

                        {bolehMengajukan && (
                            <form
                                onSubmit={
                                    bukaKonfirmasiPengajuan
                                }
                                className="overflow-hidden rounded-2xl border border-slate-800 bg-[#10192B]"
                            >
                                <header className="border-b border-slate-800 px-4 py-3">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                        Form Pengajuan
                                    </p>

                                    <h2 className="mt-1 text-sm font-black text-white">
                                        Pilih Tanggal Selesai Baru
                                    </h2>
                                </header>

                                <div className="p-4">
                                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500">
                                        Tanggal Selesai Baru
                                    </label>

                                    <input
                                        type="date"
                                        min={
                                            tanggalMinimum
                                        }
                                        value={
                                            pengajuanForm
                                                .data
                                                .tanggal_selesai_baru
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            pengajuanForm.setData(
                                                'tanggal_selesai_baru',
                                                event.target.value,
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />

                                    <InputError
                                        message={
                                            pengajuanForm
                                                .errors
                                                .tanggal_selesai_baru
                                        }
                                    />

                                    <div className="mt-3">
                                        <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500">
                                            Alasan Pengajuan
                                        </label>

                                        <textarea
                                            rows="4"
                                            maxLength="500"
                                            value={
                                                pengajuanForm
                                                    .data
                                                    .alasan_pengajuan
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                pengajuanForm.setData(
                                                    'alasan_pengajuan',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Jelaskan alasan memerlukan tambahan waktu rental."
                                            className={
                                                textareaClass
                                            }
                                        />

                                        <InputError
                                            message={
                                                pengajuanForm
                                                    .errors
                                                    .alasan_pengajuan
                                            }
                                        />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <InfoCard
                                            label="Tambahan Hari"
                                            value={`${jumlahHariTambahan} hari`}
                                            valueClass="text-violet-300"
                                        />

                                        <InfoCard
                                            label="Estimasi Tambahan"
                                            value={`Rp ${formatRupiah(
                                                biayaTambahan,
                                            )}`}
                                            valueClass="text-[#06B6D4]"
                                        />
                                    </div>
                                </div>

                                <footer className="border-t border-slate-800 px-4 py-3">
                                    <button
                                        type="submit"
                                        disabled={
                                            pengajuanForm.processing
                                        }
                                        className="h-10 w-full rounded-lg bg-[#06B6D4] px-5 text-xs font-black text-[#0B1120] hover:bg-cyan-300 disabled:opacity-50"
                                    >
                                        Ajukan Perpanjangan
                                    </button>
                                </footer>
                            </form>
                        )}

                        {!bolehMengajukan &&
                            !perluMembayar &&
                            !sedangDiverifikasi &&
                            !prosesSelesai &&
                            statusPerpanjangan !==
                                'menunggu_persetujuan' && (
                            <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                                <p className="text-sm font-black text-amber-300">
                                    Pengajuan Baru Belum Tersedia
                                </p>

                                <p className="mt-2 text-xs leading-5 text-slate-300">
                                    {alasanTidakDapatMengajukan ??
                                        'Transaksi belum memenuhi ketentuan perpanjangan.'}
                                </p>
                            </section>
                        )}
                    </div>

                    <aside className="h-fit rounded-2xl border border-slate-800 bg-[#10192B] lg:sticky lg:top-20">
                        <header className="border-b border-slate-800 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                Ketentuan
                            </p>

                            <h2 className="mt-1 text-sm font-black text-white">
                                Peraturan Perpanjangan
                            </h2>
                        </header>

                        <div className="space-y-3 p-4">
                            {[
                                'Permintaan harus disetujui admin sebelum pembayaran.',
                                'Tanggal baru belum berlaku sebelum pembayaran disetujui.',
                                'Pembayaran menggunakan transfer dan bukti gambar.',
                                'Biaya tambahan dihitung berdasarkan harga per hari.',
                                'Bukti pembayaran akan diverifikasi oleh admin.',
                                'Pengajuan baru tidak tersedia selama proses sebelumnya belum selesai.',
                                'Pelanggan dengan denda belum lunas tidak dapat mengajukan perpanjangan.',
                            ].map(
                                (
                                    rule,
                                    index,
                                ) => (
                                    <div
                                        key={
                                            rule
                                        }
                                        className="flex items-start gap-3"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#06B6D4]/10 text-[10px] font-black text-[#06B6D4]">
                                            {index + 1}
                                        </span>

                                        <p className="text-[11px] leading-5 text-slate-400">
                                            {rule}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </aside>
                </section>
            </main>

            {konfirmasiTerbuka && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#10192B]">
                        <header className="border-b border-slate-800 px-5 py-4">
                            <h2 className="text-base font-black text-white">
                                Ajukan Perpanjangan Rental?
                            </h2>
                        </header>

                        <div className="grid grid-cols-2 gap-2 p-5">
                            <InfoCard
                                label="Tanggal Baru"
                                value={formatTanggal(
                                    pengajuanForm
                                        .data
                                        .tanggal_selesai_baru,
                                )}
                            />

                            <InfoCard
                                label="Estimasi Biaya"
                                value={`Rp ${formatRupiah(
                                    biayaTambahan,
                                )}`}
                                valueClass="text-[#06B6D4]"
                            />
                        </div>

                        <footer className="flex gap-2 border-t border-slate-800 px-5 py-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setKonfirmasiTerbuka(
                                        false,
                                    )
                                }
                                className="h-10 flex-1 rounded-lg border border-slate-700 text-xs font-bold text-slate-300"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={
                                    kirimPengajuan
                                }
                                className="h-10 flex-1 rounded-lg bg-[#06B6D4] text-xs font-black text-[#0B1120]"
                            >
                                Ya, Ajukan
                            </button>
                        </footer>
                    </section>
                </div>
            )}

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

PerpanjanganSewa.layout = (
    page,
) => (
    <PelangganLayout>
        {page}
    </PelangganLayout>
);
