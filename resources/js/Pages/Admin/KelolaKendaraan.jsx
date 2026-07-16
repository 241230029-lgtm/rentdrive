import {
    Head,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';
import {
    useEffect,
    useMemo,
    useState,
} from 'react';

const dataAwal = {
    _method: 'post',
    nama_kendaraan: '',
    merek: '',
    warna: '',
    tahun_pembuatan: String(
        new Date().getFullYear(),
    ),
    transmisi: 'manual',
    kapasitas_penumpang: '1',
    harga_per_hari: '',
    jumlah_unit: '1',
    plat_nomor: '',
    status: 'tersedia',
    foto_kendaraan: null,
    fasilitas: '',
    deskripsi_kendaraan: '',
};

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]';

const textareaClass =
    'w-full resize-none rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]';

const statusInfo = {
    tersedia: {
        label: 'Tersedia',
        className:
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },

    perbaikan: {
        label: 'Perbaikan',
        className:
            'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },

    tidak_aktif: {
        label: 'Tidak Aktif',
        className:
            'border-slate-600 bg-slate-800 text-slate-300',
    },
};

const formatRupiah = (nilai) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(nilai ?? 0));

const fotoUrl = (foto) => {
    if (!foto) {
        return null;
    }

    const value = String(foto).trim();

    if (
        /^(https?:\/\/|\/|blob:)/.test(value)
    ) {
        return value;
    }

    return `/storage/${value}`;
};

function ErrorText({
    message,
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1 text-[11px] font-medium text-rose-400">
            {message}
        </p>
    );
}

