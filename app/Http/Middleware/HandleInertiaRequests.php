<?php

namespace App\Http\Middleware;

use App\Models\Inbox;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'can' => [
                    'access_admin' => $request->user()?->hasPermissionTo('access-admin') ?? false,
                ],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'inboxes' => Inbox::where('status', 'active')->orderBy('name')->get(['id', 'name', 'type', 'webhook_enabled', 'config']),
        ];
    }
}
