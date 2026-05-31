<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WebWidget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminWebWidgetController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/web-widgets/index', [
            'widgets' => WebWidget::orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
            'position' => 'nullable|in:left,right',
            'greeting' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        WebWidget::create($data);

        return redirect()->route('admin.web-widgets.index')
            ->with('success', 'Widget created successfully.');
    }

    public function show(WebWidget $webWidget): JsonResponse
    {
        return response()->json(['data' => $webWidget]);
    }

    public function update(Request $request, WebWidget $webWidget): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
            'position' => 'nullable|in:left,right',
            'greeting' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $webWidget->update($data);

        return redirect()->route('admin.web-widgets.index')
            ->with('success', 'Widget updated successfully.');
    }

    public function destroy(WebWidget $webWidget): RedirectResponse
    {
        $webWidget->delete();

        return redirect()->route('admin.web-widgets.index')
            ->with('success', 'Widget deleted successfully.');
    }
}
