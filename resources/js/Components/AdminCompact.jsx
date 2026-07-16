const STATUS_MAP = {
    menunggu_konfirmasi_admin: [
        'Menunggu Konfirmasi',
        'border-amber-500/30 bg-amber-500/10 text-amber-300',
    ],
    menunggu_identitas: [
        'Menunggu Identitas',
        'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    ],
    menunggu_verifikasi_identitas: [
        'Verifikasi Identitas',
        'border-sky-500/30 bg-sky-500/10 text-sky-300',
    ],
    identitas_ditolak: [
        'Identitas Ditolak',
        'border-rose-500/30 bg-rose-500/10 text-rose-300',
    ],
    menunggu_pembayaran: [
        'Menunggu Pembayaran',
        'border-violet-500/30 bg-violet-500/10 text-violet-300',
    ],
    menunggu_verifikasi_pembayaran: [
        'Verifikasi Pembayaran',
        'border-blue-500/30 bg-blue-500/10 text-blue-300',
    ],
    ditolak_pembayaran: [
        'Pembayaran Ditolak',
        'border-rose-500/30 bg-rose-500/10 text-rose-300',
    ],
    disetujui_operasional: [
        'Disetujui',
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    ],
    sedang_berlangsung: [
        'Berlangsung',
        'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    ],
    menunggu_verifikasi_pengembalian: [
        'Verifikasi Pengembalian',
        'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    ],
    selesai: [
        'Selesai',
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    ],
    ditolak_booking: [
        'Booking Ditolak',
        'border-rose-500/30 bg-rose-500/10 text-rose-300',
    ],
    dibatalkan: [
        'Dibatalkan',
        'border-slate-600 bg-slate-800 text-slate-300',
    ],
    menunggu_verifikasi: [
        'Perlu Diperiksa',
        'border-sky-500/30 bg-sky-500/10 text-sky-300',
    ],
    terverifikasi: [
        'Terverifikasi',
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    ],
    ditolak: [
        'Ditolak',
        'border-rose-500/30 bg-rose-500/10 text-rose-300',
    ],
    tersedia: [
        'Tersedia',
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    ],
    perbaikan: [
        'Perbaikan',
        'border-amber-500/30 bg-amber-500/10 text-amber-300',
    ],
    tidak_aktif: [
        'Tidak Aktif',
        'border-slate-600 bg-slate-800 text-slate-300',
    ],
};

export const inputClass =
    'h-10 w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] disabled:cursor-not-allowed disabled:opacity-50';

export const textareaClass =
    'w-full resize-none rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] disabled:cursor-not-allowed disabled:opacity-50';

export function formatRupiah(value) {
    return Number(value ?? 0).toLocaleString(
        'id-ID',
    );
}

export function formatTanggal(value) {
    if (!value) {
        return '-';
    }

    const dateOnly = String(value).split('T')[0];

    const date = new Date(
        `${dateOnly}T00:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function formatWaktu(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function PageHeader({
    eyebrow,
    title,
    description,
    action = null,
}) {
    return (
        <section className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#10192B] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                    {eyebrow}
                </p>

                <h1 className="mt-1 text-2xl font-black text-white">
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                )}
            </div>

            {action}
        </section>
    );
}

export function Panel({
    title,
    description,
    action = null,
    children,
    className = '',
}) {
    return (
        <section
            className={`overflow-hidden rounded-xl border border-slate-800 bg-[#10192B] ${className}`}
        >
            {(title || action) && (
                <header className="flex flex-col gap-2 border-b border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {title && (
                            <h2 className="text-sm font-black text-white">
                                {title}
                            </h2>
                        )}

                        {description && (
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>

                    {action}
                </header>
            )}

            {children}
        </section>
    );
}

export function StatCard({
    label,
    value,
    description,
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
                {value ?? 0}
            </p>

            {description && (
                <p className="mt-0.5 truncate text-[10px] text-slate-600">
                    {description}
                </p>
            )}
        </div>
    );
}

export function StatusBadge({
    status,
}) {
    const fallback = [
        String(status ?? '-').replaceAll(
            '_',
            ' ',
        ),
        'border-slate-600 bg-slate-800 text-slate-300',
    ];

    const info =
        STATUS_MAP[status] ?? fallback;

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${info[1]}`}
        >
            {info[0]}
        </span>
    );
}

export function Field({
    id,
    label,
    error,
    required = false,
    children,
    className = '',
}) {
    return (
        <div className={className}>
            <label
                htmlFor={id}
                className="mb-1 block text-[10px] font-black uppercase tracking-[0.11em] text-slate-500"
            >
                {label}

                {required && (
                    <span className="ml-1 text-rose-400">
                        *
                    </span>
                )}
            </label>

            {children}

            {error && (
                <p className="mt-1 text-[11px] leading-4 text-rose-400">
                    {error}
                </p>
            )}
        </div>
    );
}

export function EmptyState({
    icon = '📋',
    title = 'Data belum tersedia',
    description = 'Belum ada data yang dapat ditampilkan.',
}) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
            <span className="text-4xl opacity-40">
                {icon}
            </span>

            <p className="mt-3 text-sm font-black text-white">
                {title}
            </p>

            <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}

export function FlashMessage({
    flash = {},
    errors = {},
}) {
    const firstError =
        Object.values(errors ?? {})[0];

    if (
        !flash?.success &&
        !flash?.error &&
        !flash?.warning &&
        !firstError
    ) {
        return null;
    }

    return (
        <section className="mt-3 space-y-2">
            {flash?.success && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-300">
                    {flash.success}
                </div>
            )}

            {flash?.warning && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-300">
                    {flash.warning}
                </div>
            )}

            {(flash?.error || firstError) && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300">
                    {flash?.error ??
                        firstError}
                </div>
            )}
        </section>
    );
}
