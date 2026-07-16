import PelangganLayout from '@/Layouts/PelangganLayout';
import {
    Head,
    Link,
    usePage,
} from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useState,
} from 'react';

const informasiStatus = {
    menunggu_konfirmasi_admin: {
        label: 'Menunggu Konfirmasi',
        kelas:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
        keterangan:
            'Permintaan booking sedang diperiksa admin.',
    },

    ditolak_booking: {
        label: 'Booking Ditolak',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        keterangan:
            'Permintaan booking belum dapat dilanjutkan.',
    },

    menunggu_identitas: {
        label: 'Lengkapi Identitas',
        kelas:
            'border-violet-500/30 bg-violet-500/10 text-violet-300',
        keterangan:
            'Booking disetujui. Lengkapi identitas transaksi.',
    },

    menunggu_verifikasi_identitas: {
        label: 'Verifikasi Identitas',
        kelas:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        keterangan:
            'Identitas sedang diperiksa admin.',
    },

    identitas_ditolak: {
        label: 'Perbaiki Identitas',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        keterangan:
            'Dokumen identitas perlu diperbaiki.',
    },

    menunggu_pembayaran: {
        label: 'Menunggu Pembayaran',
        kelas:
            'border-violet-500/30 bg-violet-500/10 text-violet-300',
        keterangan:
            'Identitas disetujui. Lanjutkan pembayaran sewa.',
    },

    menunggu_verifikasi_pembayaran: {
        label: 'Verifikasi Pembayaran',
        kelas:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
        keterangan:
            'Pembayaran sewa sedang diperiksa admin.',
    },

    ditolak_pembayaran: {
        label: 'Pembayaran Ditolak',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
        keterangan:
            'Pembayaran perlu diperbaiki atau dikirim ulang.',
    },

    disetujui_operasional: {
        label: 'Disetujui',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        keterangan:
            'Transaksi telah disetujui dan siap dijalankan.',
    },

    sedang_berlangsung: {
        label: 'Sedang Berlangsung',
        kelas:
            'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        keterangan:
            'Kendaraan sedang berada dalam masa penyewaan.',
    },

    menunggu_verifikasi_pengembalian: {
        label: 'Proses Pengembalian',
        kelas:
            'border-orange-500/30 bg-orange-500/10 text-orange-300',
        keterangan:
            'Pengembalian kendaraan sedang diproses.',
    },

    selesai: {
        label: 'Selesai',
        kelas:
            'border-slate-500/30 bg-slate-500/10 text-slate-300',
        keterangan:
            'Transaksi penyewaan telah selesai.',
    },

    dibatalkan: {
        label: 'Dibatalkan',
        kelas:
            'border-slate-500/30 bg-slate-500/10 text-slate-400',
        keterangan:
            'Transaksi telah dibatalkan.',
    },
};

