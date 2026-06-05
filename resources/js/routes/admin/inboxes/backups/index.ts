import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
*/
export const destroy = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/inboxes/backups/{filename}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
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
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
*/
destroy.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
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
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
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

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::download
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
export const download = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/admin/inboxes/backups/{filename}/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::download
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
download.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return download.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::download
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
download.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::download
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
download.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::download
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
const downloadForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::download
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
downloadForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::download
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
downloadForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

download.form = downloadForm

const backups = {
    destroy: Object.assign(destroy, destroy),
    download: Object.assign(download, download),
}

export default backups