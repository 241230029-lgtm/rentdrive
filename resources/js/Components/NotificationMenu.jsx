import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const konfigurasiJenis = {
    booking_baru: {
        ikon: 'calendar',
        kelas: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    },
    booking_disetujui: {
        ikon: 'check',
        kelas: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
    booking_ditolak: {
        ikon: 'close',
        kelas: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },
    pembayaran_baru: {
        ikon: 'card',
        kelas: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },
    pembayaran_disetujui: {
        ikon: 'check',
        kelas: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
    pembayaran_ditolak: {
        ikon: 'close',
        kelas: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },
    pengembalian_baru: {
        ikon: 'return',
        kelas: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    },
    pengembalian_diproses: {
        ikon: 'return',
        kelas: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    },
    transaksi_selesai: {
        ikon: 'check',
        kelas: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
    informasi: {
        ikon: 'info',
        kelas: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    },
};

function formatWaktu(tanggal) {
    if (!tanggal) {
        return '';
    }

    const waktu = new Date(tanggal);

    if (Number.isNaN(waktu.getTime())) {
        return '';
    }

    const selisihMenit = Math.max(
        0,
        Math.floor((Date.now() - waktu.getTime()) / 60000),
    );

    if (selisihMenit < 1) {
        return 'Baru saja';
    }

    if (selisihMenit < 60) {
        return `${selisihMenit} menit lalu`;
    }

    const selisihJam = Math.floor(selisihMenit / 60);

    if (selisihJam < 24) {
        return `${selisihJam} jam lalu`;
    }

    const selisihHari = Math.floor(selisihJam / 24);

    if (selisihHari < 7) {
        return `${selisihHari} hari lalu`;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(waktu);
}

function IkonLonceng({ className = 'h-5 w-5' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={className}
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
            />
            <path strokeLinecap="round" d="M10 21h4" />
        </svg>
    );
}

function IkonJenis({ jenis }) {
    const konfigurasi =
        konfigurasiJenis[jenis] ?? konfigurasiJenis.informasi;

    let ikon;

    if (konfigurasi.ikon === 'check') {
        ikon = (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="9" />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8 12 2.5 2.5L16 9"
                />
            </svg>
        );
    } else if (konfigurasi.ikon === 'close') {
        ikon = (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="9" />
                <path
                    strokeLinecap="round"
                    d="m9 9 6 6M15 9l-6 6"
                />
            </svg>
        );
    } else if (konfigurasi.ikon === 'card') {
        ikon = (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path strokeLinecap="round" d="M3 9h18M7 15h3" />
            </svg>
        );
    } else if (konfigurasi.ikon === 'return') {
        ikon = (
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
                    d="M9 7H5v4"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.5 10A7 7 0 1 1 7 17"
                />
                <path strokeLinecap="round" d="M12 8v4l3 2" />
            </svg>
        );
    } else if (konfigurasi.ikon === 'calendar') {
        ikon = (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <rect x="4" y="5" width="16" height="15" rx="2" />
                <path strokeLinecap="round" d="M8 3v4M16 3v4M4 10h16" />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 15 2 2 4-4"
                />
            </svg>
        );
    } else {
        ikon = (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
            </svg>
        );
    }

    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${konfigurasi.kelas}`}
        >
            {ikon}
        </div>
    );
}

export default function NotificationMenu({
    daftar = [],
    jumlahBelumDibaca = 0,
}) {
    const [terbuka, setTerbuka] = useState(false);
    const [sedangMemproses, setSedangMemproses] = useState(null);
    const pembungkusRef = useRef(null);

    const notifikasi = Array.isArray(daftar) ? daftar : [];
    const jumlah = Number(jumlahBelumDibaca ?? 0);

    useEffect(() => {
        const tutupDariLuar = (event) => {
            if (
                pembungkusRef.current &&
                !pembungkusRef.current.contains(event.target)
            ) {
                setTerbuka(false);
            }
        };

        const tutupDenganEscape = (event) => {
            if (event.key === 'Escape') {
                setTerbuka(false);
            }
        };

        document.addEventListener('mousedown', tutupDariLuar);
        document.addEventListener('keydown', tutupDenganEscape);

        return () => {
            document.removeEventListener('mousedown', tutupDariLuar);
            document.removeEventListener('keydown', tutupDenganEscape);
        };
    }, []);

    const bacaNotifikasi = (id) => {
        if (sedangMemproses) {
            return;
        }

        setSedangMemproses(id);

        router.post(
            route('notifikasi.baca', id),
            {},
            {
                preserveScroll: false,
                preserveState: false,
                onFinish: () => {
                    setSedangMemproses(null);
                    setTerbuka(false);
                },
            },
        );
    };

    const bacaSemua = () => {
        if (sedangMemproses || jumlah < 1) {
            return;
        }

        setSedangMemproses('semua');

        router.post(
            route('notifikasi.baca-semua'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setTerbuka(false),
                onFinish: () => setSedangMemproses(null),
            },
        );
    };

    return (
        <div ref={pembungkusRef} className="relative">
            <button
                type="button"
                onClick={() => setTerbuka((nilai) => !nilai)}
                aria-label="Buka notifikasi"
                aria-expanded={terbuka}
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    terbuka
                        ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4]'
                        : 'border-slate-700 bg-[#10192B] text-[#94A3B8] hover:border-[#06B6D4] hover:text-[#06B6D4]'
                }`}
            >
                <IkonLonceng />

                {jumlah > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0B1120] bg-rose-500 px-1 text-[9px] font-black leading-none text-white">
                        {jumlah > 99 ? '99+' : jumlah}
                    </span>
                )}
            </button>

            {terbuka && (
                <div className="fixed left-4 right-4 top-[76px] z-[100] overflow-hidden rounded-2xl border border-slate-700 bg-[#10192B] shadow-2xl shadow-black/50 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[390px]">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3.5">
                        <div>
                            <h2 className="text-sm font-extrabold text-white">
                                Notifikasi
                            </h2>
                            <p className="mt-0.5 text-[11px] text-[#64748B]">
                                {jumlah > 0
                                    ? `${jumlah} notifikasi belum dibaca`
                                    : 'Tidak ada notifikasi baru'}
                            </p>
                        </div>

                        {jumlah > 0 && (
                            <button
                                type="button"
                                onClick={bacaSemua}
                                disabled={sedangMemproses === 'semua'}
                                className="shrink-0 text-[11px] font-bold text-[#06B6D4] transition hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {sedangMemproses === 'semua'
                                    ? 'Memproses...'
                                    : 'Baca semua'}
                            </button>
                        )}
                    </div>

                    {notifikasi.length > 0 ? (
                        <div className="max-h-[min(480px,calc(100dvh-150px))] overflow-y-auto">
                            {notifikasi.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => bacaNotifikasi(item.id)}
                                    disabled={sedangMemproses === item.id}
                                    className={`relative flex w-full gap-3 border-b border-slate-800 px-4 py-3.5 text-left transition last:border-b-0 hover:bg-[#1E293B] disabled:cursor-wait ${
                                        item.sudah_dibaca
                                            ? 'bg-[#10192B]'
                                            : 'bg-[#06B6D4]/[0.055]'
                                    }`}
                                >
                                    {!item.sudah_dibaca && (
                                        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#06B6D4]" />
                                    )}

                                    <IkonJenis jenis={item.jenis} />

                                    <div className="min-w-0 flex-1 pr-3">
                                        <p
                                            className={`truncate text-sm ${
                                                item.sudah_dibaca
                                                    ? 'font-semibold text-[#CBD5E1]'
                                                    : 'font-extrabold text-white'
                                            }`}
                                        >
                                            {item.judul ?? 'Notifikasi'}
                                        </p>

                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#94A3B8]">
                                            {item.pesan ?? ''}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                                            {item.nomor_booking && (
                                                <span className="max-w-[190px] truncate text-[10px] font-bold uppercase tracking-wider text-[#06B6D4]">
                                                    {item.nomor_booking}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-[#64748B]">
                                                {formatWaktu(item.dibuat_pada)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-10 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-[#06B6D4]">
                                <IkonLonceng className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-sm font-bold text-white">
                                Belum ada notifikasi
                            </h3>
                            <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#64748B]">
                                Aktivitas booking, pembayaran, dan pengembalian
                                akan tampil di sini.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