const informasiDenda = {
    tidak_ada: {
        label: 'Tidak Ada Denda',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },

    belum_dibayar: {
        label: 'Denda Belum Dibayar',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    menunggu_verifikasi: {
        label: 'Denda Menunggu Verifikasi',
        kelas:
            'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },

    ditolak: {
        label: 'Pembayaran Denda Ditolak',
        kelas:
            'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },

    lunas: {
        label: 'Denda Lunas',
        kelas:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
};

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-xs font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10';

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

function buatUrlFile(path) {
    if (!path) {
        return null;
    }

    const nilai =
        String(path).trim();

    if (
        nilai.startsWith('http://') ||
        nilai.startsWith('https://') ||
        nilai.startsWith('/') ||
        nilai.startsWith('blob:')
    ) {
        return nilai;
    }

    return `/storage/${nilai}`;
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
                className={`mt-1 break-words text-xs font-bold ${valueClass}`}
            >
                {value ?? '-'}
            </p>
        </div>
    );
}

function StatusBadge({
    status,
}) {
    const info =
        informasiStatus[status] ?? {
            label:
                String(
                    status ?? '-',
                ).replaceAll(
                    '_',
                    ' ',
                ),

            kelas:
                'border-slate-600 bg-slate-800 text-slate-300',
        };

    return (
        <span
            className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${info.kelas}`}
        >
            {info.label}
        </span>
    );
}

function DendaBadge({
    status,
}) {
    const info =
        informasiDenda[status] ??
        informasiDenda.tidak_ada;

    return (
        <span
            className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${info.kelas}`}
        >
            {info.label}
        </span>
    );
}

function Foto({
    src,
    alt,
}) {
    const [
        gagal,
        setGagal,
    ] = useState(false);

    if (
        !src ||
        gagal
    ) {
        return (
            <div className="flex h-40 items-center justify-center bg-[#0B1120] text-xs text-slate-600">
                Foto tidak tersedia
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() =>
                setGagal(true)
            }
            className="h-40 w-full object-contain p-2"
        />
    );
}

function DetailPengembalian({
    item,
}) {
    const pengembalian =
        item?.pengembalian;

    if (!pengembalian) {
        return null;
    }

    const totalDenda =
        Number(
            pengembalian.total_denda ??
                0,
        );

    const statusDenda =
        item
            ?.pembayaran_denda
            ?.status ??
        item
            ?.status_pembayaran_denda ??
        'tidak_ada';

    const bolehMembayar =
        Boolean(
            item
                ?.pembayaran_denda
                ?.boleh_membayar,
        );

    return (
        <section className="mt-3 overflow-hidden rounded-xl border border-slate-700 bg-[#0B1120]">
            <header className="flex flex-col gap-2 border-b border-slate-700 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#06B6D4]">
                        Detail Pengembalian
                    </p>

                    <h3 className="mt-0.5 text-sm font-black text-white">
                        Hasil Pemeriksaan Kendaraan
                    </h3>
                </div>

                {totalDenda > 0 ? (
                    <DendaBadge
                        status={
                            statusDenda
                        }
                    />
                ) : (
                    <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-300">
                        Tanpa Denda
                    </span>
                )}
            </header>

            <div className="p-4">
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <InfoItem
                        label="Jadwal Seharusnya"
                        value={formatTanggal(
                            pengembalian
                                .tanggal_seharusnya,
                        )}
                    />

                    <InfoItem
                        label="Kembali Aktual"
                        value={formatTanggal(
                            pengembalian
                                .tanggal_kembali_aktual,
                        )}
                    />

                    <InfoItem
                        label="Keterlambatan"
                        value={`${Number(
                            pengembalian
                                .hari_terlambat ??
                                0,
                        )} hari`}
                        valueClass={
                            Number(
                                pengembalian
                                    .hari_terlambat ??
                                    0,
                            ) > 0
                                ? 'text-amber-300'
                                : 'text-emerald-300'
                        }
                    />

                    <InfoItem
                        label="Kilometer Kembali"
                        value={
                            pengembalian
                                .kilometer_kembali !==
                                null &&
                            pengembalian
                                .kilometer_kembali !==
                                undefined
                                ? `${Number(
                                      pengembalian
                                          .kilometer_kembali,
                                  ).toLocaleString(
                                      'id-ID',
                                  )} km`
                                : '-'
                        }
                    />
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="rounded-lg border border-slate-800 bg-[#10192B] p-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                            Catatan Kondisi Kendaraan
                        </p>

                        <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-300">
                            {pengembalian
                                .kondisi_kendaraan ||
                                'Tidak ada catatan kondisi kendaraan.'}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#10192B]">
                        <div className="border-b border-slate-800 px-3 py-2">
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Foto Kondisi Kembali
                            </p>
                        </div>

                        <Foto
                            src={buatUrlFile(
                                pengembalian
                                    .foto_kondisi,
                            )}
                            alt="Kondisi kendaraan saat dikembalikan"
                        />
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
                    <InfoItem
                        label="Denda Keterlambatan"
                        value={`Rp ${formatRupiah(
                            pengembalian
                                .denda_keterlambatan,
                        )}`}
                        valueClass={
                            Number(
                                pengembalian
                                    .denda_keterlambatan ??
                                    0,
                            ) > 0
                                ? 'text-amber-300'
                                : 'text-slate-300'
                        }
                    />

                    <InfoItem
                        label="Denda Kerusakan"
                        value={`Rp ${formatRupiah(
                            pengembalian
                                .denda_kerusakan,
                        )}`}
                        valueClass={
                            Number(
                                pengembalian
                                    .denda_kerusakan ??
                                    0,
                            ) > 0
                                ? 'text-amber-300'
                                : 'text-slate-300'
                        }
                    />

                    <InfoItem
                        label="Total Denda"
                        value={`Rp ${formatRupiah(
                            totalDenda,
                        )}`}
                        valueClass={
                            totalDenda > 0
                                ? 'text-rose-300'
                                : 'text-emerald-300'
                        }
                    />
                </div>

                {item
                    ?.pembayaran_denda
                    ?.alasan_penolakan && (
                    <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                            Alasan Pembayaran Denda Ditolak
                        </p>

                        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-rose-100/80">
                            {
                                item
                                    .pembayaran_denda
                                    .alasan_penolakan
                            }
                        </p>
                    </div>
                )}

                {statusDenda ===
                    'menunggu_verifikasi' && (
                    <div className="mt-3 rounded-lg border border-sky-500/30 bg-sky-500/10 p-3">
                        <p className="text-xs font-black text-sky-300">
                            Pembayaran sedang diperiksa admin
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                            Bukti dikirim pada{' '}
                            {formatWaktu(
                                item
                                    ?.pembayaran_denda
                                    ?.dibayar_pada,
                            )}
                            . Booking baru tetap
                            diblokir sampai pembayaran
                            disetujui.
                        </p>
                    </div>
                )}

                {statusDenda ===
                    'lunas' && (
                    <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                        <p className="text-xs font-black text-emerald-300">
                            Pembayaran denda telah lunas
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                            Pembayaran disetujui admin pada{' '}
                            {formatWaktu(
                                item
                                    ?.pembayaran_denda
                                    ?.diperiksa_pada,
                            )}
                            . Akun dapat melakukan booking
                            kembali.
                        </p>
                    </div>
                )}

                {totalDenda > 0 && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-black text-white">
                                Pembayaran Denda
                            </p>

                            <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                Tagihan denda terhubung
                                langsung dengan transaksi
                                ini.
                            </p>
                        </div>

                        <Link
                            href={route(
                                'pelanggan.denda.show',
                                item.id,
                            )}
                            className={`inline-flex h-10 items-center justify-center rounded-lg px-5 text-xs font-black transition ${
                                bolehMembayar
                                    ? 'bg-rose-500 text-white hover:bg-rose-400'
                                    : 'border border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#06B6D4] hover:border-[#06B6D4]/60'
                            }`}
                        >
                            {bolehMembayar
                                ? statusDenda ===
                                  'ditolak'
                                    ? 'Kirim Ulang Pembayaran'
                                    : 'Bayar Denda'
                                : 'Lihat Pembayaran Denda'}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

function RiwayatSewa({
    riwayatSewa = [],
    riwayat = [],
    ringkasan = {},
}) {
    const {
        flash = {},
        errors = {},
    } = usePage().props;

    const daftarRiwayat =
        Array.isArray(
            riwayatSewa,
        ) &&
        riwayatSewa.length > 0
            ? riwayatSewa
            : Array.isArray(
                    riwayat,
                )
              ? riwayat
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
        detailTerbuka,
        setDetailTerbuka,
    ] = useState(null);

    const hasilFilter =
        useMemo(() => {
            const keyword =
                pencarian
                    .trim()
                    .toLowerCase();

            return daftarRiwayat.filter(
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
                        item.nomor_booking,
                        item.kendaraan
                            ?.nama_kendaraan,
                        item.kendaraan
                            ?.merek,
                        item.status,
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
            daftarRiwayat,
            pencarian,
            filterStatus,
        ]);

    useEffect(() => {
        if (
            typeof window ===
            'undefined'
        ) {
            return;
        }

        const parameter =
            new URLSearchParams(
                window.location.search,
            );

        const sewaId =
            parameter.get(
                'sewa',
            );

        if (!sewaId) {
            return;
        }

        const ditemukan =
            daftarRiwayat.find(
                (item) =>
                    Number(
                        item.id,
                    ) ===
                    Number(
                        sewaId,
                    ),
            );

        if (ditemukan) {
            setDetailTerbuka(
                ditemukan.id,
            );
        }
    }, [daftarRiwayat]);

    const daftarError =
        Object.values(
            errors ?? {},
        ).flat();

    return (
        <>
            <Head title="Riwayat Sewa" />

            <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-5">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                            Aktivitas Rental
                        </p>

                        <h1 className="mt-1 text-2xl font-black text-white">
                            Riwayat Sewa
                        </h1>

                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                            Pantau proses booking,
                            pembayaran, pengembalian,
                            dan tagihan denda.
                        </p>
                    </div>

                    <Link
                        href={route(
                            'pelanggan.katalog',
                        )}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120] hover:bg-cyan-300"
                    >
                        Booking Kendaraan
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

                {Number(
                    ringkasan
                        .jumlah_tagihan_denda ??
                        0,
                ) > 0 && (
                    <section className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-black text-rose-300">
                                    Tagihan Denda Belum Lunas
                                </p>

                                <p className="mt-1 text-xs leading-5 text-rose-100/70">
                                    Anda memiliki{' '}
                                    {Number(
                                        ringkasan
                                            .jumlah_tagihan_denda ??
                                            0,
                                    )}{' '}
                                    tagihan dengan total Rp{' '}
                                    {formatRupiah(
                                        ringkasan
                                            .total_denda_belum_lunas,
                                    )}
                                    . Booking baru tidak
                                    dapat dilakukan sebelum
                                    seluruh denda disetujui
                                    admin.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const tagihan =
                                        daftarRiwayat.find(
                                            (
                                                item,
                                            ) =>
                                                Number(
                                                    item.total_denda ??
                                                        0,
                                                ) >
                                                    0 &&
                                                [
                                                    'belum_dibayar',
                                                    'menunggu_verifikasi',
                                                    'ditolak',
                                                ].includes(
                                                    item
                                                        .status_pembayaran_denda,
                                                ),
                                        );

                                    if (
                                        tagihan
                                    ) {
                                        setDetailTerbuka(
                                            tagihan.id,
                                        );
                                    }
                                }}
                                className="h-9 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 text-xs font-black text-rose-200"
                            >
                                Lihat Tagihan
                            </button>
                        </div>
                    </section>
                )}

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-5">
                    <StatCard
                        label="Total Transaksi"
                        value={Number(
                            ringkasan
                                .total_transaksi ??
                                daftarRiwayat.length,
                        )}
                    />

                    <StatCard
                        label="Menunggu"
                        value={Number(
                            ringkasan
                                .transaksi_menunggu ??
                                0,
                        )}
                        valueClass="text-amber-300"
                    />

                    <StatCard
                        label="Aktif"
                        value={Number(
                            ringkasan
                                .transaksi_aktif ??
                                0,
                        )}
                        valueClass="text-cyan-300"
                    />

                    <StatCard
                        label="Selesai"
                        value={Number(
                            ringkasan
                                .transaksi_selesai ??
                                0,
                        )}
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Denda Aktif"
                        value={`Rp ${formatRupiah(
                            ringkasan
                                .total_denda_belum_lunas,
                        )}`}
                        valueClass="text-rose-300"
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
                        placeholder="Cari nomor booking atau kendaraan"
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
                            informasiStatus,
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
                            setPencarian(
                                '',
                            );

                            setFilterStatus(
                                '',
                            );
                        }}
                        className="h-10 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-400 hover:border-slate-500 hover:text-white"
                    >
                        Reset
                    </button>
                </section>

                <section className="mt-3 space-y-3">
                    {hasilFilter.length ===
                    0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#10192B] p-6 text-center">
                            <span className="text-4xl opacity-30">
                                📋
                            </span>

                            <p className="mt-3 text-sm font-black text-white">
                                Riwayat tidak ditemukan
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Belum ada transaksi atau
                                filter tidak sesuai.
                            </p>
                        </div>
                    ) : (
                        hasilFilter.map(
                            (item) => {
                                const statusInfo =
                                    informasiStatus[
                                        item
                                            .status
                                    ] ?? {
                                        keterangan:
                                            '',
                                    };

                                const detailAktif =
                                    Number(
                                        detailTerbuka,
                                    ) ===
                                    Number(
                                        item.id,
                                    );

                                const totalDenda =
                                    Number(
                                        item
                                            .total_denda ??
                                            0,
                                    );

                                const statusDenda =
                                    item
                                        .status_pembayaran_denda ??
                                    'tidak_ada';

                                return (
                                    <article
                                        key={
                                            item.id
                                        }
                                        className="overflow-hidden rounded-xl border border-slate-800 bg-[#10192B]"
                                    >
                                        <div className="p-4">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                                <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-[#0B1120] lg:w-36">
                                                    {item
                                                        .kendaraan
                                                        ?.foto_kendaraan ? (
                                                        <img
                                                            src={buatUrlFile(
                                                                item
                                                                    .kendaraan
                                                                    .foto_kendaraan,
                                                            )}
                                                            alt={
                                                                item
                                                                    .kendaraan
                                                                    .nama_kendaraan
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-4xl opacity-30">
                                                            🛵
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#06B6D4]">
                                                                {
                                                                    item.nomor_booking
                                                                }
                                                            </p>

                                                            <h2 className="mt-1 text-base font-black text-white">
                                                                {item
                                                                    .kendaraan
                                                                    ?.nama_kendaraan ??
                                                                    'Kendaraan'}
                                                            </h2>

                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                {item
                                                                    .kendaraan
                                                                    ?.merek ??
                                                                    '-'}{' '}
                                                                •{' '}
                                                                {item.jenis_booking ===
                                                                'walk_in'
                                                                    ? 'Walk-In'
                                                                    : 'Online'}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5">
                                                            <StatusBadge
                                                                status={
                                                                    item.status
                                                                }
                                                            />

                                                            {totalDenda >
                                                                0 && (
                                                                <DendaBadge
                                                                    status={
                                                                        statusDenda
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="mt-3 text-[11px] leading-5 text-slate-500">
                                                        {
                                                            statusInfo.keterangan
                                                        }
                                                    </p>

                                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                        <InfoItem
                                                            label="Mulai"
                                                            value={formatTanggal(
                                                                item.tanggal_mulai,
                                                            )}
                                                        />

                                                        <InfoItem
                                                            label="Selesai"
                                                            value={formatTanggal(
                                                                item.tanggal_selesai,
                                                            )}
                                                        />

                                                        <InfoItem
                                                            label="Total Sewa"
                                                            value={`Rp ${formatRupiah(
                                                                item.total_harga,
                                                            )}`}
                                                            valueClass="text-[#06B6D4]"
                                                        />

                                                        <InfoItem
                                                            label="Total Denda"
                                                            value={`Rp ${formatRupiah(
                                                                totalDenda,
                                                            )}`}
                                                            valueClass={
                                                                totalDenda >
                                                                0
                                                                    ? 'text-rose-300'
                                                                    : 'text-slate-300'
                                                            }
                                                        />
                                                    </div>

                                                    {item.alasan_penolakan && (
                                                        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                                                            <p className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                                                                Keterangan
                                                            </p>

                                                            <p className="mt-1 whitespace-pre-line text-[11px] leading-5 text-rose-100/80">
                                                                {
                                                                    item.alasan_penolakan
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {[
                                                            'menunggu_identitas',
                                                            'identitas_ditolak',
                                                        ].includes(
                                                            item.status,
                                                        ) && (
                                                            <Link
                                                                href={route(
                                                                    'pelanggan.identitas.show',
                                                                    item.id,
                                                                )}
                                                                className="inline-flex h-9 items-center rounded-lg bg-violet-500 px-4 text-xs font-black text-white"
                                                            >
                                                                {item.status ===
                                                                'identitas_ditolak'
                                                                    ? 'Perbaiki Identitas'
                                                                    : 'Lengkapi Identitas'}
                                                            </Link>
                                                        )}

                                                        {[
                                                            'menunggu_pembayaran',
                                                            'menunggu_verifikasi_pembayaran',
                                                            'ditolak_pembayaran',
                                                        ].includes(
                                                            item.status,
                                                        ) && (
                                                            <Link
                                                                href={route(
                                                                    'pelanggan.pembayaran.show',
                                                                    item.id,
                                                                )}
                                                                className="inline-flex h-9 items-center rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120]"
                                                            >
                                                                {item.status ===
                                                                'menunggu_pembayaran'
                                                                    ? 'Lanjutkan Pembayaran'
                                                                    : 'Lihat Pembayaran'}
                                                            </Link>
                                                        )}

                                                        {totalDenda >
                                                            0 && (
                                                            <Link
                                                                href={route(
                                                                    'pelanggan.denda.show',
                                                                    item.id,
                                                                )}
                                                                className={`inline-flex h-9 items-center rounded-lg px-4 text-xs font-black ${
                                                                    [
                                                                        'belum_dibayar',
                                                                        'ditolak',
                                                                    ].includes(
                                                                        statusDenda,
                                                                    )
                                                                        ? 'bg-rose-500 text-white'
                                                                        : 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                                                                }`}
                                                            >
                                                                {statusDenda ===
                                                                'belum_dibayar'
                                                                    ? 'Bayar Denda'
                                                                    : statusDenda ===
                                                                        'ditolak'
                                                                      ? 'Kirim Ulang Denda'
                                                                      : 'Lihat Pembayaran Denda'}
                                                            </Link>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDetailTerbuka(
                                                                    detailAktif
                                                                        ? null
                                                                        : item.id,
                                                                )
                                                            }
                                                            className="h-9 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-300 hover:border-[#06B6D4] hover:text-[#06B6D4]"
                                                        >
                                                            {detailAktif
                                                                ? 'Tutup Detail'
                                                                : 'Lihat Detail'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {detailAktif && (
                                                <div className="mt-3 border-t border-slate-800 pt-3">
                                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                                        <InfoItem
                                                            label="Nomor Booking"
                                                            value={
                                                                item.nomor_booking
                                                            }
                                                        />

                                                        <InfoItem
                                                            label="Jenis Booking"
                                                            value={
                                                                item.jenis_booking ===
                                                                'walk_in'
                                                                    ? 'Walk-In'
                                                                    : 'Online'
                                                            }
                                                        />

                                                        <InfoItem
                                                            label="Metode Pembayaran"
                                                            value={
                                                                item.metode_pembayaran
                                                                    ? item.metode_pembayaran ===
                                                                      'cash'
                                                                        ? 'Cash'
                                                                        : 'Transfer'
                                                                    : '-'
                                                            }
                                                        />

                                                        <InfoItem
                                                            label="Dibuat"
                                                            value={formatWaktu(
                                                                item.created_at,
                                                            )}
                                                        />
                                                    </div>

                                                    <DetailPengembalian
                                                        item={
                                                            item
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                );
                            },
                        )
                    )}
                </section>
            </main>
        </>
    );
}

RiwayatSewa.layout = (
    page,
) => (
    <PelangganLayout>
        {page}
    </PelangganLayout>
);

export default RiwayatSewa;
