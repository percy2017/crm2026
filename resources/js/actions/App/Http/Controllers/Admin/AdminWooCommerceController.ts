import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboard
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboard
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboard
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboard
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboard
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboard
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::dashboard
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:20
* @route '/admin/woocommerce'
*/
dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboard.form = dashboardForm

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
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posCreateOrder
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
export const posCreateOrder = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: posCreateOrder.url(options),
    method: 'post',
})

posCreateOrder.definition = {
    methods: ["post"],
    url: '/admin/woocommerce/pos/order',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posCreateOrder
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
posCreateOrder.url = (options?: RouteQueryOptions) => {
    return posCreateOrder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posCreateOrder
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
posCreateOrder.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: posCreateOrder.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posCreateOrder
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
const posCreateOrderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: posCreateOrder.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posCreateOrder
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:196
* @route '/admin/woocommerce/pos/order'
*/
posCreateOrderForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: posCreateOrder.url(options),
    method: 'post',
})

posCreateOrder.form = posCreateOrderForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posContacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
export const posContacts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: posContacts.url(options),
    method: 'get',
})

posContacts.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/pos/contacts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posContacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
posContacts.url = (options?: RouteQueryOptions) => {
    return posContacts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posContacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
posContacts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: posContacts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posContacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
posContacts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: posContacts.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posContacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
const posContactsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: posContacts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posContacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
posContactsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: posContacts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posContacts
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:409
* @route '/admin/woocommerce/pos/contacts'
*/
posContactsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: posContacts.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

posContacts.form = posContactsForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posRecentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
export const posRecentOrders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: posRecentOrders.url(options),
    method: 'get',
})

posRecentOrders.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/pos/recent-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posRecentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
posRecentOrders.url = (options?: RouteQueryOptions) => {
    return posRecentOrders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posRecentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
posRecentOrders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: posRecentOrders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posRecentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
posRecentOrders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: posRecentOrders.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posRecentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
const posRecentOrdersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: posRecentOrders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posRecentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
posRecentOrdersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: posRecentOrders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::posRecentOrders
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:448
* @route '/admin/woocommerce/pos/recent-orders'
*/
posRecentOrdersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: posRecentOrders.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

posRecentOrders.form = posRecentOrdersForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::subscriptionsCalendarPage
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
export const subscriptionsCalendarPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscriptionsCalendarPage.url(options),
    method: 'get',
})

subscriptionsCalendarPage.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/subscriptions/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::subscriptionsCalendarPage
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
subscriptionsCalendarPage.url = (options?: RouteQueryOptions) => {
    return subscriptionsCalendarPage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::subscriptionsCalendarPage
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
subscriptionsCalendarPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscriptionsCalendarPage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::subscriptionsCalendarPage
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
subscriptionsCalendarPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subscriptionsCalendarPage.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::subscriptionsCalendarPage
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
const subscriptionsCalendarPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: subscriptionsCalendarPage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::subscriptionsCalendarPage
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
subscriptionsCalendarPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: subscriptionsCalendarPage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::subscriptionsCalendarPage
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
subscriptionsCalendarPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: subscriptionsCalendarPage.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

subscriptionsCalendarPage.form = subscriptionsCalendarPageForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarSubscriptions
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
export const calendarSubscriptions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendarSubscriptions.url(options),
    method: 'get',
})

calendarSubscriptions.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/subscriptions/calendar-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarSubscriptions
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarSubscriptions.url = (options?: RouteQueryOptions) => {
    return calendarSubscriptions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarSubscriptions
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarSubscriptions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendarSubscriptions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarSubscriptions
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarSubscriptions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: calendarSubscriptions.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarSubscriptions
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
const calendarSubscriptionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendarSubscriptions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarSubscriptions
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarSubscriptionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendarSubscriptions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarSubscriptions
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarSubscriptionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendarSubscriptions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

calendarSubscriptions.form = calendarSubscriptionsForm

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
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
export const productShow = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productShow.url(args, options),
    method: 'get',
})

productShow.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/products/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
productShow.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return productShow.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
productShow.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
productShow.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: productShow.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
const productShowForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: productShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
productShowForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: productShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
productShowForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: productShow.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

productShow.form = productShowForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productVariations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
export const productVariations = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productVariations.url(args, options),
    method: 'get',
})

productVariations.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/products/{id}/variations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productVariations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
productVariations.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return productVariations.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productVariations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
productVariations.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: productVariations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productVariations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
productVariations.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: productVariations.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productVariations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
const productVariationsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: productVariations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productVariations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
productVariationsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: productVariations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::productVariations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
productVariationsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: productVariations.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

productVariations.form = productVariationsForm

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

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:521
* @route '/admin/woocommerce/orders/{id}'
*/
export const orderShow = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orderShow.url(args, options),
    method: 'get',
})

orderShow.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/orders/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:521
* @route '/admin/woocommerce/orders/{id}'
*/
orderShow.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return orderShow.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:521
* @route '/admin/woocommerce/orders/{id}'
*/
orderShow.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orderShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:521
* @route '/admin/woocommerce/orders/{id}'
*/
orderShow.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: orderShow.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:521
* @route '/admin/woocommerce/orders/{id}'
*/
const orderShowForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: orderShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:521
* @route '/admin/woocommerce/orders/{id}'
*/
orderShowForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: orderShow.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderShow
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:521
* @route '/admin/woocommerce/orders/{id}'
*/
orderShowForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: orderShow.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

orderShow.form = orderShowForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderDestroy
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:534
* @route '/admin/woocommerce/orders/{id}'
*/
export const orderDestroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: orderDestroy.url(args, options),
    method: 'delete',
})

orderDestroy.definition = {
    methods: ["delete"],
    url: '/admin/woocommerce/orders/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderDestroy
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:534
* @route '/admin/woocommerce/orders/{id}'
*/
orderDestroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return orderDestroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderDestroy
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:534
* @route '/admin/woocommerce/orders/{id}'
*/
orderDestroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: orderDestroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderDestroy
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:534
* @route '/admin/woocommerce/orders/{id}'
*/
const orderDestroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: orderDestroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::orderDestroy
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:534
* @route '/admin/woocommerce/orders/{id}'
*/
orderDestroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: orderDestroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

orderDestroy.form = orderDestroyForm

const AdminWooCommerceController = { dashboard, dashboardData, pos, posCreateOrder, posContacts, posRecentOrders, subscriptionsCalendarPage, calendarSubscriptions, products, productShow, productVariations, orders, orderShow, orderDestroy }

export default AdminWooCommerceController