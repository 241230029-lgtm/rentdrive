import {
    Head,
    router,
    useForm,
    usePage,
} from '@inertiajs/react';
import { useMemo, useState } from 'react';

const dataAwal = {
    _method: 'post',
    nama_kendaraan: '',
    merek: '',
    warna: '',
    tahun_pembuatan: new Date()
        .getFullYear()
        .toString(),
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

const kelasInput =
    'w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-sm text-[#F8FAFC] outline-none transition placeholder:text-slate-500 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]';

function PesanError({ message }) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1.5 text-xs font-medium text-rose-400">
            {message}
        </p>
    );
}

function LabelInput({ children, wajib = false }) {
    return (
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
            {children}

            {wajib && (
                <span className="ml-1 text-rose-400">
                    *
                </span>
            )}
        </label>
    );
}

export default function KelolaKendaraan({
    kendaraans = [],
}) {
    const { flash = {} } = usePage().props;

    const [cari, setCari] = useState('');
    const [filterStatus, setFilterStatus] =
        useState('semua');

    const [modalTerbuka, setModalTerbuka] =
        useState(false);

    const [kendaraanDipilih, setKendaraanDipilih] =
        useState(null);

    const [previewFoto, setPreviewFoto] =
        useState(null);

    const form = useForm(dataAwal);

    const daftarKendaraan = Array.isArray(kendaraans)
        ? kendaraans
        : [];

    const formatRupiah = (nilai) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(nilai ?? 0));
    };

    const alamatFoto = (foto) => {
        if (!foto) {
            return null;
        }

        if (
            foto.startsWith('http://') ||
            foto.startsWith('https://') ||
            foto.startsWith('/') ||
            foto.startsWith('blob:')
        ) {
            return foto;
        }

        return `/storage/${foto}`;
    };

    const kendaraanDifilter = useMemo(() => {
        const kataKunci = cari
            .trim()
            .toLowerCase();

        return daftarKendaraan.filter(
            (kendaraan) => {
                const cocokPencarian =
                    !kataKunci ||
                    kendaraan.nama_kendaraan
                        ?.toLowerCase()
                        .includes(kataKunci) ||
                    kendaraan.merek
                        ?.toLowerCase()
                        .includes(kataKunci) ||
                    kendaraan.plat_nomor
                        ?.toLowerCase()
                        .includes(kataKunci);

                const cocokStatus =
                    filterStatus === 'semua' ||
                    kendaraan.status ===
                        filterStatus;

                return (
                    cocokPencarian &&
                    cocokStatus
                );
            },
        );
    }, [
        cari,
        daftarKendaraan,
        filterStatus,
    ]);

    const ringkasan = useMemo(() => {
        return {
            total: daftarKendaraan.length,

            tersedia: daftarKendaraan.filter(
                (item) =>
                    item.status === 'tersedia',
            ).length,

            perbaikan: daftarKendaraan.filter(
                (item) =>
                    item.status === 'perbaikan',
            ).length,

            tidakAktif: daftarKendaraan.filter(
                (item) =>
                    item.status ===
                    'tidak_aktif',
            ).length,
        };
    }, [daftarKendaraan]);

    const bersihkanPreview = () => {
        if (
            previewFoto?.startsWith('blob:')
        ) {
            URL.revokeObjectURL(
                previewFoto,
            );
        }

        setPreviewFoto(null);
    };

    const bukaTambah = () => {
        bersihkanPreview();

        setKendaraanDipilih(null);

        form.clearErrors();
        form.setData({
            ...dataAwal,
        });

        setModalTerbuka(true);
    };

    const bukaEdit = (kendaraan) => {
        bersihkanPreview();

        setKendaraanDipilih(kendaraan);

        form.clearErrors();

        form.setData({
            _method: 'patch',

            nama_kendaraan:
                kendaraan.nama_kendaraan ?? '',

            merek:
                kendaraan.merek ?? '',

            warna:
                kendaraan.warna ?? '',

            tahun_pembuatan:
                String(
                    kendaraan.tahun_pembuatan ??
                        '',
                ),

            transmisi:
                kendaraan.transmisi ??
                'manual',

            kapasitas_penumpang:
                String(
                    kendaraan.kapasitas_penumpang ??
                        1,
                ),

            harga_per_hari:
                String(
                    kendaraan.harga_per_hari ??
                        '',
                ),

            jumlah_unit:
                String(
                    kendaraan.jumlah_unit ?? 1,
                ),

            plat_nomor:
                kendaraan.plat_nomor ?? '',

            status:
                kendaraan.status ??
                'tersedia',

            foto_kendaraan: null,

            fasilitas:
                kendaraan.fasilitas ?? '',

            deskripsi_kendaraan:
                kendaraan.deskripsi_kendaraan ??
                '',
        });

        setPreviewFoto(
            alamatFoto(
                kendaraan.foto_kendaraan,
            ),
        );

        setModalTerbuka(true);
    };

    const tutupModal = () => {
        if (form.processing) {
            return;
        }

        bersihkanPreview();

        setModalTerbuka(false);
        setKendaraanDipilih(null);

        form.reset();
        form.clearErrors();
    };

    const ubahFoto = (event) => {
        const file =
            event.target.files?.[0] ??
            null;

        if (
            previewFoto?.startsWith('blob:')
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
                ? URL.createObjectURL(file)
                : kendaraanDipilih
                  ? alamatFoto(
                        kendaraanDipilih
                            .foto_kendaraan,
                    )
                  : null,
        );
    };

    const simpanKendaraan = (event) => {
        event.preventDefault();

        const routeTujuan = kendaraanDipilih
            ? route(
                  'admin.kendaraan.update',
                  kendaraanDipilih.id,
              )
            : route(
                  'admin.kendaraan.simpan',
              );

        form.post(routeTujuan, {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                tutupModal();
            },
        });
    };

    const hapusKendaraan = (
        kendaraan,
    ) => {
        const yakin = window.confirm(
            `Hapus kendaraan "${kendaraan.nama_kendaraan}"?\n\nKendaraan yang memiliki riwayat transaksi akan dinonaktifkan dan tidak dihapus permanen.`,
        );

        if (!yakin) {
            return;
        }

        router.delete(
            route(
                'admin.kendaraan.hapus',
                kendaraan.id,
            ),
            {
                preserveScroll: true,
            },
        );
    };

    const kelasStatus = (status) => {
        if (status === 'tersedia') {
            return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
        }

        if (status === 'perbaikan') {
            return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
        }

        return 'border-slate-600 bg-slate-800 text-slate-300';
    };

    const labelStatus = (status) => {
        if (status === 'tersedia') {
            return 'Tersedia';
        }

        if (status === 'perbaikan') {
            return 'Perbaikan';
        }

        return 'Tidak Aktif';
    };

    return (
        <>
            <Head title="Kelola Kendaraan" />

            <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
                <section className="rounded-3xl border border-slate-800 bg-[#10192B] p-7 shadow-2xl sm:p-9">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#06B6D4]">
                                Manajemen Armada
                            </p>

                            <h1 className="mt-3 text-3xl font-extrabold">
                                Kelola Kendaraan
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#94A3B8]">
                                Tambahkan kendaraan,
                                perbarui informasi armada,
                                atur jumlah unit, dan
                                tentukan status
                                operasionalnya.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={bukaTambah}
                            className="inline-flex items-center justify-center rounded-xl bg-[#06B6D4] px-6 py-3.5 font-bold text-[#0B1120] transition hover:bg-[#0891B2]"
                        >
                            + Tambah Kendaraan
                        </button>
                    </div>
                </section>

                {(flash.success ||
                    flash.error ||
                    flash.warning) && (
                    <section className="mt-6 space-y-3">
                        {flash.success && (
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300">
                                {flash.success}
                            </div>
                        )}

                        {flash.warning && (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-300">
                                {flash.warning}
                            </div>
                        )}

                        {flash.error && (
                            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-300">
                                {flash.error}
                            </div>
                        )}
                    </section>
                )}

                <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: 'Total Kendaraan',
                            nilai: ringkasan.total,
                        },
                        {
                            label: 'Tersedia',
                            nilai: ringkasan.tersedia,
                        },
                        {
                            label: 'Perbaikan',
                            nilai: ringkasan.perbaikan,
                        },
                        {
                            label: 'Tidak Aktif',
                            nilai: ringkasan.tidakAktif,
                        },
                    ].map((item) => (
                        <article
                            key={item.label}
                            className="rounded-2xl border border-slate-800 bg-[#1E293B] p-5 shadow-xl"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#94A3B8]">
                                {item.label}
                            </p>

                            <p className="mt-3 text-3xl font-extrabold text-[#F8FAFC]">
                                {item.nilai}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="mt-7 rounded-2xl border border-slate-800 bg-[#1E293B] p-5 shadow-xl">
                    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                        <input
                            type="search"
                            value={cari}
                            onChange={(event) =>
                                setCari(
                                    event.target.value,
                                )
                            }
                            placeholder="Cari nama, merek, atau plat nomor"
                            className={kelasInput}
                        />

                        <select
                            value={filterStatus}
                            onChange={(event) =>
                                setFilterStatus(
                                    event.target.value,
                                )
                            }
                            className={kelasInput}
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
                    </div>
                </section>

                <section className="mt-7">
                    {kendaraanDifilter.length ===
                    0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-[#1E293B] px-6 py-16 text-center">
                            <p className="text-lg font-bold">
                                Data kendaraan tidak
                                ditemukan
                            </p>

                            <p className="mt-2 text-sm text-[#94A3B8]">
                                Ubah kata pencarian atau
                                tambahkan kendaraan baru.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {kendaraanDifilter.map(
                                (kendaraan) => {
                                    const foto =
                                        alamatFoto(
                                            kendaraan.foto_kendaraan,
                                        );

                                    return (
                                        <article
                                            key={
                                                kendaraan.id
                                            }
                                            className="overflow-hidden rounded-2xl border border-slate-800 bg-[#1E293B] shadow-xl"
                                        >
                                            <div className="grid sm:grid-cols-[210px_1fr]">
                                                <div className="flex min-h-52 items-center justify-center bg-[#0B1120]">
                                                    {foto ? (
                                                        <img
                                                            src={
                                                                foto
                                                            }
                                                            alt={
                                                                kendaraan.nama_kendaraan
                                                            }
                                                            className="h-full min-h-52 w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="px-5 text-center text-sm text-[#64748B]">
                                                            Foto
                                                            kendaraan
                                                            belum
                                                            tersedia
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-6">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#06B6D4]">
                                                                {
                                                                    kendaraan.merek
                                                                }
                                                            </p>

                                                            <h2 className="mt-2 text-xl font-extrabold">
                                                                {
                                                                    kendaraan.nama_kendaraan
                                                                }
                                                            </h2>

                                                            <p className="mt-1 text-sm text-[#94A3B8]">
                                                                {
                                                                    kendaraan.plat_nomor
                                                                }
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${kelasStatus(
                                                                kendaraan.status,
                                                            )}`}
                                                        >
                                                            {labelStatus(
                                                                kendaraan.status,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                                        <div className="rounded-xl bg-[#0B1120] p-3">
                                                            <p className="text-xs text-[#64748B]">
                                                                Harga/Hari
                                                            </p>

                                                            <p className="mt-1 font-bold text-[#F8FAFC]">
                                                                {formatRupiah(
                                                                    kendaraan.harga_per_hari,
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-[#0B1120] p-3">
                                                            <p className="text-xs text-[#64748B]">
                                                                Jumlah Unit
                                                            </p>

                                                            <p className="mt-1 font-bold">
                                                                {
                                                                    kendaraan.jumlah_unit
                                                                }{' '}
                                                                unit
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-[#0B1120] p-3">
                                                            <p className="text-xs text-[#64748B]">
                                                                Transmisi
                                                            </p>

                                                            <p className="mt-1 font-bold capitalize">
                                                                {
                                                                    kendaraan.transmisi
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-[#0B1120] p-3">
                                                            <p className="text-xs text-[#64748B]">
                                                                Riwayat
                                                            </p>

                                                            <p className="mt-1 font-bold">
                                                                {kendaraan.sewas_count ??
                                                                    0}{' '}
                                                                transaksi
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 flex gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                bukaEdit(
                                                                    kendaraan,
                                                                )
                                                            }
                                                            className="flex-1 rounded-xl border border-[#06B6D4]/50 px-4 py-2.5 text-sm font-bold text-[#06B6D4] transition hover:bg-[#06B6D4]/10"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                hapusKendaraan(
                                                                    kendaraan,
                                                                )
                                                            }
                                                            className="flex-1 rounded-xl border border-rose-500/40 px-4 py-2.5 text-sm font-bold text-rose-400 transition hover:bg-rose-500/10"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    )}
                </section>
            </main>

            {modalTerbuka && (
                <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm">
                    <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-700 bg-[#1E293B] shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-700 px-6 py-5 sm:px-8">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                    Manajemen Armada
                                </p>

                                <h2 className="mt-2 text-2xl font-extrabold">
                                    {kendaraanDipilih
                                        ? 'Edit Kendaraan'
                                        : 'Tambah Kendaraan'}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={tutupModal}
                                disabled={
                                    form.processing
                                }
                                className="rounded-xl border border-slate-600 px-3 py-2 text-sm font-bold text-[#94A3B8] hover:text-white"
                            >
                                Tutup
                            </button>
                        </div>

                        <form
                            onSubmit={
                                simpanKendaraan
                            }
                            className="p-6 sm:p-8"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <LabelInput wajib>
                                        Nama Kendaraan
                                    </LabelInput>

                                    <input
                                        type="text"
                                        value={
                                            form.data
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
                                            kelasInput
                                        }
                                        required
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .nama_kendaraan
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Merek
                                    </LabelInput>

                                    <input
                                        type="text"
                                        value={
                                            form.data
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
                                            kelasInput
                                        }
                                        required
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .merek
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Warna
                                    </LabelInput>

                                    <input
                                        type="text"
                                        value={
                                            form.data
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
                                            kelasInput
                                        }
                                        required
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .warna
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Plat Nomor
                                    </LabelInput>

                                    <input
                                        type="text"
                                        value={
                                            form.data
                                                .plat_nomor
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'plat_nomor',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className={`${kelasInput} uppercase`}
                                        placeholder="KB 1234 AA"
                                        required
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .plat_nomor
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Tahun Pembuatan
                                    </LabelInput>

                                    <input
                                        type="number"
                                        value={
                                            form.data
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
                                        min="1900"
                                        max={
                                            new Date()
                                                .getFullYear() +
                                            1
                                        }
                                        className={
                                            kelasInput
                                        }
                                        required
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .tahun_pembuatan
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Transmisi
                                    </LabelInput>

                                    <select
                                        value={
                                            form.data
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
                                            kelasInput
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

                                    <PesanError
                                        message={
                                            form.errors
                                                .transmisi
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Kapasitas Penumpang
                                    </LabelInput>

                                    <input
                                        type="number"
                                        value={
                                            form.data
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
                                        min="1"
                                        className={
                                            kelasInput
                                        }
                                        required
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .kapasitas_penumpang
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Jumlah Unit
                                    </LabelInput>

                                    <input
                                        type="number"
                                        value={
                                            form.data
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
                                        min="1"
                                        className={
                                            kelasInput
                                        }
                                        required
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .jumlah_unit
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Harga per Hari
                                    </LabelInput>

                                    <input
                                        type="number"
                                        value={
                                            form.data
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
                                        min="1"
                                        className={
                                            kelasInput
                                        }
                                        required
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .harga_per_hari
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelInput wajib>
                                        Status Operasional
                                    </LabelInput>

                                    <select
                                        value={
                                            form.data
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
                                            kelasInput
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

                                    <PesanError
                                        message={
                                            form.errors
                                                .status
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <LabelInput>
                                        Foto Kendaraan
                                    </LabelInput>

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={
                                            ubahFoto
                                        }
                                        className="block w-full rounded-xl border border-dashed border-slate-600 bg-[#0B1120] px-4 py-4 text-sm text-[#94A3B8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#06B6D4] file:px-4 file:py-2 file:font-bold file:text-[#0B1120]"
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .foto_kendaraan
                                        }
                                    />

                                    {previewFoto && (
                                        <div className="mt-4 h-56 overflow-hidden rounded-xl border border-slate-700 bg-[#0B1120]">
                                            <img
                                                src={
                                                    previewFoto
                                                }
                                                alt="Pratinjau kendaraan"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <LabelInput>
                                        Fasilitas
                                    </LabelInput>

                                    <textarea
                                        value={
                                            form.data
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
                                        rows="3"
                                        className={
                                            kelasInput
                                        }
                                        placeholder="AC, Bluetooth, Airbag, Charger USB"
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .fasilitas
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <LabelInput>
                                        Deskripsi Kendaraan
                                    </LabelInput>

                                    <textarea
                                        value={
                                            form.data
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
                                        rows="5"
                                        className={
                                            kelasInput
                                        }
                                        placeholder="Tuliskan kondisi, keunggulan, dan penggunaan kendaraan"
                                    />

                                    <PesanError
                                        message={
                                            form.errors
                                                .deskripsi_kendaraan
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-700 pt-6 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={tutupModal}
                                    disabled={
                                        form.processing
                                    }
                                    className="rounded-xl border border-slate-600 px-6 py-3 font-bold text-[#94A3B8]"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        form.processing
                                    }
                                    className="rounded-xl bg-[#06B6D4] px-6 py-3 font-bold text-[#0B1120] transition hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : kendaraanDipilih
                                          ? 'Simpan Perubahan'
                                          : 'Tambah Kendaraan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
