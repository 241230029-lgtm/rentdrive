import PelangganLayout from '@/Layouts/PelangganLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import {
    Head,
    Link,
    usePage,
} from '@inertiajs/react';

function IkonProfil() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="8"
                r="3"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"
            />
        </svg>
    );
}

function IkonKunci() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
            />

            <path
                strokeLinecap="round"
                d="M8 10V7a4 4 0 0 1 8 0v3"
            />
        </svg>
    );
}

function IkonPeringatan() {
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
                d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
            />

            <path
                strokeLinecap="round"
                d="M12 8v5"
            />

            <circle
                cx="12"
                cy="16.5"
                r=".7"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

function HeaderKartu({
    ikon,
    judul,
    deskripsi,
    danger = false,
}) {
    return (
        <header
            className={`flex items-start gap-3 border-b px-4 py-3 ${
                danger
                    ? 'border-rose-500/30'
                    : 'border-slate-800'
            }`}
        >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                    danger
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                        : 'border-[#06B6D4]/20 bg-[#06B6D4]/10 text-[#06B6D4]'
                }`}
            >
                {ikon}
            </div>

            <div>
                <h2
                    className={`text-sm font-black ${
                        danger
                            ? 'text-rose-300'
                            : 'text-white'
                    }`}
                >
                    {judul}
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    {deskripsi}
                </p>
            </div>
        </header>
    );
}

export default function Edit({
    mustVerifyEmail,
    status,
}) {
    const {
        auth,
    } = usePage().props;

    const user =
        auth?.user ?? null;

    const hurufAwal =
        user?.name
            ?.charAt(0)
            ?.toUpperCase() ?? 'P';

    return (
        <>
            <Head title="Profil Pelanggan" />

            <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <section className="rounded-2xl border border-slate-800 bg-[#10192B] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#06B6D4]/30 bg-[#06B6D4]/10 text-base font-black text-[#06B6D4]">
                                {hurufAwal}
                            </div>

                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#06B6D4]">
                                    Akun Pelanggan
                                </p>

                                <h1 className="mt-1 truncate text-xl font-black text-white">
                                    {user?.name ??
                                        'Pelanggan'}
                                </h1>

                                <p className="mt-1 truncate text-[10px] text-slate-500">
                                    {user?.email ??
                                        '-'}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route(
                                'pelanggan.riwayat',
                            )}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 px-4 text-xs font-black text-slate-300 transition hover:border-[#06B6D4] hover:text-[#06B6D4]"
                        >
                            Riwayat Sewa
                        </Link>
                    </div>
                </section>

                <section className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="h-fit overflow-hidden rounded-2xl border border-slate-800 bg-[#10192B]">
                        <HeaderKartu
                            ikon={
                                <IkonProfil />
                            }
                            judul="Informasi Profil"
                            deskripsi="Perbarui nama dan alamat email akun."
                        />

                        <div className="p-4">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={
                                    mustVerifyEmail
                                }
                                status={
                                    status
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#10192B]">
                            <HeaderKartu
                                ikon={
                                    <IkonKunci />
                                }
                                judul="Ubah Kata Sandi"
                                deskripsi="Gunakan minimal delapan karakter."
                            />

                            <div className="p-4">
                                <UpdatePasswordForm />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-rose-500/40 bg-rose-500/[0.04]">
                            <HeaderKartu
                                ikon={
                                    <IkonPeringatan />
                                }
                                judul="Hapus Akun"
                                deskripsi="Penghapusan akun bersifat permanen dan menghentikan seluruh akses pelanggan."
                                danger
                            />

                            <div className="p-4">
                                <DeleteUserForm />
                            </div>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}

Edit.layout = (page) => (
    <PelangganLayout>
        {page}
    </PelangganLayout>
);
