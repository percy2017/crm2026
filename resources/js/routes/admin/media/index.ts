import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminMediaController::index
* @see app/Http/Controllers/Admin/AdminMediaController.php:18
* @route '/admin/media'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/media',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::index
* @see app/Http/Controllers/Admin/AdminMediaController.php:18
* @route '/admin/media'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::index
* @see app/Http/Controllers/Admin/AdminMediaController.php:18
* @route '/admin/media'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::index
* @see app/Http/Controllers/Admin/AdminMediaController.php:18
* @route '/admin/media'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::index
* @see app/Http/Controllers/Admin/AdminMediaController.php:18
* @route '/admin/media'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::index
* @see app/Http/Controllers/Admin/AdminMediaController.php:18
* @route '/admin/media'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::index
* @see app/Http/Controllers/Admin/AdminMediaController.php:18
* @route '/admin/media'
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
* @see \App\Http\Controllers\Admin\AdminMediaController::stats
* @see app/Http/Controllers/Admin/AdminMediaController.php:23
* @route '/admin/media/stats'
*/
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/admin/media/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::stats
* @see app/Http/Controllers/Admin/AdminMediaController.php:23
* @route '/admin/media/stats'
*/
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::stats
* @see app/Http/Controllers/Admin/AdminMediaController.php:23
* @route '/admin/media/stats'
*/
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::stats
* @see app/Http/Controllers/Admin/AdminMediaController.php:23
* @route '/admin/media/stats'
*/
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::stats
* @see app/Http/Controllers/Admin/AdminMediaController.php:23
* @route '/admin/media/stats'
*/
const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::stats
* @see app/Http/Controllers/Admin/AdminMediaController.php:23
* @route '/admin/media/stats'
*/
statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::stats
* @see app/Http/Controllers/Admin/AdminMediaController.php:23
* @route '/admin/media/stats'
*/
statsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stats.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

stats.form = statsForm

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::list
* @see app/Http/Controllers/Admin/AdminMediaController.php:115
* @route '/admin/media/list'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/admin/media/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::list
* @see app/Http/Controllers/Admin/AdminMediaController.php:115
* @route '/admin/media/list'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::list
* @see app/Http/Controllers/Admin/AdminMediaController.php:115
* @route '/admin/media/list'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::list
* @see app/Http/Controllers/Admin/AdminMediaController.php:115
* @route '/admin/media/list'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::list
* @see app/Http/Controllers/Admin/AdminMediaController.php:115
* @route '/admin/media/list'
*/
const listForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::list
* @see app/Http/Controllers/Admin/AdminMediaController.php:115
* @route '/admin/media/list'
*/
listForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::list
* @see app/Http/Controllers/Admin/AdminMediaController.php:115
* @route '/admin/media/list'
*/
listForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

list.form = listForm

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::upload
* @see app/Http/Controllers/Admin/AdminMediaController.php:229
* @route '/admin/media/upload'
*/
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/admin/media/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::upload
* @see app/Http/Controllers/Admin/AdminMediaController.php:229
* @route '/admin/media/upload'
*/
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::upload
* @see app/Http/Controllers/Admin/AdminMediaController.php:229
* @route '/admin/media/upload'
*/
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::upload
* @see app/Http/Controllers/Admin/AdminMediaController.php:229
* @route '/admin/media/upload'
*/
const uploadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::upload
* @see app/Http/Controllers/Admin/AdminMediaController.php:229
* @route '/admin/media/upload'
*/
uploadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

upload.form = uploadForm

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::destroy
* @see app/Http/Controllers/Admin/AdminMediaController.php:248
* @route '/admin/media/{filename}'
*/
export const destroy = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/media/{filename}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::destroy
* @see app/Http/Controllers/Admin/AdminMediaController.php:248
* @route '/admin/media/{filename}'
*/
destroy.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    if (Array.isArray(args)) {
        args = {
            filename: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        filename: args.filename,
    }

    return destroy.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::destroy
* @see app/Http/Controllers/Admin/AdminMediaController.php:248
* @route '/admin/media/{filename}'
*/
destroy.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::destroy
* @see app/Http/Controllers/Admin/AdminMediaController.php:248
* @route '/admin/media/{filename}'
*/
const destroyForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminMediaController::destroy
* @see app/Http/Controllers/Admin/AdminMediaController.php:248
* @route '/admin/media/{filename}'
*/
destroyForm.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const media = {
    index: Object.assign(index, index),
    stats: Object.assign(stats, stats),
    list: Object.assign(list, list),
    upload: Object.assign(upload, upload),
    destroy: Object.assign(destroy, destroy),
}

export default media