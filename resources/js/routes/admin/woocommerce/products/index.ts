import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::show
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/products/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::show
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::show
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::show
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::show
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::show
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::show
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:139
* @route '/admin/woocommerce/products/{id}'
*/
showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::variations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
export const variations = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: variations.url(args, options),
    method: 'get',
})

variations.definition = {
    methods: ["get","head"],
    url: '/admin/woocommerce/products/{id}/variations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::variations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
variations.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return variations.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::variations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
variations.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: variations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::variations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
variations.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: variations.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::variations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
const variationsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: variations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::variations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
variationsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: variations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminWooCommerceController::variations
* @see app/Http/Controllers/Admin/AdminWooCommerceController.php:152
* @route '/admin/woocommerce/products/{id}/variations'
*/
variationsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: variations.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

variations.form = variationsForm

const products = {
    show: Object.assign(show, show),
    variations: Object.assign(variations, variations),
}

export default products