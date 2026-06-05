import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::index
* @see app/Http/Controllers/Admin/AdminCronJobController.php:16
* @route '/admin/cron-jobs'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/cron-jobs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::index
* @see app/Http/Controllers/Admin/AdminCronJobController.php:16
* @route '/admin/cron-jobs'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::index
* @see app/Http/Controllers/Admin/AdminCronJobController.php:16
* @route '/admin/cron-jobs'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::index
* @see app/Http/Controllers/Admin/AdminCronJobController.php:16
* @route '/admin/cron-jobs'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::index
* @see app/Http/Controllers/Admin/AdminCronJobController.php:16
* @route '/admin/cron-jobs'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::index
* @see app/Http/Controllers/Admin/AdminCronJobController.php:16
* @route '/admin/cron-jobs'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::index
* @see app/Http/Controllers/Admin/AdminCronJobController.php:16
* @route '/admin/cron-jobs'
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
* @see \App\Http\Controllers\Admin\AdminCronJobController::list
* @see app/Http/Controllers/Admin/AdminCronJobController.php:21
* @route '/admin/cron-jobs/list'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/admin/cron-jobs/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::list
* @see app/Http/Controllers/Admin/AdminCronJobController.php:21
* @route '/admin/cron-jobs/list'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::list
* @see app/Http/Controllers/Admin/AdminCronJobController.php:21
* @route '/admin/cron-jobs/list'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::list
* @see app/Http/Controllers/Admin/AdminCronJobController.php:21
* @route '/admin/cron-jobs/list'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::list
* @see app/Http/Controllers/Admin/AdminCronJobController.php:21
* @route '/admin/cron-jobs/list'
*/
const listForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::list
* @see app/Http/Controllers/Admin/AdminCronJobController.php:21
* @route '/admin/cron-jobs/list'
*/
listForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::list
* @see app/Http/Controllers/Admin/AdminCronJobController.php:21
* @route '/admin/cron-jobs/list'
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
* @see \App\Http\Controllers\Admin\AdminCronJobController::commands
* @see app/Http/Controllers/Admin/AdminCronJobController.php:42
* @route '/admin/cron-jobs/commands'
*/
export const commands = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: commands.url(options),
    method: 'get',
})

