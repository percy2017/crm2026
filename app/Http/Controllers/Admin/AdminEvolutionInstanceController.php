<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\EvolutionWebhooksDataTable;
use App\Http\Controllers\Controller;
use App\Services\EvolutionApiService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminEvolutionInstanceController extends Controller
{
    public function index(EvolutionApiService $evolution, EvolutionWebhooksDataTable $dataTable): Response|JsonResponse
    {
        if ($dataTable->request()->ajax() && $dataTable->request()->wantsJson()) {
            return $dataTable->ajax();
        }

        $instances = [];

        try {
            $instances = $evolution->fetchInstances();
        } catch (\Exception $e) {
            report($e);
        }

        return Inertia::render('admin/evolution-instances/index', [
            'instances' => $instances,
        ]);
    }
}
