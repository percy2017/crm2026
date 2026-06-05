import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::index
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:14
* @route '/admin/pipeline-stages'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/pipeline-stages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::index
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:14
* @route '/admin/pipeline-stages'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::index
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:14
* @route '/admin/pipeline-stages'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::index
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:14
* @route '/admin/pipeline-stages'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::index
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:14
* @route '/admin/pipeline-stages'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::index
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:14
* @route '/admin/pipeline-stages'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::index
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:14
* @route '/admin/pipeline-stages'
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
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::store
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:21
* @route '/admin/pipeline-stages'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/pipeline-stages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::store
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:21
* @route '/admin/pipeline-stages'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::store
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:21
* @route '/admin/pipeline-stages'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::store
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:21
* @route '/admin/pipeline-stages'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::store
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:21
* @route '/admin/pipeline-stages'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::update
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:41
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
export const update = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/pipeline-stages/{pipelineStage}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::update
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:41
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
update.url = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pipelineStage: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { pipelineStage: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            pipelineStage: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        pipelineStage: typeof args.pipelineStage === 'object'
        ? args.pipelineStage.id
        : args.pipelineStage,
    }

    return update.definition.url
            .replace('{pipelineStage}', parsedArgs.pipelineStage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::update
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:41
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
update.put = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::update
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:41
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
const updateForm = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::update
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:41
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
updateForm.put = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::destroy
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:53
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
export const destroy = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/pipeline-stages/{pipelineStage}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::destroy
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:53
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
destroy.url = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pipelineStage: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { pipelineStage: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            pipelineStage: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        pipelineStage: typeof args.pipelineStage === 'object'
        ? args.pipelineStage.id
        : args.pipelineStage,
    }

    return destroy.definition.url
            .replace('{pipelineStage}', parsedArgs.pipelineStage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::destroy
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:53
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
destroy.delete = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::destroy
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:53
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
const destroyForm = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::destroy
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:53
* @route '/admin/pipeline-stages/{pipelineStage}'
*/
destroyForm.delete = (args: { pipelineStage: number | { id: number } } | [pipelineStage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::reorder
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:68
* @route '/admin/pipeline-stages/reorder'
*/
export const reorder = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/admin/pipeline-stages/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::reorder
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:68
* @route '/admin/pipeline-stages/reorder'
*/
reorder.url = (options?: RouteQueryOptions) => {
    return reorder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::reorder
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:68
* @route '/admin/pipeline-stages/reorder'
*/
reorder.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::reorder
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:68
* @route '/admin/pipeline-stages/reorder'
*/
const reorderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorder.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminPipelineStageController::reorder
* @see app/Http/Controllers/Admin/AdminPipelineStageController.php:68
* @route '/admin/pipeline-stages/reorder'
*/
reorderForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorder.url(options),
    method: 'post',
})

reorder.form = reorderForm

const AdminPipelineStageController = { index, store, update, destroy, reorder }

export default AdminPipelineStageController