commands.definition = {
    methods: ["get","head"],
    url: '/admin/cron-jobs/commands',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::commands
* @see app/Http/Controllers/Admin/AdminCronJobController.php:42
* @route '/admin/cron-jobs/commands'
*/
commands.url = (options?: RouteQueryOptions) => {
    return commands.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::commands
* @see app/Http/Controllers/Admin/AdminCronJobController.php:42
* @route '/admin/cron-jobs/commands'
*/
commands.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: commands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::commands
* @see app/Http/Controllers/Admin/AdminCronJobController.php:42
* @route '/admin/cron-jobs/commands'
*/
commands.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: commands.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::commands
* @see app/Http/Controllers/Admin/AdminCronJobController.php:42
* @route '/admin/cron-jobs/commands'
*/
const commandsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: commands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::commands
* @see app/Http/Controllers/Admin/AdminCronJobController.php:42
* @route '/admin/cron-jobs/commands'
*/
commandsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: commands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::commands
* @see app/Http/Controllers/Admin/AdminCronJobController.php:42
* @route '/admin/cron-jobs/commands'
*/
commandsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: commands.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

commands.form = commandsForm

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::store
* @see app/Http/Controllers/Admin/AdminCronJobController.php:58
* @route '/admin/cron-jobs'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/cron-jobs',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::store
* @see app/Http/Controllers/Admin/AdminCronJobController.php:58
* @route '/admin/cron-jobs'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::store
* @see app/Http/Controllers/Admin/AdminCronJobController.php:58
* @route '/admin/cron-jobs'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::store
* @see app/Http/Controllers/Admin/AdminCronJobController.php:58
* @route '/admin/cron-jobs'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::store
* @see app/Http/Controllers/Admin/AdminCronJobController.php:58
* @route '/admin/cron-jobs'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::update
* @see app/Http/Controllers/Admin/AdminCronJobController.php:81
* @route '/admin/cron-jobs/{cronJob}'
*/
export const update = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/cron-jobs/{cronJob}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::update
* @see app/Http/Controllers/Admin/AdminCronJobController.php:81
* @route '/admin/cron-jobs/{cronJob}'
*/
update.url = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cronJob: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { cronJob: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            cronJob: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        cronJob: typeof args.cronJob === 'object'
        ? args.cronJob.id
        : args.cronJob,
    }

    return update.definition.url
            .replace('{cronJob}', parsedArgs.cronJob.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::update
* @see app/Http/Controllers/Admin/AdminCronJobController.php:81
* @route '/admin/cron-jobs/{cronJob}'
*/
update.put = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::update
* @see app/Http/Controllers/Admin/AdminCronJobController.php:81
* @route '/admin/cron-jobs/{cronJob}'
*/
const updateForm = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::update
* @see app/Http/Controllers/Admin/AdminCronJobController.php:81
* @route '/admin/cron-jobs/{cronJob}'
*/
updateForm.put = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AdminCronJobController::destroy
* @see app/Http/Controllers/Admin/AdminCronJobController.php:104
* @route '/admin/cron-jobs/{cronJob}'
*/
export const destroy = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/cron-jobs/{cronJob}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::destroy
* @see app/Http/Controllers/Admin/AdminCronJobController.php:104
* @route '/admin/cron-jobs/{cronJob}'
*/
destroy.url = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cronJob: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { cronJob: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            cronJob: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        cronJob: typeof args.cronJob === 'object'
        ? args.cronJob.id
        : args.cronJob,
    }

    return destroy.definition.url
            .replace('{cronJob}', parsedArgs.cronJob.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::destroy
* @see app/Http/Controllers/Admin/AdminCronJobController.php:104
* @route '/admin/cron-jobs/{cronJob}'
*/
destroy.delete = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::destroy
* @see app/Http/Controllers/Admin/AdminCronJobController.php:104
* @route '/admin/cron-jobs/{cronJob}'
*/
const destroyForm = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::destroy
* @see app/Http/Controllers/Admin/AdminCronJobController.php:104
* @route '/admin/cron-jobs/{cronJob}'
*/
destroyForm.delete = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AdminCronJobController::toggle
* @see app/Http/Controllers/Admin/AdminCronJobController.php:112
* @route '/admin/cron-jobs/{cronJob}/toggle'
*/
export const toggle = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

toggle.definition = {
    methods: ["post"],
    url: '/admin/cron-jobs/{cronJob}/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::toggle
* @see app/Http/Controllers/Admin/AdminCronJobController.php:112
* @route '/admin/cron-jobs/{cronJob}/toggle'
*/
toggle.url = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cronJob: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { cronJob: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            cronJob: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        cronJob: typeof args.cronJob === 'object'
        ? args.cronJob.id
        : args.cronJob,
    }

    return toggle.definition.url
            .replace('{cronJob}', parsedArgs.cronJob.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::toggle
* @see app/Http/Controllers/Admin/AdminCronJobController.php:112
* @route '/admin/cron-jobs/{cronJob}/toggle'
*/
toggle.post = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::toggle
* @see app/Http/Controllers/Admin/AdminCronJobController.php:112
* @route '/admin/cron-jobs/{cronJob}/toggle'
*/
const toggleForm = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::toggle
* @see app/Http/Controllers/Admin/AdminCronJobController.php:112
* @route '/admin/cron-jobs/{cronJob}/toggle'
*/
toggleForm.post = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url(args, options),
    method: 'post',
})

toggle.form = toggleForm

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::run
* @see app/Http/Controllers/Admin/AdminCronJobController.php:119
* @route '/admin/cron-jobs/{cronJob}/run'
*/
export const run = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

run.definition = {
    methods: ["post"],
    url: '/admin/cron-jobs/{cronJob}/run',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::run
* @see app/Http/Controllers/Admin/AdminCronJobController.php:119
* @route '/admin/cron-jobs/{cronJob}/run'
*/
run.url = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cronJob: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { cronJob: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            cronJob: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        cronJob: typeof args.cronJob === 'object'
        ? args.cronJob.id
        : args.cronJob,
    }

    return run.definition.url
            .replace('{cronJob}', parsedArgs.cronJob.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::run
* @see app/Http/Controllers/Admin/AdminCronJobController.php:119
* @route '/admin/cron-jobs/{cronJob}/run'
*/
run.post = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::run
* @see app/Http/Controllers/Admin/AdminCronJobController.php:119
* @route '/admin/cron-jobs/{cronJob}/run'
*/
const runForm = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: run.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::run
* @see app/Http/Controllers/Admin/AdminCronJobController.php:119
* @route '/admin/cron-jobs/{cronJob}/run'
*/
runForm.post = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: run.url(args, options),
    method: 'post',
})

run.form = runForm

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::logs
* @see app/Http/Controllers/Admin/AdminCronJobController.php:156
* @route '/admin/cron-jobs/{cronJob}/logs'
*/
export const logs = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(args, options),
    method: 'get',
})

logs.definition = {
    methods: ["get","head"],
    url: '/admin/cron-jobs/{cronJob}/logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::logs
* @see app/Http/Controllers/Admin/AdminCronJobController.php:156
* @route '/admin/cron-jobs/{cronJob}/logs'
*/
logs.url = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cronJob: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { cronJob: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            cronJob: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        cronJob: typeof args.cronJob === 'object'
        ? args.cronJob.id
        : args.cronJob,
    }

    return logs.definition.url
            .replace('{cronJob}', parsedArgs.cronJob.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::logs
* @see app/Http/Controllers/Admin/AdminCronJobController.php:156
* @route '/admin/cron-jobs/{cronJob}/logs'
*/
logs.get = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::logs
* @see app/Http/Controllers/Admin/AdminCronJobController.php:156
* @route '/admin/cron-jobs/{cronJob}/logs'
*/
logs.head = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logs.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::logs
* @see app/Http/Controllers/Admin/AdminCronJobController.php:156
* @route '/admin/cron-jobs/{cronJob}/logs'
*/
const logsForm = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::logs
* @see app/Http/Controllers/Admin/AdminCronJobController.php:156
* @route '/admin/cron-jobs/{cronJob}/logs'
*/
logsForm.get = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logs.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCronJobController::logs
* @see app/Http/Controllers/Admin/AdminCronJobController.php:156
* @route '/admin/cron-jobs/{cronJob}/logs'
*/
logsForm.head = (args: { cronJob: number | { id: number } } | [cronJob: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: logs.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

logs.form = logsForm

const cronJobs = {
    index: Object.assign(index, index),
    list: Object.assign(list, list),
    commands: Object.assign(commands, commands),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    toggle: Object.assign(toggle, toggle),
    run: Object.assign(run, run),
    logs: Object.assign(logs, logs),
}

export default cronJobs