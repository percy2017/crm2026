<?php

use App\Http\Controllers\Admin\AdminAiAgentController;
use App\Http\Controllers\Admin\AdminContactController;
use App\Http\Controllers\Admin\AdminDealController;
use App\Http\Controllers\Admin\AdminEntradaController;
use App\Http\Controllers\Admin\AdminMediaController;
use App\Http\Controllers\Admin\AdminPipelineStageController;
use App\Http\Controllers\Admin\AdminRoleController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminWebChatController;
use App\Http\Controllers\Admin\AdminWebWidgetController;
use App\Http\Controllers\Admin\AdminWooCommerceController;
use App\Http\Controllers\Admin\InboxCrudController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('reverb-monitor', 'reverb-monitor')->name('reverb-monitor');
});

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/dashboard')->name('index');
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [AdminUserController::class, 'create'])->name('users.create');
    Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    Route::get('/roles', [AdminRoleController::class, 'index'])->name('roles.index');
    Route::post('/roles', [AdminRoleController::class, 'store'])->name('roles.store');
    Route::put('/roles/{role}', [AdminRoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [AdminRoleController::class, 'destroy'])->name('roles.destroy');

    Route::get('/deals', [AdminDealController::class, 'index'])->name('deals.index');
    Route::post('/deals', [AdminDealController::class, 'store'])->name('deals.store');
    Route::get('/deals/{deal}', [AdminDealController::class, 'show'])->name('deals.show');
    Route::put('/deals/{deal}', [AdminDealController::class, 'update'])->name('deals.update');
    Route::post('/deals/{deal}/move', [AdminDealController::class, 'moveStage'])->name('deals.move');
    Route::delete('/deals/{deal}', [AdminDealController::class, 'destroy'])->name('deals.destroy');

    Route::get('/pipeline-stages', [AdminPipelineStageController::class, 'index'])->name('pipeline-stages.index');
    Route::post('/pipeline-stages', [AdminPipelineStageController::class, 'store'])->name('pipeline-stages.store');
    Route::put('/pipeline-stages/{pipelineStage}', [AdminPipelineStageController::class, 'update'])->name('pipeline-stages.update');
    Route::delete('/pipeline-stages/{pipelineStage}', [AdminPipelineStageController::class, 'destroy'])->name('pipeline-stages.destroy');
    Route::post('/pipeline-stages/reorder', [AdminPipelineStageController::class, 'reorder'])->name('pipeline-stages.reorder');

    Route::prefix('inboxes')->name('inboxes.')->group(function () {
        Route::get('/', [InboxCrudController::class, 'index'])->name('index');
        Route::get('/create', [InboxCrudController::class, 'create'])->name('create');
        Route::post('/', [InboxCrudController::class, 'store'])->name('store');
        Route::delete('/{inbox}', [InboxCrudController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('entradas')->name('entradas.')->group(function () {
        Route::get('/{instance}', [AdminEntradaController::class, 'chat'])->name('chat');
        Route::get('/{instance}/chats', [AdminEntradaController::class, 'chats'])->name('chats');
        Route::get('/{instance}/messages', [AdminEntradaController::class, 'messages'])->name('messages');
        Route::post('/{instance}/send', [AdminEntradaController::class, 'send'])->name('send');
        Route::delete('/{instance}/conversations/{conversation}', [AdminEntradaController::class, 'destroyConversation'])->name('conversations.destroy');
    });

    Route::get('/media', [AdminMediaController::class, 'index'])->name('media.index');
    Route::get('/media/list', [AdminMediaController::class, 'list'])->name('media.list');
    Route::post('/media/upload', [AdminMediaController::class, 'upload'])->name('media.upload');
    Route::delete('/media/{filename}', [AdminMediaController::class, 'destroy'])->name('media.destroy');

    Route::get('/woocommerce', [AdminWooCommerceController::class, 'dashboard'])->name('woocommerce.index');
    Route::get('/woocommerce/dashboard-data', [AdminWooCommerceController::class, 'dashboardData'])->name('woocommerce.dashboard-data');
    Route::get('/woocommerce/pos', [AdminWooCommerceController::class, 'pos'])->name('woocommerce.pos');
    Route::post('/woocommerce/pos/order', [AdminWooCommerceController::class, 'posCreateOrder'])->name('woocommerce.pos.order');
    Route::get('/woocommerce/pos/contacts', [AdminWooCommerceController::class, 'posContacts'])->name('woocommerce.pos.contacts');
    Route::get('/woocommerce/pos/recent-orders', [AdminWooCommerceController::class, 'posRecentOrders'])->name('woocommerce.pos.recent-orders');
    Route::get('/woocommerce/subscriptions/calendar', [AdminWooCommerceController::class, 'subscriptionsCalendarPage'])->name('woocommerce.subscriptions.calendar');
    Route::get('/woocommerce/subscriptions/calendar-data', [AdminWooCommerceController::class, 'calendarSubscriptions'])->name('woocommerce.subscriptions.calendar-data');
    Route::get('/woocommerce/products', [AdminWooCommerceController::class, 'products'])->name('woocommerce.products');
    Route::get('/woocommerce/products/create', [AdminWooCommerceController::class, 'productCreate'])->name('woocommerce.products.create');
    Route::post('/woocommerce/products', [AdminWooCommerceController::class, 'productStore'])->name('woocommerce.products.store');
    Route::get('/woocommerce/products/{id}/edit', [AdminWooCommerceController::class, 'productEdit'])->name('woocommerce.products.edit');
    Route::put('/woocommerce/products/{id}', [AdminWooCommerceController::class, 'productUpdate'])->name('woocommerce.products.update');
    Route::delete('/woocommerce/products/{id}', [AdminWooCommerceController::class, 'productDestroy'])->name('woocommerce.products.destroy');
    Route::get('/woocommerce/products/{id}', [AdminWooCommerceController::class, 'productShow'])->name('woocommerce.products.show');
    Route::get('/woocommerce/products/{id}/variations', [AdminWooCommerceController::class, 'productVariations'])->name('woocommerce.products.variations');
    Route::get('/woocommerce/orders', [AdminWooCommerceController::class, 'orders'])->name('woocommerce.orders');
    Route::get('/woocommerce/orders/{id}', [AdminWooCommerceController::class, 'orderShow'])->name('woocommerce.orders.show');
    Route::delete('/woocommerce/orders/{id}', [AdminWooCommerceController::class, 'orderDestroy'])->name('woocommerce.orders.destroy');

    Route::post('/ai-agent/chat', [AdminAiAgentController::class, 'chat'])->name('ai-agent.chat');

    Route::get('/web-widgets', [AdminWebWidgetController::class, 'index'])->name('web-widgets.index');
    Route::post('/web-widgets', [AdminWebWidgetController::class, 'store'])->name('web-widgets.store');
    Route::get('/web-widgets/{webWidget}', [AdminWebWidgetController::class, 'show'])->name('web-widgets.show');
    Route::put('/web-widgets/{webWidget}', [AdminWebWidgetController::class, 'update'])->name('web-widgets.update');
    Route::delete('/web-widgets/{webWidget}', [AdminWebWidgetController::class, 'destroy'])->name('web-widgets.destroy');

    Route::get('/web-chat', [AdminWebChatController::class, 'index'])->name('web-chat.index');
    Route::get('/web-chat/conversations', [AdminWebChatController::class, 'conversations'])->name('web-chat.conversations');
    Route::get('/web-chat/conversations/{webConversation}/messages', [AdminWebChatController::class, 'messages'])->name('web-chat.messages');
    Route::post('/web-chat/conversations/{webConversation}/send', [AdminWebChatController::class, 'send'])->name('web-chat.send');
    Route::post('/web-chat/conversations/{webConversation}/assign', [AdminWebChatController::class, 'assign'])->name('web-chat.assign');
    Route::delete('/web-chat/conversations/{webConversation}', [AdminWebChatController::class, 'destroy'])->name('web-chat.destroy');

    Route::get('/contacts', [AdminContactController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/create', [AdminContactController::class, 'create'])->name('contacts.create');
    Route::get('/contacts/import', [AdminContactController::class, 'import'])->name('contacts.import');
    Route::get('/contacts/{contact}', [AdminContactController::class, 'show'])->name('contacts.show');
    Route::post('/contacts', [AdminContactController::class, 'store'])->name('contacts.store');
    Route::post('/contacts/fetch-from-evolution', [AdminContactController::class, 'fetchFromEvolution'])->name('contacts.fetch-from-evolution');
    Route::post('/contacts/scan-instances', [AdminContactController::class, 'scanInstances'])->name('contacts.scan-instances');
    Route::post('/contacts/import-batch', [AdminContactController::class, 'importBatch'])->name('contacts.import-batch');
    Route::get('/contacts/{contact}/edit', [AdminContactController::class, 'edit'])->name('contacts.edit');
    Route::put('/contacts/{contact}', [AdminContactController::class, 'update'])->name('contacts.update');
    Route::delete('/contacts/{contact}', [AdminContactController::class, 'destroy'])->name('contacts.destroy');
    Route::post('/contacts/batch-delete', [AdminContactController::class, 'batchDestroy'])->name('contacts.batch-destroy');
    Route::post('/contacts/scan-groups', [AdminContactController::class, 'scanGroups'])->name('contacts.scan-groups');
    Route::post('/contacts/import-group-members', [AdminContactController::class, 'importGroupMembers'])->name('contacts.import-group-members');
    Route::post('/contacts/import-csv', [AdminContactController::class, 'importCsv'])->name('contacts.import-csv');
});
