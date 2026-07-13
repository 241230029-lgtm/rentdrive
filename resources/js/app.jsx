import './bootstrap';
import '../css/app.css';

import AdminLayout from '@/Layouts/AdminLayout';
import OwnerLayout from '@/Layouts/OwnerLayout';
import PelangganLayout from '@/Layouts/PelangganLayout';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName =
    import.meta.env.VITE_APP_NAME || 'RentDrive';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: async (name) => {
        const page = await resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        );

        if (
            name === 'Dashboard' ||
            name.startsWith('Pelanggan/')
        ) {
            page.default.layout =
                page.default.layout ||
                ((pageContent) => (
                    <PelangganLayout>
                        {pageContent}
                    </PelangganLayout>
                ));
        }

        if (name.startsWith('Admin/')) {
            page.default.layout =
                page.default.layout ||
                ((pageContent) => (
                    <AdminLayout>
                        {pageContent}
                    </AdminLayout>
                ));
        }

        if (name.startsWith('Owner/')) {
            page.default.layout =
                page.default.layout ||
                ((pageContent) => (
                    <OwnerLayout>
                        {pageContent}
                    </OwnerLayout>
                ));
        }

        return page;
    },

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },

    progress: {
        delay: 250,
        color: '#06B6D4',
        includeCSS: true,
        showSpinner: false,
    },
});
