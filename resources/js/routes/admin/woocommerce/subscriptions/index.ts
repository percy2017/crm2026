import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendar
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
export const calendar = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendar.url(options),
    method: 'get',
})

calendar.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/subscriptions/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendar
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
calendar.url = (options?: RouteQueryOptions) => {
    return calendar.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendar
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
calendar.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendar.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendar
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
calendar.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: calendar.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendar
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
const calendarForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendar.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendar
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
calendarForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendar.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendar
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:340
* @route '/admin/woocommerce/subscriptions/calendar'
*/
calendarForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendar.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

calendar.form = calendarForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
export const calendarData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendarData.url(options),
    method: 'get',
})

calendarData.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/subscriptions/calendar-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarData.url = (options?: RouteQueryOptions) => {
    return calendarData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendarData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: calendarData.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
const calendarDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendarData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendarData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::calendarData
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:327
* @route '/admin/woocommerce/subscriptions/calendar-data'
*/
calendarDataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: calendarData.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

calendarData.form = calendarDataForm

const subscriptions = {
    calendar: Object.assign(calendar, calendar),
    calendarData: Object.assign(calendarData, calendarData),
}

export default subscriptions