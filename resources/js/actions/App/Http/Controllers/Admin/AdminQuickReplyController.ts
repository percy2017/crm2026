import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::index
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:16
* @route '/admin/quick-replies'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/quick-replies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::index
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:16
* @route '/admin/quick-replies'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::index
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:16
* @route '/admin/quick-replies'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::index
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:16
* @route '/admin/quick-replies'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::index
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:16
* @route '/admin/quick-replies'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::index
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:16
* @route '/admin/quick-replies'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::index
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:16
* @route '/admin/quick-replies'
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
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::list
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:21
* @route '/admin/quick-replies/list'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/admin/quick-replies/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::list
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:21
* @route '/admin/quick-replies/list'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::list
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:21
* @route '/admin/quick-replies/list'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::list
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:21
* @route '/admin/quick-replies/list'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::list
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:21
* @route '/admin/quick-replies/list'
*/
const listForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::list
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:21
* @route '/admin/quick-replies/list'
*/
listForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::list
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:21
* @route '/admin/quick-replies/list'
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
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::store
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:26
* @route '/admin/quick-replies'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/quick-replies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::store
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:26
* @route '/admin/quick-replies'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::store
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:26
* @route '/admin/quick-replies'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::store
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:26
* @route '/admin/quick-replies'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::store
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:26
* @route '/admin/quick-replies'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::update
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:49
* @route '/admin/quick-replies/{quickReply}'
*/
export const update = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/quick-replies/{quickReply}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::update
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:49
* @route '/admin/quick-replies/{quickReply}'
*/
update.url = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quickReply: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { quickReply: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            quickReply: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        quickReply: typeof args.quickReply === 'object'
        ? args.quickReply.id
        : args.quickReply,
    }

    return update.definition.url
            .replace('{quickReply}', parsedArgs.quickReply.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::update
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:49
* @route '/admin/quick-replies/{quickReply}'
*/
update.put = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::update
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:49
* @route '/admin/quick-replies/{quickReply}'
*/
const updateForm = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::update
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:49
* @route '/admin/quick-replies/{quickReply}'
*/
updateForm.put = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::destroy
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:85
* @route '/admin/quick-replies/{quickReply}'
*/
export const destroy = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/quick-replies/{quickReply}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::destroy
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:85
* @route '/admin/quick-replies/{quickReply}'
*/
destroy.url = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quickReply: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { quickReply: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            quickReply: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        quickReply: typeof args.quickReply === 'object'
        ? args.quickReply.id
        : args.quickReply,
    }

    return destroy.definition.url
            .replace('{quickReply}', parsedArgs.quickReply.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::destroy
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:85
* @route '/admin/quick-replies/{quickReply}'
*/
destroy.delete = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::destroy
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:85
* @route '/admin/quick-replies/{quickReply}'
*/
const destroyForm = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminQuickReplyController::destroy
* @see app/Http/Controllers/Admin/AdminQuickReplyController.php:85
* @route '/admin/quick-replies/{quickReply}'
*/
destroyForm.delete = (args: { quickReply: number | { id: number } } | [quickReply: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const AdminQuickReplyController = { index, list, store, update, destroy }

export default AdminQuickReplyController