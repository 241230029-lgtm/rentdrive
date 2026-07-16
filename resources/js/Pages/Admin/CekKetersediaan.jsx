import AdminLayout from '@/Layouts/AdminLayout';
import {
    Head,
    Link,
} from '@inertiajs/react';
import {
    useMemo,
    useState,
} from 'react';

const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-xs font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/10 disabled:cursor-not-allowed disabled:opacity-50';

function formatRupiah(nilai) {
    return Number(
        nilai ?? 0,
    ).toLocaleString(
        'id-ID',
    );
}

function tanggalHariIni() {
    const sekarang =
        new Date();

    const tanggalLokal =
        new Date(
            sekarang.getTime() -
                sekarang.getTimezoneOffset() *
                    60000,
        );

    return tanggalLokal
        .toISOString()
        .split('T')[0];
}

function buatUrlFoto(path) {
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

function formatStatus(status) {
    const daftarStatus = {
        tersedia:
            'Tersedia',

        perbaikan:
            'Perbaikan',

        tidak_aktif:
            'Tidak Aktif',

        disewa:
            'Disewa',
    };

    return (
        daftarStatus[status] ??
        String(
            status ?? '-',
        ).replaceAll(
            '_',
            ' ',
        )
    );
}

function kelasStatus(status) {
    if (
        status ===
        'tersedia'
    ) {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    }

    if (
        status ===
        'perbaikan'
    ) {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    }

    return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
}

function StatCard({
    label,
    value,
    valueClass = 'text-white',
}) {
    return (
        <article className="rounded-xl border border-slate-800 bg-[#10192B] px-3 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-500">
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

function ResultCard({
    label,
    value,
    valueClass = 'text-white',
}) {
    return (
        <article className="rounded-xl border border-slate-800 bg-[#0B1120] p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                {label}
            </p>

            <p
                className={`mt-1 text-lg font-black ${valueClass}`}
            >
                {value}
            </p>
        </article>
    );
}

function CekKetersediaan({
    kendaraans = [],
    ringkasan = {},
}) {
    const daftarKendaraan =
        Array.isArray(
            kendaraans,
        )
            ? kendaraans
            : [];

    const hariIni =
        useMemo(
            () =>
                tanggalHariIni(),
            [],
        );

    const [
        form,
        setForm,
    ] = useState({
        kendaraan_id: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
    });

    const [
        pencarian,
        setPencarian,
    ] = useState('');

    const [
        hasil,
        setHasil,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        pesanError,
        setPesanError,
    ] = useState('');

    const kendaraanDipilih =
        useMemo(() => {
            return daftarKendaraan.find(
                (kendaraan) =>
                    Number(
                        kendaraan.id,
                    ) ===
                    Number(
                        form.kendaraan_id,
                    ),
            );
        }, [
            daftarKendaraan,
            form.kendaraan_id,
        ]);

    const kendaraanFilter =
        useMemo(() => {
            const keyword =
                pencarian
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return daftarKendaraan;
            }

            return daftarKendaraan.filter(
                (kendaraan) =>
                    [
                        kendaraan.nama_kendaraan,
                        kendaraan.merek,
                        kendaraan.plat_nomor,
                        kendaraan.warna,
                        kendaraan.transmisi,
                        kendaraan.status,
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()
                        .includes(
                            keyword,
                        ),
            );
        }, [
            daftarKendaraan,
            pencarian,
        ]);

    const ubahForm = (
        nama,
        nilai,
    ) => {
        setForm(
            (sebelumnya) => ({
                ...sebelumnya,
                [nama]:
                    nilai,
            }),
        );

        setHasil(null);
        setPesanError('');
    };

    const periksa =
        async (event) => {
            event.preventDefault();

            setPesanError('');
            setHasil(null);

            if (
                !form.kendaraan_id ||
                !form.tanggal_mulai ||
                !form.tanggal_selesai
            ) {
                setPesanError(
                    'Pilih kendaraan, tanggal mulai, dan tanggal selesai.',
                );

                return;
            }

            if (
                form.tanggal_selesai <=
                form.tanggal_mulai
            ) {
                setPesanError(
                    'Tanggal selesai harus setelah tanggal mulai.',
                );

                return;
            }

            setLoading(true);

            try {
                const parameter =
                    new URLSearchParams({
                        kendaraan_id:
                            form.kendaraan_id,

                        tanggal_mulai:
                            form.tanggal_mulai,

                        tanggal_selesai:
                            form.tanggal_selesai,
                    });

                const response =
                    await fetch(
                        `${route(
                            'admin.ketersediaan.periksa',
                        )}?${parameter.toString()}`,
                        {
                            method:
                                'GET',

                            headers: {
                                Accept:
                                    'application/json',

                                'X-Requested-With':
                                    'XMLHttpRequest',
                            },

                            credentials:
                                'same-origin',
                        },
                    );

                const data =
                    await response.json();

                if (
                    !response.ok
                ) {
                    const daftarValidasi =
                        Object.values(
                            data.errors ??
                                {},
                        )
                            .flat()
                            .filter(
                                Boolean,
                            );

                    throw new Error(
                        daftarValidasi[0] ??
                            data.message ??
                            'Ketersediaan kendaraan gagal diperiksa.',
                    );
                }

                setHasil(
                    data,
                );
            } catch (error) {
                setPesanError(
                    error?.message ??
                        'Terjadi kesalahan ketika memeriksa ketersediaan.',
                );
            } finally {
                setLoading(false);
            }
        };

    const resetForm = () => {
        setForm({
            kendaraan_id: '',
            tanggal_mulai: '',
            tanggal_selesai: '',
        });

        setHasil(null);
        setPesanError('');
    };

    return (
        <>
            <Head title="Cek Ketersediaan" />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5">
                <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                            Operasional Armada
                        </p>

                        <h1 className="mt-1 text-2xl font-black text-white">
                            Cek Ketersediaan
                        </h1>

                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                            Periksa jumlah unit
                            kendaraan yang masih
                            tersedia berdasarkan
                            kendaraan dan rentang
                            tanggal penyewaan.
                        </p>
                    </div>

                    <Link
                        href={route(
                            'admin.booking.index',
                        )}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-300 transition hover:border-[#06B6D4] hover:text-[#06B6D4]"
                    >
                        Kembali ke Booking
                    </Link>
                </header>

                <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-5">
                    <StatCard
                        label="Jenis Kendaraan"
                        value={
                            ringkasan.total_kendaraan
                        }
                    />

                    <StatCard
                        label="Total Unit"
                        value={
                            ringkasan.total_unit
                        }
                        valueClass="text-[#06B6D4]"
                    />

                    <StatCard
                        label="Status Tersedia"
                        value={
                            ringkasan.kendaraan_tersedia
                        }
                        valueClass="text-emerald-300"
                    />

                    <StatCard
                        label="Perbaikan"
                        value={
                            ringkasan.kendaraan_perbaikan
                        }
                        valueClass="text-amber-300"
                    />

                    <StatCard
                        label="Tidak Aktif"
                        value={
                            ringkasan.kendaraan_tidak_aktif
                        }
                        valueClass="text-rose-300"
                    />
                </section>

                <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <form
                        onSubmit={
                            periksa
                        }
                        className="rounded-xl border border-slate-800 bg-[#10192B]"
                    >
                        <header className="border-b border-slate-800 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#06B6D4]">
                                Pemeriksaan Jadwal
                            </p>

                            <h2 className="mt-1 text-sm font-black text-white">
                                Pilih Kendaraan dan Tanggal
                            </h2>
                        </header>

                        <div className="grid gap-3 p-4 md:grid-cols-3">
                            <div>
                                <label
                                    htmlFor="kendaraan_id"
                                    className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500"
                                >
                                    Kendaraan
                                </label>

                                <select
                                    id="kendaraan_id"
                                    value={
                                        form.kendaraan_id
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        ubahForm(
                                            'kendaraan_id',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                >
                                    <option value="">
                                        Pilih kendaraan
                                    </option>

                                    {daftarKendaraan.map(
                                        (
                                            kendaraan,
                                        ) => (
                                            <option
                                                key={
                                                    kendaraan.id
                                                }
                                                value={
                                                    kendaraan.id
                                                }
                                            >
                                                {
                                                    kendaraan.nama_kendaraan
                                                }{' '}
                                                —{' '}
                                                {
                                                    kendaraan.merek
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="tanggal_mulai"
                                    className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500"
                                >
                                    Tanggal Mulai
                                </label>

                                <input
                                    id="tanggal_mulai"
                                    type="date"
                                    min={
                                        hariIni
                                    }
                                    value={
                                        form.tanggal_mulai
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        ubahForm(
                                            'tanggal_mulai',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="tanggal_selesai"
                                    className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-slate-500"
                                >
                                    Tanggal Selesai
                                </label>

                                <input
                                    id="tanggal_selesai"
                                    type="date"
                                    min={
                                        form.tanggal_mulai ||
                                        hariIni
                                    }
                                    value={
                                        form.tanggal_selesai
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        ubahForm(
                                            'tanggal_selesai',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />
                            </div>
                        </div>

                        {pesanError && (
                            <div className="mx-4 mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300">
                                {pesanError}
                            </div>
                        )}

                        <footer className="flex flex-col gap-2 border-t border-slate-800 px-4 py-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={
                                    loading
                                }
                                onClick={
                                    resetForm
                                }
                                className="h-9 rounded-lg border border-slate-700 px-4 text-xs font-bold text-slate-400 hover:border-slate-500 hover:text-white disabled:opacity-50"
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                className="h-9 rounded-lg bg-[#06B6D4] px-5 text-xs font-black text-[#0B1120] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? 'Memeriksa...'
                                    : 'Cek Ketersediaan'}
                            </button>
                        </footer>
                    </form>

                    <aside className="rounded-xl border border-slate-800 bg-[#10192B]">
                        <header className="border-b border-slate-800 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#06B6D4]">
                                Kendaraan Dipilih
                            </p>

                            <h2 className="mt-1 text-sm font-black text-white">
                                Informasi Armada
                            </h2>
                        </header>

                        {kendaraanDipilih ? (
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-[#0B1120]">
                                        {kendaraanDipilih.foto_kendaraan ? (
                                            <img
                                                src={buatUrlFoto(
                                                    kendaraanDipilih.foto_kendaraan,
                                                )}
                                                alt={
                                                    kendaraanDipilih.nama_kendaraan
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl opacity-40">
                                                🛵
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black text-white">
                                            {
                                                kendaraanDipilih.nama_kendaraan
                                            }
                                        </p>

                                        <p className="mt-1 truncate text-[10px] text-slate-500">
                                            {
                                                kendaraanDipilih.merek
                                            }{' '}
                                            •{' '}
                                            {
                                                kendaraanDipilih.plat_nomor
                                            }
                                        </p>

                                        <span
                                            className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[8px] font-black uppercase ${kelasStatus(
                                                kendaraanDipilih.status,
                                            )}`}
                                        >
                                            {formatStatus(
                                                kendaraanDipilih.status,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <ResultCard
                                        label="Total Unit"
                                        value={
                                            kendaraanDipilih.jumlah_unit
                                        }
                                    />

                                    <ResultCard
                                        label="Harga/Hari"
                                        value={`Rp ${formatRupiah(
                                            kendaraanDipilih.harga_per_hari,
                                        )}`}
                                        valueClass="text-[#06B6D4]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
                                <span className="text-4xl opacity-30">
                                    🛵
                                </span>

                                <p className="mt-3 text-xs font-black text-white">
                                    Belum ada kendaraan dipilih
                                </p>

                                <p className="mt-1 text-[10px] leading-4 text-slate-600">
                                    Pilih kendaraan pada
                                    formulir untuk melihat
                                    detail armada.
                                </p>
                            </div>
                        )}
                    </aside>
                </section>

                {hasil && (
                    <section
                        className={`mt-3 rounded-xl border ${
                            hasil.tersedia
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : 'border-rose-500/30 bg-rose-500/5'
                        }`}
                    >
                        <header className="flex flex-col gap-2 border-b border-slate-800/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                                    Hasil Pemeriksaan
                                </p>

                                <h2
                                    className={`mt-1 text-base font-black ${
                                        hasil.tersedia
                                            ? 'text-emerald-300'
                                            : 'text-rose-300'
                                    }`}
                                >
                                    {hasil.pesan}
                                </h2>
                            </div>

                            <span
                                className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[9px] font-black uppercase ${
                                    hasil.tersedia
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                        : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                                }`}
                            >
                                {hasil.tersedia
                                    ? 'Tersedia'
                                    : 'Tidak Tersedia'}
                            </span>
                        </header>

                        <div className="grid grid-cols-2 gap-2 p-4 lg:grid-cols-4">
                            <ResultCard
                                label="Total Unit"
                                value={
                                    hasil.total_unit
                                }
                            />

                            <ResultCard
                                label="Unit Terpakai"
                                value={
                                    hasil.unit_terpakai
                                }
                                valueClass="text-amber-300"
                            />

                            <ResultCard
                                label="Unit Tersedia"
                                value={
                                    hasil.unit_tersedia
                                }
                                valueClass={
                                    hasil.unit_tersedia >
                                    0
                                        ? 'text-emerald-300'
                                        : 'text-rose-300'
                                }
                            />

                            <ResultCard
                                label="Status Operasional"
                                value={formatStatus(
                                    hasil.status_operasional,
                                )}
                            />
                        </div>
                    </section>
                )}

                <section className="mt-3 rounded-xl border border-slate-800 bg-[#10192B]">
                    <header className="flex flex-col gap-2 border-b border-slate-800 px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#06B6D4]">
                                Daftar Armada
                            </p>

                            <h2 className="mt-1 text-sm font-black text-white">
                                Informasi Stok Kendaraan
                            </h2>
                        </div>

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
                            placeholder="Cari kendaraan atau plat nomor"
                            className={`${inputClass} md:w-80`}
                        />
                    </header>

                    {kendaraanFilter.length ===
                    0 ? (
                        <div className="flex min-h-44 items-center justify-center p-5 text-xs text-slate-500">
                            Kendaraan tidak ditemukan.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <thead className="border-b border-slate-800 bg-[#0B1120] text-[9px] font-black uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">
                                            Kendaraan
                                        </th>

                                        <th className="px-4 py-3">
                                            Plat Nomor
                                        </th>

                                        <th className="px-4 py-3">
                                            Spesifikasi
                                        </th>

                                        <th className="px-4 py-3">
                                            Harga/Hari
                                        </th>

                                        <th className="px-4 py-3">
                                            Total Unit
                                        </th>

                                        <th className="px-4 py-3">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800">
                                    {kendaraanFilter.map(
                                        (
                                            kendaraan,
                                        ) => (
                                            <tr
                                                key={
                                                    kendaraan.id
                                                }
                                                className="hover:bg-white/[0.02]"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="text-xs font-black text-white">
                                                        {
                                                            kendaraan.nama_kendaraan
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-slate-600">
                                                        {
                                                            kendaraan.merek
                                                        }{' '}
                                                        •{' '}
                                                        {
                                                            kendaraan.warna
                                                        }
                                                    </p>
                                                </td>

                                                <td className="px-4 py-3 text-xs font-bold text-slate-300">
                                                    {
                                                        kendaraan.plat_nomor
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-[11px] text-slate-500">
                                                    {
                                                        kendaraan.tahun_pembuatan
                                                    }{' '}
                                                    •{' '}
                                                    {
                                                        kendaraan.transmisi
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-xs font-black text-[#06B6D4]">
                                                    Rp{' '}
                                                    {formatRupiah(
                                                        kendaraan.harga_per_hari,
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-xs font-black text-white">
                                                    {
                                                        kendaraan.jumlah_unit
                                                    }
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-1 text-[8px] font-black uppercase ${kelasStatus(
                                                            kendaraan.status,
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            kendaraan.status,
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            ubahForm(
                                                                'kendaraan_id',
                                                                String(
                                                                    kendaraan.id,
                                                                ),
                                                            );

                                                            window.scrollTo(
                                                                {
                                                                    top: 0,
                                                                    behavior:
                                                                        'smooth',
                                                                },
                                                            );
                                                        }}
                                                        className="h-8 rounded-lg border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-3 text-[10px] font-black text-[#06B6D4]"
                                                    >
                                                        Pilih
                                                    </button>
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
        </>
    );
}

CekKetersediaan.layout = (
    page,
) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);

export default CekKetersediaan;