function Label({
    htmlFor,
    children,
    required = false,
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
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

function Field({
    id,
    label,
    required = false,
    error,
    className = '',
    children,
}) {
    return (
        <div className={className}>
            <Label
                htmlFor={id}
                required={required}
            >
                {label}
            </Label>

            {children}

            <ErrorText message={error} />
        </div>
    );
}

function Stat({
    label,
    value,
    valueClass = 'text-white',
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-[#10192B] px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500">
                {label}
            </p>

            <p
                className={`mt-0.5 text-xl font-black ${valueClass}`}
            >
                {value}
            </p>
        </div>
    );
}

function VehiclePhoto({
    foto,
    nama,
    className = '',
}) {
    const [failed, setFailed] =
        useState(false);

    const url = fotoUrl(foto);

    if (!url || failed) {
        return (
            <div
                className={`flex items-center justify-center bg-[#0B1120] text-2xl text-slate-600 ${className}`}
            >
                🚘
            </div>
        );
    }

    return (
        <img
            src={url}
            alt={nama}
            loading="lazy"
            onError={() => setFailed(true)}
            className={`object-cover ${className}`}
        />
    );
}

function StatusBadge({
    status,
}) {
    const info =
        statusInfo[status] ??
        statusInfo.tidak_aktif;

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${info.className}`}
        >
            {info.label}
        </span>
    );
}

export default function KelolaKendaraan({
    kendaraans = [],
}) {
    const { flash = {} } =
        usePage().props;

    const [cari, setCari] =
        useState('');

    const [
        filterStatus,
        setFilterStatus,
    ] = useState('semua');

    const [
        modalTerbuka,
        setModalTerbuka,
    ] = useState(false);

    const [
        kendaraanDipilih,
        setKendaraanDipilih,
    ] = useState(null);

    const [
        previewFoto,
        setPreviewFoto,
    ] = useState(null);

    const form = useForm(dataAwal);

    const daftar = Array.isArray(
        kendaraans,
    )
        ? kendaraans
        : [];

    const hasil = useMemo(() => {
        const keyword = cari
            .trim()
            .toLowerCase();

        return daftar.filter(
            (item) => {
                const text = [
                    item.nama_kendaraan,
                    item.merek,
                    item.warna,
                    item.plat_nomor,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return (
                    (
                        !keyword ||
                        text.includes(keyword)
                    ) &&
                    (
                        filterStatus ===
                            'semua' ||
                        item.status ===
                            filterStatus
                    )
                );
            },
        );
    }, [
        cari,
        daftar,
        filterStatus,
    ]);

    const ringkasan = useMemo(
        () => ({
            total:
                daftar.length,

            tersedia:
                daftar.filter(
                    (item) =>
                        item.status ===
                        'tersedia',
                ).length,

            perbaikan:
                daftar.filter(
                    (item) =>
                        item.status ===
                        'perbaikan',
                ).length,

            tidakAktif:
                daftar.filter(
                    (item) =>
                        item.status ===
                        'tidak_aktif',
                ).length,
        }),
        [daftar],
    );

    const hapusBlobPreview = () => {
        if (
            previewFoto?.startsWith(
                'blob:',
            )
        ) {
            URL.revokeObjectURL(
                previewFoto,
            );
        }

        setPreviewFoto(null);
    };

    const bukaTambah = () => {
        hapusBlobPreview();

        setKendaraanDipilih(null);

        form.clearErrors();

        form.setData({
            ...dataAwal,
        });

        setModalTerbuka(true);
    };

    const bukaEdit = (item) => {
        hapusBlobPreview();

        setKendaraanDipilih(item);

        form.clearErrors();

        form.setData({
            _method:
                'patch',

            nama_kendaraan:
                item.nama_kendaraan ?? '',

            merek:
                item.merek ?? '',

            warna:
                item.warna ?? '',

            tahun_pembuatan:
                String(
                    item.tahun_pembuatan ??
                        '',
                ),

            transmisi:
                item.transmisi ??
                'manual',

            kapasitas_penumpang:
                String(
                    item.kapasitas_penumpang ??
                        1,
                ),

            harga_per_hari:
                String(
                    item.harga_per_hari ??
                        '',
                ),

            jumlah_unit:
                String(
                    item.jumlah_unit ??
                        1,
                ),

            plat_nomor:
                item.plat_nomor ?? '',

            status:
                item.status ??
                'tersedia',

            foto_kendaraan:
                null,

            fasilitas:
                item.fasilitas ?? '',

            deskripsi_kendaraan:
                item.deskripsi_kendaraan ??
                '',
        });

        setPreviewFoto(
            fotoUrl(
                item.foto_kendaraan,
            ),
        );

        setModalTerbuka(true);
    };

    const tutupModal = () => {
        if (form.processing) {
            return;
        }

        hapusBlobPreview();

        setModalTerbuka(false);

        setKendaraanDipilih(null);

        form.reset();

        form.clearErrors();
    };

    useEffect(() => {
        if (!modalTerbuka) {
            document.body.style.overflow =
                '';

            return;
        }

        document.body.style.overflow =
            'hidden';

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                tutupModal();
            }
        };

        window.addEventListener(
            'keydown',
            onKeyDown,
        );

        return () => {
            document.body.style.overflow =
                '';

            window.removeEventListener(
                'keydown',
                onKeyDown,
            );
        };
    }, [
        modalTerbuka,
        form.processing,
    ]);

    const ubahFoto = (event) => {
        const file =
            event.target.files?.[0] ??
            null;

        if (
            previewFoto?.startsWith(
                'blob:',
            )
        ) {
            URL.revokeObjectURL(
                previewFoto,
            );
        }

        form.setData(
            'foto_kendaraan',
            file,
        );

        setPreviewFoto(
            file
                ? URL.createObjectURL(
                      file,
                  )
                : kendaraanDipilih
                  ? fotoUrl(
                        kendaraanDipilih
                            .foto_kendaraan,
                    )
                  : null,
        );
    };

    const simpan = (event) => {
        event.preventDefault();

        const tujuan =
            kendaraanDipilih
                ? route(
                      'admin.kendaraan.update',
                      kendaraanDipilih.id,
                  )
                : route(
                      'admin.kendaraan.simpan',
                  );

        form.post(tujuan, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: tutupModal,
        });
    };

    const hapus = (item) => {
        const yakin =
            window.confirm(
                `Hapus kendaraan "${item.nama_kendaraan}"?\n\nKendaraan yang memiliki riwayat transaksi hanya akan dinonaktifkan.`,
            );

        if (!yakin) {
            return;
        }

        router.delete(
            route(
                'admin.kendaraan.hapus',
                item.id,
            ),
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Kelola Kendaraan" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <section className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#10192B] p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                            Manajemen Armada
                        </p>

                        <h1 className="mt-1 text-2xl font-black text-white">
                            Kelola Kendaraan
                        </h1>

                        <p className="mt-1 text-xs text-slate-500">
                            Tambah, ubah, dan atur
                            status armada rental.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={bukaTambah}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[#06B6D4] px-4 text-sm font-black text-[#0B1120] transition hover:bg-[#22D3EE]"
                    >
                        + Tambah Kendaraan
                    </button>
                </section>

                {(flash.success ||
                    flash.warning ||
                    flash.error) && (
                    <section className="mt-3 space-y-2">
                        {flash.success && (
                            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-300">
                                {flash.success}
                            </div>
                        )}

                        {flash.warning && (
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-300">
                                {flash.warning}
                            </div>
                        )}

                        {flash.error && (
                            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300">
                                {flash.error}
                            </div>
                        )}
                    </section>
                )}

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <Stat
                        label="Total Armada"
                        value={
                            ringkasan.total
                        }
                    />

                    <Stat
                        label="Tersedia"
                        value={
                            ringkasan.tersedia
                        }
                        valueClass="text-emerald-300"
                    />

                    <Stat
                        label="Perbaikan"
                        value={
                            ringkasan.perbaikan
                        }
                        valueClass="text-amber-300"
                    />

                    <Stat
                        label="Tidak Aktif"
                        value={
                            ringkasan.tidakAktif
                        }
                        valueClass="text-slate-400"
                    />
                </section>

                <section className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#10192B] p-3 md:flex-row">
                    <input
                        type="search"
                        value={cari}
                        onChange={(event) =>
                            setCari(
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Cari nama, merek, warna, atau plat nomor"
                        className={`${inputClass} flex-1`}
                    />

                    <select
                        value={filterStatus}
                        onChange={(event) =>
                            setFilterStatus(
                                event.target
                                    .value,
                            )
                        }
                        className={`${inputClass} md:w-52`}
                    >
                        <option value="semua">
                            Semua status
                        </option>

                        <option value="tersedia">
                            Tersedia
                        </option>

                        <option value="perbaikan">
                            Perbaikan
                        </option>

                        <option value="tidak_aktif">
                            Tidak aktif
                        </option>
                    </select>

                    <div className="flex h-10 items-center rounded-lg border border-slate-800 bg-[#0B1120] px-3 text-xs font-bold text-slate-500">
                        {hasil.length} data
                    </div>
                </section>

                <section className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-[#10192B]">
                    {hasil.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
                            <span className="text-4xl opacity-40">
                                🚘
                            </span>

                            <p className="mt-3 text-sm font-black text-white">
                                Kendaraan tidak
                                ditemukan
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Ubah pencarian atau
                                tambahkan armada baru.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1060px] border-collapse text-left">
                                <thead className="border-b border-slate-800 bg-[#0B1120] text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                                    <tr>
                                        <th className="px-3 py-2.5">
                                            Kendaraan
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Plat/Tahun
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Spesifikasi
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Unit
                                        </th>

                                        <th className="px-3 py-2.5">
                                            Harga/Hari
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
                                    {hasil.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.id
                                                }
                                                className="transition hover:bg-[#1E293B]/50"
                                            >
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <VehiclePhoto
                                                            foto={
                                                                item.foto_kendaraan
                                                            }
                                                            nama={
                                                                item.nama_kendaraan
                                                            }
                                                            className="h-12 w-16 shrink-0 rounded-lg border border-slate-800"
                                                        />

                                                        <div className="min-w-0">
                                                            <p className="max-w-56 truncate text-sm font-black text-white">
                                                                {
                                                                    item.nama_kendaraan
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 max-w-56 truncate text-[11px] text-slate-500">
                                                                {
                                                                    item.merek
                                                                }{' '}
                                                                ·{' '}
                                                                {
                                                                    item.warna
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <p className="text-xs font-black text-white">
                                                        {
                                                            item.plat_nomor
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                                        {
                                                            item.tahun_pembuatan
                                                        }
                                                    </p>
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <p className="text-xs font-bold capitalize text-slate-300">
                                                        {
                                                            item.transmisi
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                                        {
                                                            item.kapasitas_penumpang
                                                        }{' '}
                                                        penumpang
                                                    </p>
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <p className="text-sm font-black text-white">
                                                        {
                                                            item.jumlah_unit
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                                        {Number(
                                                            item.sewas_count ??
                                                                0,
                                                        )}{' '}
                                                        riwayat
                                                    </p>
                                                </td>

                                                <td className="px-3 py-2.5 text-xs font-black text-[#06B6D4]">
                                                    {formatRupiah(
                                                        item.harga_per_hari,
                                                    )}
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <StatusBadge
                                                        status={
                                                            item.status
                                                        }
                                                    />
                                                </td>

                                                <td className="px-3 py-2.5">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                bukaEdit(
                                                                    item,
                                                                )
                                                            }
                                                            className="h-8 rounded-lg border border-slate-700 px-3 text-[11px] font-bold text-slate-300 transition hover:border-[#06B6D4] hover:text-[#06B6D4]"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                hapus(
                                                                    item,
                                                                )
                                                            }
                                                            className="h-8 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-[11px] font-bold text-rose-300 transition hover:bg-rose-500/20"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {modalTerbuka && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-4"
                    onMouseDown={(
                        event,
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            tutupModal();
                        }
                    }}
                >
                    <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-[#10192B] shadow-2xl">
                        <header className="flex shrink-0 items-center justify-between border-b border-slate-700 px-4 py-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#06B6D4]">
                                    Manajemen Armada
                                </p>

                                <h2 className="mt-0.5 text-lg font-black text-white">
                                    {kendaraanDipilih
                                        ? 'Edit Kendaraan'
                                        : 'Tambah Kendaraan'}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    tutupModal
                                }
                                disabled={
                                    form.processing
                                }
                                className="h-9 rounded-lg border border-slate-700 px-3 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-50"
                            >
                                Tutup
                            </button>
                        </header>

                        <form
                            onSubmit={simpan}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <Field
                                        id="nama_kendaraan"
                                        label="Nama Kendaraan"
                                        required
                                        error={
                                            form
                                                .errors
                                                .nama_kendaraan
                                        }
                                        className="sm:col-span-2"
                                    >
                                        <input
                                            id="nama_kendaraan"
                                            value={
                                                form
                                                    .data
                                                    .nama_kendaraan
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'nama_kendaraan',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="merek"
                                        label="Merek"
                                        required
                                        error={
                                            form
                                                .errors
                                                .merek
                                        }
                                    >
                                        <input
                                            id="merek"
                                            value={
                                                form
                                                    .data
                                                    .merek
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'merek',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="warna"
                                        label="Warna"
                                        required
                                        error={
                                            form
                                                .errors
                                                .warna
                                        }
                                    >
                                        <input
                                            id="warna"
                                            value={
                                                form
                                                    .data
                                                    .warna
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'warna',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="tahun_pembuatan"
                                        label="Tahun"
                                        required
                                        error={
                                            form
                                                .errors
                                                .tahun_pembuatan
                                        }
                                    >
                                        <input
                                            id="tahun_pembuatan"
                                            type="number"
                                            min="1900"
                                            max={
                                                new Date()
                                                    .getFullYear() +
                                                1
                                            }
                                            value={
                                                form
                                                    .data
                                                    .tahun_pembuatan
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'tahun_pembuatan',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="transmisi"
                                        label="Transmisi"
                                        required
                                        error={
                                            form
                                                .errors
                                                .transmisi
                                        }
                                    >
                                        <select
                                            id="transmisi"
                                            value={
                                                form
                                                    .data
                                                    .transmisi
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'transmisi',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            required
                                        >
                                            <option value="manual">
                                                Manual
                                            </option>

                                            <option value="otomatis">
                                                Otomatis
                                            </option>
                                        </select>
                                    </Field>

                                    <Field
                                        id="kapasitas_penumpang"
                                        label="Penumpang"
                                        required
                                        error={
                                            form
                                                .errors
                                                .kapasitas_penumpang
                                        }
                                    >
                                        <input
                                            id="kapasitas_penumpang"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={
                                                form
                                                    .data
                                                    .kapasitas_penumpang
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'kapasitas_penumpang',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="jumlah_unit"
                                        label="Jumlah Unit"
                                        required
                                        error={
                                            form
                                                .errors
                                                .jumlah_unit
                                        }
                                    >
                                        <input
                                            id="jumlah_unit"
                                            type="number"
                                            min="1"
                                            max="1000"
                                            value={
                                                form
                                                    .data
                                                    .jumlah_unit
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'jumlah_unit',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="harga_per_hari"
                                        label="Harga Per Hari"
                                        required
                                        error={
                                            form
                                                .errors
                                                .harga_per_hari
                                        }
                                        className="sm:col-span-2"
                                    >
                                        <input
                                            id="harga_per_hari"
                                            type="number"
                                            min="1"
                                            value={
                                                form
                                                    .data
                                                    .harga_per_hari
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'harga_per_hari',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            placeholder="Contoh: 350000"
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="plat_nomor"
                                        label="Plat Nomor"
                                        required
                                        error={
                                            form
                                                .errors
                                                .plat_nomor
                                        }
                                    >
                                        <input
                                            id="plat_nomor"
                                            value={
                                                form
                                                    .data
                                                    .plat_nomor
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'plat_nomor',
                                                    event
                                                        .target
                                                        .value
                                                        .toUpperCase(),
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            placeholder="KB 1234 AA"
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="status"
                                        label="Status Operasional"
                                        required
                                        error={
                                            form
                                                .errors
                                                .status
                                        }
                                    >
                                        <select
                                            id="status"
                                            value={
                                                form
                                                    .data
                                                    .status
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'status',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                            required
                                        >
                                            <option value="tersedia">
                                                Tersedia
                                            </option>

                                            <option value="perbaikan">
                                                Perbaikan
                                            </option>

                                            <option value="tidak_aktif">
                                                Tidak Aktif
                                            </option>
                                        </select>
                                    </Field>
                                </div>

                                <div className="mt-3 grid gap-3 xl:grid-cols-[240px_minmax(0,1fr)]">
                                    <section className="rounded-xl border border-slate-700 bg-[#0B1120] p-3">
                                        <Label htmlFor="foto_kendaraan">
                                            Foto Kendaraan
                                        </Label>

                                        <div className="h-32 overflow-hidden rounded-lg border border-slate-800 bg-[#10192B]">
                                            {previewFoto ? (
                                                <img
                                                    src={
                                                        previewFoto
                                                    }
                                                    alt="Pratinjau kendaraan"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-3xl opacity-40">
                                                    📷
                                                </div>
                                            )}
                                        </div>

                                        <label
                                            htmlFor="foto_kendaraan"
                                            className="mt-2 flex h-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-600 px-3 text-[11px] font-bold text-slate-300 hover:border-[#06B6D4] hover:text-[#06B6D4]"
                                        >
                                            {form
                                                .data
                                                .foto_kendaraan
                                                ?.name ??
                                                (kendaraanDipilih
                                                    ? 'Ganti foto'
                                                    : 'Pilih foto')}
                                        </label>

                                        <input
                                            id="foto_kendaraan"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={
                                                ubahFoto
                                            }
                                            className="sr-only"
                                        />

                                        <p className="mt-1 text-[9px] text-slate-600">
                                            JPG, PNG, atau
                                            WebP. Maks. 3 MB.
                                        </p>

                                        <ErrorText
                                            message={
                                                form
                                                    .errors
                                                    .foto_kendaraan
                                            }
                                        />
                                    </section>

                                    <section className="grid gap-3 sm:grid-cols-2">
                                        <Field
                                            id="fasilitas"
                                            label="Fasilitas"
                                            error={
                                                form
                                                    .errors
                                                    .fasilitas
                                            }
                                        >
                                            <textarea
                                                id="fasilitas"
                                                rows="5"
                                                value={
                                                    form
                                                        .data
                                                        .fasilitas
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'fasilitas',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                className={
                                                    textareaClass
                                                }
                                                placeholder="AC, Bluetooth, Airbag, Charger USB"
                                            />
                                        </Field>

                                        <Field
                                            id="deskripsi_kendaraan"
                                            label="Deskripsi"
                                            error={
                                                form
                                                    .errors
                                                    .deskripsi_kendaraan
                                            }
                                        >
                                            <textarea
                                                id="deskripsi_kendaraan"
                                                rows="5"
                                                value={
                                                    form
                                                        .data
                                                        .deskripsi_kendaraan
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'deskripsi_kendaraan',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                className={
                                                    textareaClass
                                                }
                                                placeholder="Kondisi, keunggulan, dan penggunaan kendaraan"
                                            />
                                        </Field>
                                    </section>
                                </div>
                            </div>

                            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-700 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[10px] text-slate-600">
                                    Kolom bertanda *
                                    wajib diisi.
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={
                                            tutupModal
                                        }
                                        disabled={
                                            form.processing
                                        }
                                        className="h-9 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-300 disabled:opacity-50"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            form.processing
                                        }
                                        className="h-9 rounded-lg bg-[#06B6D4] px-4 text-xs font-black text-[#0B1120] hover:bg-[#22D3EE] disabled:opacity-50"
                                    >
                                        {form.processing
                                            ? 'Menyimpan...'
                                            : kendaraanDipilih
                                              ? 'Simpan Perubahan'
                                              : 'Tambah Kendaraan'}
                                    </button>
                                </div>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
