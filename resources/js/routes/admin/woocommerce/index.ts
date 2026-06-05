import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import pos28cf7d from './pos'
import subscriptions from './subscriptions'
import products237d17 from './products'
import ordersB47e5f from './orders'
/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::index
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::index
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::index
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::index
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::index
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::index
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::index
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboardData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:25
* @route '/admin/woocommerce/dashboard-data'
*/
export const dashboardData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboardData.url(options),
    method: 'get',
})

dashboardData.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/dashboard-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboardData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:25
* @route '/admin/woocommerce/dashboard-data'
*/
dashboardData.url = (options?: RouteQueryOptions) => {
    return dashboardData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboardData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:25
* @route '/admin/woocommerce/dashboard-data'
*/
dashboardData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboardData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboardData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:25
* @route '/admin/woocommerce/dashboard-data'
*/
dashboardData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboardData.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboardData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:25
* @route '/admin/woocommerce/dashboard-data'
*/
const dashboardDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboardData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboardData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:25
* @route '/admin/woocommerce/dashboard-data'
*/
dashboardDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboardData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboardData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:25
* @route '/admin/woocommerce/dashboard-data'
*/
dashboardDataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboardData.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboardData.form = dashboardDataForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::pos
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:174
* @route '/admin/woocommerce/pos'
*/
export const pos = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pos.url(options),
    method: 'get',
})

pos.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/pos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::pos
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:174
* @route '/admin/woocommerce/pos'
*/
pos.url = (options?: RouteQueryOptions) => {
    return pos.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::pos
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:174
* @route '/admin/woocommerce/pos'
*/
pos.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pos.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::pos
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:174
* @route '/admin/woocommerce/pos'
*/
pos.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pos.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::pos
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:174
* @route '/admin/woocommerce/pos'
*/
const posForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pos.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::pos
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:174
* @route '/admin/woocommerce/pos'
*/
posForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pos.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::pos
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:174
* @route '/admin/woocommerce/pos'
*/
posForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pos.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

pos.form = posForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::products
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:95
* @route '/admin/woocommerce/products'
*/
export const products = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: products.url(options),
    method: 'get',
})

products.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/products',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::products
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:95
* @route '/admin/woocommerce/products'
*/
products.url = (options?: RouteQueryOptions) => {
    return products.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::products
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:95
* @route '/admin/woocommerce/products'
*/
products.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: products.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::products
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:95
* @route '/admin/woocommerce/products'
*/
products.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: products.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::products
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:95
* @route '/admin/woocommerce/products'
*/
const productsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: products.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::products
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:95
* @route '/admin/woocommerce/products'
*/
productsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: products.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::products
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:95
* @route '/admin/woocommerce/products'
*/
productsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: products.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

products.form = productsForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:483
* @route '/admin/woocommerce/orders'
*/
export const orders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})

orders.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:483
* @route '/admin/woocommerce/orders'
*/
orders.url = (options?: RouteQueryOptions) => {
    return orders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:483
* @route '/admin/woocommerce/orders'
*/
orders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:483
* @route '/admin/woocommerce/orders'
*/
orders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: orders.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:483
* @route '/admin/woocommerce/orders'
*/
const ordersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: orders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:483
* @route '/admin/woocommerce/orders'
*/
ordersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: orders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:483
* @route '/admin/woocommerce/orders'
*/
ordersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: orders.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

orders.form = ordersForm

const woocommerce = {
    index: Object.assign(index, index),
    dashboardData: Object.assign(dashboardData, dashboardData),
    pos: Object.assign(pos, pos28cf7d),
    subscriptions: Object.assign(subscriptions, subscriptions),
    products: Object.assign(products, products237d17),
    orders: Object.assign(orders, ordersB47e5f),
}

export default woocommerce