<?php

use App\Http\Controllers\Admin\AdminContactController;
use App\Http\Controllers\Admin\AdminEvolutionInstanceController;
use App\Http\Controllers\Admin\AdminMediaController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminWooCommerceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [AdminUserController::class, 'create'])->name('users.create');
    Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    Route::get('/evolution-instances', [AdminEvolutionInstanceController::class, 'index'])->name('evolution-instances.index');

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
    Route::get('/woocommerce/products', [AdminWooCommerceController::class, 'products'])->name('woocommerce.products');
    Route::get('/woocommerce/products/create', [AdminWooCommerceController::class, 'productCreate'])->name('woocommerce.products.create');
    Route::post('/woocommerce/products', [AdminWooCommerceController::class, 'productStore'])->name('woocommerce.products.store');
    Route::get('/woocommerce/products/{id}/edit', [AdminWooCommerceController::class, 'productEdit'])->name('woocommerce.products.edit');
    Route::put('/woocommerce/products/{id}', [AdminWooCommerceController::class, 'productUpdate'])->name('woocommerce.products.update');
    Route::delete('/woocommerce/products/{id}', [AdminWooCommerceController::class, 'productDestroy'])->name('woocommerce.products.destroy');
    Route::get('/woocommerce/products/{id}', [AdminWooCommerceController::class, 'productShow'])->name('woocommerce.products.show');
    Route::get('/woocommerce/orders', [AdminWooCommerceController::class, 'orders'])->name('woocommerce.orders');
    Route::get('/woocommerce/orders/{id}', [AdminWooCommerceController::class, 'orderShow'])->name('woocommerce.orders.show');
    Route::get('/woocommerce/customers', [AdminWooCommerceController::class, 'customers'])->name('woocommerce.customers');
    Route::get('/woocommerce/customers/{id}', [AdminWooCommerceController::class, 'customerShow'])->name('woocommerce.customers.show');

    Route::get('/contacts', [AdminContactController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/create', [AdminContactController::class, 'create'])->name('contacts.create');
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
});
