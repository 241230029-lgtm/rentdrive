import PublicHeader from '@/Components/PublicHeader';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('register'), {
            preserveScroll: true,

            onFinish: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#0B1120] font-sans text-[#F8FAFC] antialiased">
            <Head title="Daftar Akun" />

            <PublicHeader halamanAktif="register" />

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
                                Mulai perjalanan modern Anda bersama
                                <span className="text-[#06B6D4]">
                                    {' '}RentDrive
                                </span>
                                .
                            </h1>

                            <p className="mt-5 max-w-md leading-7 text-[#94A3B8]">
                                Daftarkan akun pelanggan untuk mengakses
                                katalog, melakukan penyewaan, mengunggah
                                pembayaran, dan memantau transaksi.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-3">
                            <div className="rounded-xl border border-slate-700 bg-[#0B1120]/70 px-5 py-4">
                                <p className="text-sm font-bold">
                                    Unit terawat
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#94A3B8]">
                                    Pilihan kendaraan disiapkan untuk
                                    kebutuhan perjalanan Anda.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-700 bg-[#0B1120]/70 px-5 py-4">
                                <p className="text-sm font-bold">
                                    Transaksi transparan
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#94A3B8]">
                                    Tarif, status pembayaran, dan riwayat
                                    sewa dapat dipantau dalam akun.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* FORM REGISTER */}
                    <section className="p-7 sm:p-10">
                        <div className="mx-auto max-w-md">
                            <div className="mb-7">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
                                    Pendaftaran Pelanggan
                                </p>

                                <h2 className="mt-3 text-3xl font-extrabold">
                                    Buat akun baru
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-[#94A3B8]">
                                    Lengkapi data berikut untuk membuat akun
                                    pelanggan RentDrive.
                                </p>
                            </div>

                            <form
                                onSubmit={submit}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]"
                                    >
                                        Nama Lengkap
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="name"
                                        autoFocus
                                        required
                                        placeholder="Masukkan nama lengkap"
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-[#F8FAFC] outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                    />

                                    {errors.name && (
                                        <p className="mt-2 text-xs text-rose-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

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
                                        required
                                        placeholder="nama@email.com"
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-[#F8FAFC] outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                    />

                                    {errors.email && (
                                        <p className="mt-2 text-xs text-rose-400">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]"
                                    >
                                        Kata Sandi
                                    </label>

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
                                        autoComplete="new-password"
                                        required
                                        placeholder="Minimal 8 karakter"
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-[#F8FAFC] outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                    />

                                    {errors.password && (
                                        <p className="mt-2 text-xs text-rose-400">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="password_confirmation"
                                        className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]"
                                    >
                                        Konfirmasi Kata Sandi
                                    </label>

                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={
                                            data.password_confirmation
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'password_confirmation',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                        required
                                        placeholder="Masukkan ulang kata sandi"
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-[#F8FAFC] outline-none transition placeholder:text-slate-600 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                    />

                                    {errors.password_confirmation && (
                                        <p className="mt-2 text-xs text-rose-400">
                                            {
                                                errors.password_confirmation
                                            }
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-2 w-full rounded-xl bg-[#06B6D4] px-5 py-3.5 font-bold text-[#0B1120] shadow-lg transition-all hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Memproses Pendaftaran...'
                                        : 'Daftar Sekarang'}
                                </button>
                            </form>

                            <div className="mt-6 border-t border-slate-700 pt-6 text-center">
                                <p className="text-sm text-[#94A3B8]">
                                    Sudah memiliki akun RentDrive
                                </p>

                                <Link
                                    href={route('login')}
                                    className="mt-3 inline-flex rounded-xl border border-[#06B6D4] px-5 py-2.5 text-sm font-bold text-[#06B6D4] transition hover:bg-[#06B6D4]/10"
                                >
                                    Masuk ke akun
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
