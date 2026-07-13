import { Head, useForm, usePage } from '@inertiajs/react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const profilForm = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const hapusForm = useForm({
        password: '',
    });

    const simpanProfil = (event) => {
        event.preventDefault();

        profilForm.patch(route('pelanggan.profile.update'), {
            preserveScroll: true,
        });
    };

    const ubahPassword = (event) => {
        event.preventDefault();

        passwordForm.put(route('password.update'), {
            preserveScroll: true,

            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    const hapusAkun = (event) => {
        event.preventDefault();

        const disetujui = window.confirm(
            'Akun akan dihapus dan tindakan ini tidak dapat dibatalkan.'
        );

        if (!disetujui) {
            return;
        }

        hapusForm.delete(route('pelanggan.profile.destroy'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Profil Pelanggan" />

            <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                <section className="rounded-3xl border border-slate-800 bg-[#10192B] px-6 py-10 text-center shadow-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#06B6D4]">
                        Akun Pelanggan
                    </p>

                    <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                        Kelola Profil
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#94A3B8]">
                        Perbarui identitas akun, kata sandi, dan pengaturan
                        keamanan pelanggan RentDrive.
                    </p>
                </section>

                {status && (
                    <div className="mt-7 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                        {status}
                    </div>
                )}

                <div className="mt-8 grid gap-7 lg:grid-cols-2">
                    {/* INFORMASI PROFIL */}
                    <section className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-xl sm:p-8">
                        <h2 className="text-xl font-bold">
                            Informasi Profil
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                            Gunakan nama dan alamat email aktif.
                        </p>

                        <form
                            onSubmit={simpanProfil}
                            className="mt-7 space-y-5"
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
                                    value={profilForm.data.name}
                                    onChange={(event) =>
                                        profilForm.setData(
                                            'name',
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-[#F8FAFC] outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                />

                                {profilForm.errors.name && (
                                    <p className="mt-2 text-xs text-rose-400">
                                        {profilForm.errors.name}
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
                                    value={profilForm.data.email}
                                    onChange={(event) =>
                                        profilForm.setData(
                                            'email',
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-[#F8FAFC] outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                />

                                {profilForm.errors.email && (
                                    <p className="mt-2 text-xs text-rose-400">
                                        {profilForm.errors.email}
                                    </p>
                                )}
                            </div>

                            {mustVerifyEmail &&
                                user?.email_verified_at === null && (
                                    <p className="text-sm text-amber-300">
                                        Alamat email belum diverifikasi.
                                    </p>
                                )}

                            <button
                                type="submit"
                                disabled={profilForm.processing}
                                className="rounded-xl bg-[#06B6D4] px-6 py-3 text-sm font-bold text-[#0B1120] hover:bg-[#0891B2] disabled:opacity-50"
                            >
                                {profilForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Profil'}
                            </button>
                        </form>
                    </section>

                    {/* PASSWORD */}
                    <section className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-xl sm:p-8">
                        <h2 className="text-xl font-bold">
                            Ubah Kata Sandi
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                            Gunakan kata sandi yang kuat dan tidak mudah
                            ditebak.
                        </p>

                        <form
                            onSubmit={ubahPassword}
                            className="mt-7 space-y-5"
                        >
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                    Kata Sandi Saat Ini
                                </label>

                                <input
                                    type="password"
                                    value={
                                        passwordForm.data.current_password
                                    }
                                    onChange={(event) =>
                                        passwordForm.setData(
                                            'current_password',
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                />

                                {passwordForm.errors.current_password && (
                                    <p className="mt-2 text-xs text-rose-400">
                                        {
                                            passwordForm.errors
                                                .current_password
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                    Kata Sandi Baru
                                </label>

                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(event) =>
                                        passwordForm.setData(
                                            'password',
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                />

                                {passwordForm.errors.password && (
                                    <p className="mt-2 text-xs text-rose-400">
                                        {passwordForm.errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                    Konfirmasi Kata Sandi
                                </label>

                                <input
                                    type="password"
                                    value={
                                        passwordForm.data
                                            .password_confirmation
                                    }
                                    onChange={(event) =>
                                        passwordForm.setData(
                                            'password_confirmation',
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="rounded-xl bg-[#06B6D4] px-6 py-3 text-sm font-bold text-[#0B1120] hover:bg-[#0891B2] disabled:opacity-50"
                            >
                                {passwordForm.processing
                                    ? 'Memperbarui...'
                                    : 'Perbarui Kata Sandi'}
                            </button>
                        </form>
                    </section>
                </div>

                {/* HAPUS AKUN */}
                <section className="mt-7 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 shadow-xl sm:p-8">
                    <h2 className="text-xl font-bold text-rose-300">
                        Hapus Akun
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#94A3B8]">
                        Setelah akun dihapus, seluruh akses ke akun pelanggan
                        akan dihentikan. Masukkan kata sandi untuk
                        mengonfirmasi.
                    </p>

                    <form
                        onSubmit={hapusAkun}
                        className="mt-6 max-w-xl"
                    >
                        <input
                            type="password"
                            value={hapusForm.data.password}
                            onChange={(event) =>
                                hapusForm.setData(
                                    'password',
                                    event.target.value
                                )
                            }
                            placeholder="Masukkan kata sandi"
                            className="w-full rounded-xl border border-rose-500/30 bg-[#0B1120] px-4 py-3.5 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                        />

                        {hapusForm.errors.password && (
                            <p className="mt-2 text-xs text-rose-400">
                                {hapusForm.errors.password}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={hapusForm.processing}
                            className="mt-4 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                            Hapus Akun Permanen
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
