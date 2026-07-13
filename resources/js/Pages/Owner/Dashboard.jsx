import { Head, router } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <>
            <Head title="Dashboard Owner" />

            <main className="min-h-screen bg-slate-100 p-10">
                <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Dashboard Owner
                    </h1>

                    <p className="mt-3 text-slate-600">
                        Selamat datang, {auth?.user?.name}.
                    </p>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="mt-6 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
                    >
                        Logout
                    </button>
                </div>
            </main>
        </>
    );
}
