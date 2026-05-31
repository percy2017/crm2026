<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\DealsDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDealRequest;
use App\Http\Requests\Admin\UpdateDealRequest;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Pipeline;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDealController extends Controller
{
    public function index(Request $request, DealsDataTable $dataTable): Response|JsonResponse
    {
        if ($request->ajax() && $request->wantsJson()) {
            if ($request->has('kanban')) {
                $pipeline = Pipeline::with(['stages.deals' => function ($q) {
                    $q->with(['contact', 'assignedUser'])->orderBy('created_at', 'desc');
                }])->firstOrFail();

                return response()->json([
                    'pipeline' => $pipeline,
                ]);
            }

            return $dataTable->ajax();
        }

        return Inertia::render('admin/deals/index', [
            'pipeline' => Pipeline::with('stages')->first(),
            'contacts' => Contact::select('id', 'name', 'phone', 'profile_pic_url')
                ->orderBy('name')
                ->get(),
            'users' => User::select('id', 'name', 'email')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreDealRequest $request): RedirectResponse
    {
        Deal::create($request->validated());

        return redirect()->route('admin.deals.index')
            ->with('success', 'Deal created successfully.');
    }

    public function show(Deal $deal): JsonResponse
    {
        $deal->load(['contact', 'assignedUser', 'pipeline', 'stage']);

        return response()->json(['data' => $deal]);
    }

    public function update(UpdateDealRequest $request, Deal $deal): RedirectResponse
    {
        $data = $request->validated();

        if (in_array($data['status'] ?? '', ['won', 'lost'])) {
            $data['closed_at'] = now();
        }

        $deal->update($data);

        return redirect()->route('admin.deals.index')
            ->with('success', 'Deal updated successfully.');
    }

    public function destroy(Deal $deal): RedirectResponse
    {
        $deal->delete();

        return redirect()->route('admin.deals.index')
            ->with('success', 'Deal deleted successfully.');
    }

    public function moveStage(Request $request, Deal $deal): RedirectResponse
    {
        $request->validate(['stage_id' => 'required|exists:pipeline_stages,id']);

        $deal->update(['stage_id' => $request->stage_id]);

        return redirect()->route('admin.deals.index')
            ->with('success', 'Deal moved successfully.');
    }
}
