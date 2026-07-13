<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitoringAdminController extends Controller
{
    /**
     * Menampilkan audit trail aktivitas admin.
     */
    public function index(
        Request $request
    ): Response {
        $kataKunci = $request->input(
            'cari_admin'
        );

        $filterTanggal = $request->input(
            'tanggal_log'
        );

        $queryLog = LogAktivitas::query()
            ->with([
                'user:id,name',
            ])
            ->latest();

        /*
         * Filter log berdasarkan nama admin.
         */
        if ($kataKunci) {
            $queryLog->whereHas(
                'user',
                function ($query) use (
                    $kataKunci
                ) {
                    $query->where(
                        'name',
                        'like',
                        '%' . $kataKunci . '%'
                    );
                }
            );
        }

        /*
         * Filter log berdasarkan tanggal tertentu.
         */
        if ($filterTanggal) {
            $queryLog->whereDate(
                'created_at',
                $filterTanggal
            );
        }

        $logs = $queryLog->get();

        return Inertia::render(
            'Owner/MonitoringAdmin',
            [
                'logs_aktivitas' =>
                    $logs,

                'filter' => [
                    'cari_admin' =>
                        $kataKunci,

                    'tanggal_log' =>
                        $filterTanggal,
                ],
            ]
        );
    }
}
