import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminDealController::index
* @see app/Http/Controllers/Admin/AdminDealController.php:21
* @route '/admin/deals'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/deals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDealController::index
* @see app/Http/Controllers/Admin/AdminDealController.php:21
* @route '/admin/deals'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDealController::index
* @see app/Http/Controllers/Admin/AdminDealController.php:21
* @route '/admin/deals'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::index
* @see app/Http/Controllers/Admin/AdminDealController.php:21
* @route '/admin/deals'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::index
* @see app/Http/Controllers/Admin/AdminDealController.php:21
* @route '/admin/deals'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::index
* @see app/Http/Controllers/Admin/AdminDealController.php:21
* @route '/admin/deals'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::index
* @see app/Http/Controllers/Admin/AdminDealController.php:21
* @route '/admin/deals'
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
* @see \App\Http\Controllers\Admin\AdminDealController::store
* @see app/Http/Controllers/Admin/AdminDealController.php:46
* @route '/admin/deals'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/deals',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminDealController::store
* @see app/Http/Controllers/Admin/AdminDealController.php:46
* @route '/admin/deals'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDealController::store
* @see app/Http/Controllers/Admin/AdminDealController.php:46
* @route '/admin/deals'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::store
* @see app/Http/Controllers/Admin/AdminDealController.php:46
* @route '/admin/deals'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::store
* @see app/Http/Controllers/Admin/AdminDealController.php:46
* @route '/admin/deals'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AdminDealController::show
* @see app/Http/Controllers/Admin/AdminDealController.php:54
* @route '/admin/deals/{deal}'
*/
export const show = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/deals/{deal}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDealController::show
* @see app/Http/Controllers/Admin/AdminDealController.php:54
* @route '/admin/deals/{deal}'
*/
show.url = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deal: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { deal: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            deal: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        deal: typeof args.deal === 'object'
        ? args.deal.id
        : args.deal,
    }

    return show.definition.url
            .replace('{deal}', parsedArgs.deal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDealController::show
* @see app/Http/Controllers/Admin/AdminDealController.php:54
* @route '/admin/deals/{deal}'
*/
show.get = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::show
* @see app/Http/Controllers/Admin/AdminDealController.php:54
* @route '/admin/deals/{deal}'
*/
show.head = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::show
* @see app/Http/Controllers/Admin/AdminDealController.php:54
* @route '/admin/deals/{deal}'
*/
const showForm = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::show
* @see app/Http/Controllers/Admin/AdminDealController.php:54
* @route '/admin/deals/{deal}'
*/
showForm.get = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::show
* @see app/Http/Controllers/Admin/AdminDealController.php:54
* @route '/admin/deals/{deal}'
*/
showForm.head = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\AdminDealController::update
* @see app/Http/Controllers/Admin/AdminDealController.php:61
* @route '/admin/deals/{deal}'
*/
export const update = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/deals/{deal}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminDealController::update
* @see app/Http/Controllers/Admin/AdminDealController.php:61
* @route '/admin/deals/{deal}'
*/
update.url = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deal: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { deal: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            deal: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        deal: typeof args.deal === 'object'
        ? args.deal.id
        : args.deal,
    }

    return update.definition.url
            .replace('{deal}', parsedArgs.deal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDealController::update
* @see app/Http/Controllers/Admin/AdminDealController.php:61
* @route '/admin/deals/{deal}'
*/
update.put = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::update
* @see app/Http/Controllers/Admin/AdminDealController.php:61
* @route '/admin/deals/{deal}'
*/
const updateForm = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::update
* @see app/Http/Controllers/Admin/AdminDealController.php:61
* @route '/admin/deals/{deal}'
*/
updateForm.put = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AdminDealController::moveStage
* @see app/Http/Controllers/Admin/AdminDealController.php:83
* @route '/admin/deals/{deal}/move'
*/
export const moveStage = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: moveStage.url(args, options),
    method: 'post',
})

moveStage.definition = {
    methods: ["post"],
    url: '/admin/deals/{deal}/move',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminDealController::moveStage
* @see app/Http/Controllers/Admin/AdminDealController.php:83
* @route '/admin/deals/{deal}/move'
*/
moveStage.url = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deal: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { deal: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            deal: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        deal: typeof args.deal === 'object'
        ? args.deal.id
        : args.deal,
    }

    return moveStage.definition.url
            .replace('{deal}', parsedArgs.deal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDealController::moveStage
* @see app/Http/Controllers/Admin/AdminDealController.php:83
* @route '/admin/deals/{deal}/move'
*/
moveStage.post = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: moveStage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::moveStage
* @see app/Http/Controllers/Admin/AdminDealController.php:83
* @route '/admin/deals/{deal}/move'
*/
const moveStageForm = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: moveStage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::moveStage
* @see app/Http/Controllers/Admin/AdminDealController.php:83
* @route '/admin/deals/{deal}/move'
*/
moveStageForm.post = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: moveStage.url(args, options),
    method: 'post',
})

moveStage.form = moveStageForm

/**
* @see \App\Http\Controllers\Admin\AdminDealController::destroy
* @see app/Http/Controllers/Admin/AdminDealController.php:75
* @route '/admin/deals/{deal}'
*/
export const destroy = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/deals/{deal}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminDealController::destroy
* @see app/Http/Controllers/Admin/AdminDealController.php:75
* @route '/admin/deals/{deal}'
*/
destroy.url = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deal: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { deal: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            deal: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        deal: typeof args.deal === 'object'
        ? args.deal.id
        : args.deal,
    }

    return destroy.definition.url
            .replace('{deal}', parsedArgs.deal.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDealController::destroy
* @see app/Http/Controllers/Admin/AdminDealController.php:75
* @route '/admin/deals/{deal}'
*/
destroy.delete = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::destroy
* @see app/Http/Controllers/Admin/AdminDealController.php:75
* @route '/admin/deals/{deal}'
*/
const destroyForm = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminDealController::destroy
* @see app/Http/Controllers/Admin/AdminDealController.php:75
* @route '/admin/deals/{deal}'
*/
destroyForm.delete = (args: { deal: number | { id: number } } | [deal: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const AdminDealController = { index, store, show, update, moveStage, destroy }

export default AdminDealController