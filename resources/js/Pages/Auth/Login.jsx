import PublicHeader from '@/Components/PublicHeader';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({
    status,
    canResetPassword = true,
}) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('login'), {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#0B1120] font-sans text-[#F8FAFC] antialiased">
            <Head title="Masuk Akun" />

            <PublicHeader halamanAktif="login" />

            <main className="mx-auto flex min-h-[calc(100vh-69px)] max-w-7xl items-center justify-center px-6 py-12">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-[#1E293B] shadow-2xl lg:grid-cols-2">
                    {/* BAGIAN INFORMASI */}
                    <section className="hidden flex-col justify-between bg-[#10192B] p-10 lg:flex">
                        <div>
                            <Link
                                href={route('landing_page')}
                                className="text-3xl font-black tracking-wider"
                            >
                                Rent
                                <span className="text-[#06B6D4]">
                                    Drive
                                </span>
                            </Link>

                            <h1 className="mt-16 text-4xl font-extrabold leading-tight">
                                Selamat datang kembali di perjalanan
                                <span className="text-[#06B6D4]">
                                    {' '}premium
                                </span>
                                Anda.
                            </h1>

                            <p className="mt-5 max-w-md leading-7 text-[#94A3B8]">
                                Masuk untuk memilih kendaraan, melakukan
                                penyewaan, memantau pembayaran, dan melihat
                                riwayat transaksi Anda.
                            </p>
                        </div>

                        <div className="mt-12 rounded-2xl border border-slate-700 bg-[#0B1120]/70 p-5">
                            <p className="text-sm font-bold text-[#F8FAFC]">
                                Rental lebih praktis
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                                Seluruh informasi kendaraan dan transaksi
                                tersimpan dalam satu akun pelanggan.
                            </p>
                        </div>
                    </section>

                    {/* FORM LOGIN */}
                    <section className="p-7 sm:p-10">
                        <div className="mx-auto max-w-md">
                            <div className="mb-8">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                    Akses Pelanggan
                                </p>

                                <h2 className="mt-3 text-3xl font-extrabold text-[#F8FAFC]">
                                    Masuk ke akun
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-[#94A3B8]">
                                    Gunakan email dan kata sandi yang sudah
                                    didaftarkan.
                                </p>
                            </div>

                            {status && (
                                <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                                    {status}
                                </div>
                            )}

                            <form
                                onSubmit={submit}
                                className="space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]"
                                    >
                                        Alamat Email
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(event) =>
                                            setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="username"
                                        autoFocus
                                        required
                                        placeholder="nama@email.com"
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-[#F8FAFC] outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                    />

                                    {errors.email && (
                                        <p className="mt-2 text-xs text-rose-400">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8]"
                                        >
                                            Kata Sandi
                                        </label>

                                        {canResetPassword && (
                                            <Link
                                                href={route(
                                                    'password.request',
                                                )}
                                                className="text-xs font-semibold text-[#06B6D4] hover:underline"
                                            >
                                                Lupa kata sandi
                                            </Link>
                                        )}
                                    </div>

                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="current-password"
                                        required
                                        placeholder="Masukkan kata sandi"
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-[#F8FAFC] outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                    />

                                    {errors.password && (
                                        <p className="mt-2 text-xs text-rose-400">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 text-sm text-[#94A3B8]">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(event) =>
                                            setData(
                                                'remember',
                                                event.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-600 bg-[#0B1120] text-[#06B6D4] focus:ring-[#06B6D4]"
                                    />

                                    Ingat akun saya
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl bg-[#06B6D4] px-5 py-3.5 font-bold text-[#0B1120] shadow-lg transition-all hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Sedang memproses...'
                                        : 'Masuk Sekarang'}
                                </button>
                            </form>

                            <div className="mt-7 border-t border-slate-700 pt-6 text-center">
                                <p className="text-sm text-[#94A3B8]">
                                    Belum memiliki akun RentDrive
                                </p>

                                <Link
                                    href={route('register')}
                                    className="mt-3 inline-flex rounded-xl border border-[#06B6D4] px-5 py-2.5 text-sm font-bold text-[#06B6D4] transition hover:bg-[#06B6D4]/10"
                                >
                                    Daftar akun pelanggan
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
