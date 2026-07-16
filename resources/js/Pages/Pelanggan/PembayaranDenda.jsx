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

const statusDenda = {
    belum_dibayar: {
        label: 'Belum Dibayar',
        kelas:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
        pesan:
            'Selesaikan pembayaran agar akun dapat melakukan booking kembali.',
    },

    menunggu_verifikasi: {
        label: 'Menunggu Verifikasi',
        kelas:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        pesan:
            'Bukti pembayaran sudah dikirim dan sedang diperiksa admin.',
    },

    ditolak: {
        label: 'Pembayaran Ditolak',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        pesan:
            'Periksa alasan penolakan dan unggah kembali bukti pembayaran.',
    },

    lunas: {
        label: 'Lunas',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        pesan:
            'Pembayaran denda telah disetujui. Akun dapat melakukan booking kembali.',
    },
};

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-xs font-semibold text-white outline-none transition focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10';

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

function DetailItem({
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
                className={`mt-1 text-xs font-bold ${valueClass}`}
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

export default function PembayaranDenda({
    sewa,
    rekening,
    boleh_membayar = false,
}) {
    const {
        flash = {},
    } = usePage().props;

    const info =
        statusDenda[
            sewa
                ?.status_pembayaran_denda
        ] ??
        statusDenda.belum_dibayar;

    const form = useForm({
        metode_pembayaran_denda:
            'transfer',

        bukti_pembayaran_denda:
            null,

        persetujuan_pembayaran:
            false,
    });

    const [
        preview,
        setPreview,
    ] = useState(null);

    useEffect(() => {
        if (
            !form.data
                .bukti_pembayaran_denda
        ) {
            setPreview(null);
            return;
        }

        const url =
            URL.createObjectURL(
                form.data
                    .bukti_pembayaran_denda,
            );

        setPreview(url);

        return () =>
            URL.revokeObjectURL(
                url,
            );
    }, [
        form.data
            .bukti_pembayaran_denda,
    ]);

    const status =
        sewa
            ?.status_pembayaran_denda ??
        'belum_dibayar';

    const bisaMengirim =
        Boolean(
            boleh_membayar,
        ) &&
        [
            'belum_dibayar',
            'ditolak',
        ].includes(status);

    const totalDenda =
        useMemo(
            () =>
                Number(
                    sewa
                        ?.total_denda ??
                        0,
                ),
            [
                sewa?.total_denda,
            ],
        );

    const kirimPembayaran = (
        event,
    ) => {
        event.preventDefault();

        if (!bisaMengirim) {
            return;
        }

        form.post(
            route(
                'pelanggan.denda.store',
                sewa.id,
            ),
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    form.reset(
                        'bukti_pembayaran_denda',
                        'persetujuan_pembayaran',
                    );

                    setPreview(null);
                },
            },
        );
    };

    return (
        <>
            <Head title="Pembayaran Denda" />

            <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-5">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                            Transaksi Denda
                        </p>

                        <h1 className="mt-1 text-2xl font-black text-white">
                            Pembayaran Denda
                        </h1>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Bayar tagihan denda
                            pengembalian dan tunggu
                            verifikasi dari admin.
                        </p>
                    </div>

                    <Link
                        href={route(
                            'pelanggan.riwayat',
                            {
                                sewa:
                                    sewa?.id,
                                detail:
                                    'pengembalian',
                            },
                        )}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-300 hover:border-[#06B6D4] hover:text-[#06B6D4]"
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

                <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-3">
                        <section className="rounded-xl border border-slate-800 bg-[#10192B]">
                            <header className="flex flex-col gap-2 border-b border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                        Tagihan
                                    </p>

                                    <h2 className="mt-1 text-sm font-black text-white">
                                        {
                                            sewa
                                                ?.nomor_booking
                                        }
                                    </h2>
                                </div>

                                <span
                                    className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[9px] font-black uppercase ${info.kelas}`}
                                >
                                    {info.label}
                                </span>
                            </header>

                            <div className="p-4">
                                <p className="rounded-lg border border-slate-800 bg-[#0B1120] px-3 py-2.5 text-xs leading-5 text-slate-400">
                                    {info.pesan}
                                </p>

                                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                                    <DetailItem
                                        label="Kendaraan"
                                        value={
                                            sewa
                                                ?.kendaraan
                                                ?.nama_kendaraan
                                        }
                                    />

                                    <DetailItem
                                        label="Tanggal Sewa"
                                        value={`${formatTanggal(
                                            sewa
                                                ?.tanggal_mulai,
                                        )} — ${formatTanggal(
                                            sewa
                                                ?.tanggal_selesai,
                                        )}`}
                                    />

                                    <DetailItem
                                        label="Tanggal Kembali"
                                        value={formatTanggal(
                                            sewa
                                                ?.tanggal_kembali_aktual,
                                        )}
                                    />

                                    <DetailItem
                                        label="Denda Keterlambatan"
                                        value={`Rp ${formatRupiah(
                                            sewa
                                                ?.denda_keterlambatan,
                                        )}`}
                                    />

                                    <DetailItem
                                        label="Denda Kerusakan"
                                        value={`Rp ${formatRupiah(
                                            sewa
                                                ?.denda_kerusakan,
                                        )}`}
                                    />

                                    <DetailItem
                                        label="Total Denda"
                                        value={`Rp ${formatRupiah(
                                            totalDenda,
                                        )}`}
                                        valueClass="text-rose-300"
                                    />
                                </div>

                                {sewa?.alasan_penolakan && (
                                    <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                            Alasan Penolakan
                                        </p>

                                        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-rose-100/80">
                                            {
                                                sewa
                                                    .alasan_penolakan
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {bisaMengirim && (
                            <form
                                onSubmit={
                                    kirimPembayaran
                                }
                                className="rounded-xl border border-slate-800 bg-[#10192B]"
                            >
                                <header className="border-b border-slate-800 px-4 py-3">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                        Bukti Transfer
                                    </p>

                                    <h2 className="mt-1 text-sm font-black text-white">
                                        Unggah Pembayaran
                                    </h2>
                                </header>

                                <div className="p-4">
                                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500">
                                        Metode Pembayaran
                                    </label>

                                    <select
                                        value={
                                            form.data
                                                .metode_pembayaran_denda
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'metode_pembayaran_denda',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    >
                                        <option value="transfer">
                                            Transfer Bank
                                        </option>
                                    </select>

                                    <InputError
                                        message={
                                            form
                                                .errors
                                                .metode_pembayaran_denda
                                        }
                                    />

                                    <div className="mt-3 rounded-xl border border-dashed border-slate-700 bg-[#0B1120] p-4">
                                        <label
                                            htmlFor="bukti_pembayaran_denda"
                                            className="block cursor-pointer"
                                        >
                                            <p className="text-xs font-black text-white">
                                                Pilih Bukti
                                                Transfer
                                            </p>

                                            <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                                JPG, PNG, atau
                                                WebP. Maksimal
                                                3 MB.
                                            </p>

                                            <div className="mt-3 flex min-h-24 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#10192B] text-center">
                                                {preview ? (
                                                    <img
                                                        src={
                                                            preview
                                                        }
                                                        alt="Pratinjau bukti pembayaran"
                                                        className="max-h-56 w-full rounded-lg object-contain p-2"
                                                    />
                                                ) : (
                                                    <p className="px-3 text-xs font-bold text-slate-400">
                                                        Klik untuk
                                                        memilih bukti
                                                        pembayaran
                                                    </p>
                                                )}
                                            </div>
                                        </label>

                                        <input
                                            id="bukti_pembayaran_denda"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'bukti_pembayaran_denda',
                                                    event
                                                        .target
                                                        .files?.[0] ??
                                                        null,
                                                )
                                            }
                                            className="sr-only"
                                        />

                                        <InputError
                                            message={
                                                form
                                                    .errors
                                                    .bukti_pembayaran_denda
                                            }
                                        />
                                    </div>

                                    <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.data
                                                    .persetujuan_pembayaran
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'persetujuan_pembayaran',
                                                    event
                                                        .target
                                                        .checked,
                                                )
                                            }
                                            className="mt-0.5 rounded border-slate-600 bg-[#10192B] text-[#06B6D4] focus:ring-[#06B6D4]"
                                        />

                                        <span className="text-[11px] leading-5 text-slate-400">
                                            Saya memastikan
                                            nominal dan bukti
                                            transfer yang
                                            dikirim sudah benar.
                                        </span>
                                    </label>

                                    <InputError
                                        message={
                                            form
                                                .errors
                                                .persetujuan_pembayaran
                                        }
                                    />
                                </div>

                                <footer className="border-t border-slate-800 px-4 py-3">
                                    <button
                                        type="submit"
                                        disabled={
                                            form.processing
                                        }
                                        className="h-10 w-full rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120] hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {form.processing
                                            ? 'Mengirim Pembayaran...'
                                            : 'Kirim Pembayaran Denda'}
                                    </button>
                                </footer>
                            </form>
                        )}

                        {status ===
                            'menunggu_verifikasi' && (
                            <section className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-5 text-center">
                                <p className="text-sm font-black text-sky-300">
                                    Pembayaran sedang
                                    diperiksa
                                </p>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Admin akan memeriksa
                                    bukti pembayaran.
                                    Status akun akan
                                    dipulihkan setelah
                                    pembayaran disetujui.
                                </p>

                                {sewa?.memiliki_bukti_pembayaran && (
                                    <a
                                        href={route(
                                            'pelanggan.denda.bukti',
                                            sewa.id,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex h-9 items-center rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 text-xs font-black text-sky-300"
                                    >
                                        Lihat Bukti Pembayaran
                                    </a>
                                )}

                                <p className="mt-3 text-[10px] text-slate-600">
                                    Dikirim{' '}
                                    {formatWaktu(
                                        sewa
                                            ?.denda_dibayar_pada,
                                    )}
                                </p>
                            </section>
                        )}

                        {status ===
                            'lunas' && (
                            <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
                                <p className="text-sm font-black text-emerald-300">
                                    Denda telah lunas
                                </p>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Pembayaran sudah
                                    disetujui admin dan
                                    akun dapat melakukan
                                    booking kembali.
                                </p>

                                <Link
                                    href={route(
                                        'pelanggan.katalog',
                                    )}
                                    className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120]"
                                >
                                    Lihat Kendaraan
                                </Link>
                            </section>
                        )}
                    </div>

                    <aside className="h-fit rounded-xl border border-slate-800 bg-[#10192B] lg:sticky lg:top-20">
                        <header className="border-b border-slate-800 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#06B6D4]">
                                Rekening Tujuan
                            </p>

                            <h2 className="mt-1 text-sm font-black text-white">
                                Instruksi Transfer
                            </h2>
                        </header>

                        <div className="space-y-2 p-4">
                            <DetailItem
                                label="Bank"
                                value={
                                    rekening
                                        ?.bank
                                }
                            />

                            <DetailItem
                                label="Nomor Rekening"
                                value={
                                    rekening
                                        ?.nomor_rekening
                                }
                                valueClass="text-[#06B6D4]"
                            />

                            <DetailItem
                                label="Nama Penerima"
                                value={
                                    rekening
                                        ?.nama_penerima
                                }
                            />

                            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                                <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                    Nominal Transfer
                                </p>

                                <p className="mt-1 text-2xl font-black text-rose-300">
                                    Rp{' '}
                                    {formatRupiah(
                                        totalDenda,
                                    )}
                                </p>

                                <p className="mt-2 text-[10px] leading-4 text-slate-500">
                                    Transfer sesuai
                                    nominal agar proses
                                    verifikasi lebih
                                    mudah.
                                </p>
                            </div>

                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                                <p className="text-[10px] font-semibold leading-5 text-amber-200/80">
                                    Booking baru tetap
                                    diblokir selama
                                    pembayaran belum
                                    disetujui admin.
                                </p>
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </>
    );
}

PembayaranDenda.layout = (
    page,
) => (
    <PelangganLayout>
        {page}
    </PelangganLayout>
);
