import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::order
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
export const order = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: order.url(options),
    method: 'post',
})

order.definition = {
    methods: ["post"],
    url: '/admin/woocommerce/pos/order',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::order
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
order.url = (options?: RouteQueryOptions) => {
    return order.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::order
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
order.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: order.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::order
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
const orderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: order.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::order
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
orderForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: order.url(options),
    method: 'post',
})

order.form = orderForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::contacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
export const contacts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts.url(options),
    method: 'get',
})

contacts.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/pos/contacts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::contacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
contacts.url = (options?: RouteQueryOptions) => {
    return contacts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::contacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
contacts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contacts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::contacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
contacts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contacts.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::contacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
const contactsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contacts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::contacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
contactsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contacts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::contacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
contactsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contacts.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

contacts.form = contactsForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::recentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
export const recentOrders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recentOrders.url(options),
    method: 'get',
})

recentOrders.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/pos/recent-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::recentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
recentOrders.url = (options?: RouteQueryOptions) => {
    return recentOrders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::recentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
recentOrders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recentOrders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::recentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
recentOrders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recentOrders.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::recentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
const recentOrdersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recentOrders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::recentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
recentOrdersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recentOrders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::recentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
recentOrdersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recentOrders.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

recentOrders.form = recentOrdersForm

const pos = {
    order: Object.assign(order, order),
    contacts: Object.assign(contacts, contacts),
    recentOrders: Object.assign(recentOrders, recentOrders),
}

export default pos