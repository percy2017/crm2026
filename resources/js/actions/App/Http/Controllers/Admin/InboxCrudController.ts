import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\InboxCrudController::index
* @see app/Http/Controllers/Admin/InboxCrudController.php:21
* @route '/admin/inboxes'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/inboxes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::index
* @see app/Http/Controllers/Admin/InboxCrudController.php:21
* @route '/admin/inboxes'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::index
* @see app/Http/Controllers/Admin/InboxCrudController.php:21
* @route '/admin/inboxes'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::index
* @see app/Http/Controllers/Admin/InboxCrudController.php:21
* @route '/admin/inboxes'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::index
* @see app/Http/Controllers/Admin/InboxCrudController.php:21
* @route '/admin/inboxes'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::index
* @see app/Http/Controllers/Admin/InboxCrudController.php:21
* @route '/admin/inboxes'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::index
* @see app/Http/Controllers/Admin/InboxCrudController.php:21
* @route '/admin/inboxes'
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
* @see \App\Http\Controllers\Admin\InboxCrudController::listJson
* @see app/Http/Controllers/Admin/InboxCrudController.php:28
* @route '/admin/inboxes/list'
*/
export const listJson = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listJson.url(options),
    method: 'get',
})

listJson.definition = {
    methods: ["get","head"],
    url: '/admin/inboxes/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::listJson
* @see app/Http/Controllers/Admin/InboxCrudController.php:28
* @route '/admin/inboxes/list'
*/
listJson.url = (options?: RouteQueryOptions) => {
    return listJson.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::listJson
* @see app/Http/Controllers/Admin/InboxCrudController.php:28
* @route '/admin/inboxes/list'
*/
listJson.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listJson.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::listJson
* @see app/Http/Controllers/Admin/InboxCrudController.php:28
* @route '/admin/inboxes/list'
*/
listJson.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listJson.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::listJson
* @see app/Http/Controllers/Admin/InboxCrudController.php:28
* @route '/admin/inboxes/list'
*/
const listJsonForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: listJson.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::listJson
* @see app/Http/Controllers/Admin/InboxCrudController.php:28
* @route '/admin/inboxes/list'
*/
listJsonForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: listJson.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::listJson
* @see app/Http/Controllers/Admin/InboxCrudController.php:28
* @route '/admin/inboxes/list'
*/
listJsonForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: listJson.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

listJson.form = listJsonForm

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::create
* @see app/Http/Controllers/Admin/InboxCrudController.php:77
* @route '/admin/inboxes/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/inboxes/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::create
* @see app/Http/Controllers/Admin/InboxCrudController.php:77
* @route '/admin/inboxes/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::create
* @see app/Http/Controllers/Admin/InboxCrudController.php:77
* @route '/admin/inboxes/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::create
* @see app/Http/Controllers/Admin/InboxCrudController.php:77
* @route '/admin/inboxes/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::create
* @see app/Http/Controllers/Admin/InboxCrudController.php:77
* @route '/admin/inboxes/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::create
* @see app/Http/Controllers/Admin/InboxCrudController.php:77
* @route '/admin/inboxes/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::create
* @see app/Http/Controllers/Admin/InboxCrudController.php:77
* @route '/admin/inboxes/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::store
* @see app/Http/Controllers/Admin/InboxCrudController.php:96
* @route '/admin/inboxes'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/inboxes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::store
* @see app/Http/Controllers/Admin/InboxCrudController.php:96
* @route '/admin/inboxes'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::store
* @see app/Http/Controllers/Admin/InboxCrudController.php:96
* @route '/admin/inboxes'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::store
* @see app/Http/Controllers/Admin/InboxCrudController.php:96
* @route '/admin/inboxes'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::store
* @see app/Http/Controllers/Admin/InboxCrudController.php:96
* @route '/admin/inboxes'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::edit
* @see app/Http/Controllers/Admin/InboxCrudController.php:186
* @route '/admin/inboxes/{inbox}/edit'
*/
export const edit = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/inboxes/{inbox}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::edit
* @see app/Http/Controllers/Admin/InboxCrudController.php:186
* @route '/admin/inboxes/{inbox}/edit'
*/
edit.url = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inbox: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { inbox: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            inbox: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        inbox: typeof args.inbox === 'object'
        ? args.inbox.id
        : args.inbox,
    }

    return edit.definition.url
            .replace('{inbox}', parsedArgs.inbox.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::edit
* @see app/Http/Controllers/Admin/InboxCrudController.php:186
* @route '/admin/inboxes/{inbox}/edit'
*/
edit.get = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::edit
* @see app/Http/Controllers/Admin/InboxCrudController.php:186
* @route '/admin/inboxes/{inbox}/edit'
*/
edit.head = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::edit
* @see app/Http/Controllers/Admin/InboxCrudController.php:186
* @route '/admin/inboxes/{inbox}/edit'
*/
const editForm = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::edit
* @see app/Http/Controllers/Admin/InboxCrudController.php:186
* @route '/admin/inboxes/{inbox}/edit'
*/
editForm.get = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::edit
* @see app/Http/Controllers/Admin/InboxCrudController.php:186
* @route '/admin/inboxes/{inbox}/edit'
*/
editForm.head = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::update
* @see app/Http/Controllers/Admin/InboxCrudController.php:193
* @route '/admin/inboxes/{inbox}'
*/
export const update = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/inboxes/{inbox}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::update
* @see app/Http/Controllers/Admin/InboxCrudController.php:193
* @route '/admin/inboxes/{inbox}'
*/
update.url = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inbox: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { inbox: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            inbox: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        inbox: typeof args.inbox === 'object'
        ? args.inbox.id
        : args.inbox,
    }

    return update.definition.url
            .replace('{inbox}', parsedArgs.inbox.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::update
* @see app/Http/Controllers/Admin/InboxCrudController.php:193
* @route '/admin/inboxes/{inbox}'
*/
update.put = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::update
* @see app/Http/Controllers/Admin/InboxCrudController.php:193
* @route '/admin/inboxes/{inbox}'
*/
const updateForm = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::update
* @see app/Http/Controllers/Admin/InboxCrudController.php:193
* @route '/admin/inboxes/{inbox}'
*/
updateForm.put = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:229
* @route '/admin/inboxes/{inbox}'
*/
export const destroy = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/inboxes/{inbox}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:229
* @route '/admin/inboxes/{inbox}'
*/
destroy.url = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inbox: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { inbox: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            inbox: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        inbox: typeof args.inbox === 'object'
        ? args.inbox.id
        : args.inbox,
    }

    return destroy.definition.url
            .replace('{inbox}', parsedArgs.inbox.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:229
* @route '/admin/inboxes/{inbox}'
*/
destroy.delete = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::destroy
* @see app/Http/Controllers/Admin/InboxCrudController.php:229
* @route '/admin/inboxes/{inbox}'
*/
const destroyForm = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Admin/InboxCrudController.php:229
* @route '/admin/inboxes/{inbox}'
*/
destroyForm.delete = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\InboxCrudController::backup
* @see app/Http/Controllers/Admin/InboxCrudController.php:43
* @route '/admin/inboxes/backup/{inbox}'
*/
export const backup = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: backup.url(args, options),
    method: 'post',
})

backup.definition = {
    methods: ["post"],
    url: '/admin/inboxes/backup/{inbox}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backup
* @see app/Http/Controllers/Admin/InboxCrudController.php:43
* @route '/admin/inboxes/backup/{inbox}'
*/
backup.url = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inbox: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { inbox: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            inbox: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        inbox: typeof args.inbox === 'object'
        ? args.inbox.id
        : args.inbox,
    }

    return backup.definition.url
            .replace('{inbox}', parsedArgs.inbox.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backup
* @see app/Http/Controllers/Admin/InboxCrudController.php:43
* @route '/admin/inboxes/backup/{inbox}'
*/
backup.post = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: backup.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backup
* @see app/Http/Controllers/Admin/InboxCrudController.php:43
* @route '/admin/inboxes/backup/{inbox}'
*/
const backupForm = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: backup.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backup
* @see app/Http/Controllers/Admin/InboxCrudController.php:43
* @route '/admin/inboxes/backup/{inbox}'
*/
backupForm.post = (args: { inbox: number | { id: number } } | [inbox: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: backup.url(args, options),
    method: 'post',
})

backup.form = backupForm

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backups
* @see app/Http/Controllers/Admin/InboxCrudController.php:35
* @route '/admin/inboxes/backups'
*/
export const backups = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: backups.url(options),
    method: 'get',
})

backups.definition = {
    methods: ["get","head"],
    url: '/admin/inboxes/backups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backups
* @see app/Http/Controllers/Admin/InboxCrudController.php:35
* @route '/admin/inboxes/backups'
*/
backups.url = (options?: RouteQueryOptions) => {
    return backups.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backups
* @see app/Http/Controllers/Admin/InboxCrudController.php:35
* @route '/admin/inboxes/backups'
*/
backups.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: backups.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backups
* @see app/Http/Controllers/Admin/InboxCrudController.php:35
* @route '/admin/inboxes/backups'
*/
backups.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: backups.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backups
* @see app/Http/Controllers/Admin/InboxCrudController.php:35
* @route '/admin/inboxes/backups'
*/
const backupsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: backups.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backups
* @see app/Http/Controllers/Admin/InboxCrudController.php:35
* @route '/admin/inboxes/backups'
*/
backupsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: backups.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::backups
* @see app/Http/Controllers/Admin/InboxCrudController.php:35
* @route '/admin/inboxes/backups'
*/
backupsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: backups.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

backups.form = backupsForm

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::deleteBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
*/
export const deleteBackup = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteBackup.url(args, options),
    method: 'delete',
})

deleteBackup.definition = {
    methods: ["delete"],
    url: '/admin/inboxes/backups/{filename}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::deleteBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
*/
deleteBackup.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteBackup.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::deleteBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
*/
deleteBackup.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteBackup.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::deleteBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
*/
const deleteBackupForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteBackup.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::deleteBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:70
* @route '/admin/inboxes/backups/{filename}'
*/
deleteBackupForm.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteBackup.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

deleteBackup.form = deleteBackupForm

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::downloadBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
export const downloadBackup = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadBackup.url(args, options),
    method: 'get',
})

downloadBackup.definition = {
    methods: ["get","head"],
    url: '/admin/inboxes/backups/{filename}/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::downloadBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
downloadBackup.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return downloadBackup.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::downloadBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
downloadBackup.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadBackup.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::downloadBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
downloadBackup.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: downloadBackup.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::downloadBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
const downloadBackupForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadBackup.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::downloadBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
downloadBackupForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadBackup.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InboxCrudController::downloadBackup
* @see app/Http/Controllers/Admin/InboxCrudController.php:59
* @route '/admin/inboxes/backups/{filename}/download'
*/
downloadBackupForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadBackup.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

downloadBackup.form = downloadBackupForm

const InboxCrudController = { index, listJson, create, store, edit, update, destroy, backup, backups, deleteBackup, downloadBackup }

export default InboxCrudController