import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminContactController::index
* @see app/Http/Controllers/Admin/AdminContactController.php:24
* @route '/admin/contacts'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/contacts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::index
* @see app/Http/Controllers/Admin/AdminContactController.php:24
* @route '/admin/contacts'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::index
* @see app/Http/Controllers/Admin/AdminContactController.php:24
* @route '/admin/contacts'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::index
* @see app/Http/Controllers/Admin/AdminContactController.php:24
* @route '/admin/contacts'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::index
* @see app/Http/Controllers/Admin/AdminContactController.php:24
* @route '/admin/contacts'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::index
* @see app/Http/Controllers/Admin/AdminContactController.php:24
* @route '/admin/contacts'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::index
* @see app/Http/Controllers/Admin/AdminContactController.php:24
* @route '/admin/contacts'
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
* @see \App\Http\Controllers\Admin\AdminContactController::create
* @see app/Http/Controllers/Admin/AdminContactController.php:87
* @route '/admin/contacts/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/contacts/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::create
* @see app/Http/Controllers/Admin/AdminContactController.php:87
* @route '/admin/contacts/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::create
* @see app/Http/Controllers/Admin/AdminContactController.php:87
* @route '/admin/contacts/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::create
* @see app/Http/Controllers/Admin/AdminContactController.php:87
* @route '/admin/contacts/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::create
* @see app/Http/Controllers/Admin/AdminContactController.php:87
* @route '/admin/contacts/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::create
* @see app/Http/Controllers/Admin/AdminContactController.php:87
* @route '/admin/contacts/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::create
* @see app/Http/Controllers/Admin/AdminContactController.php:87
* @route '/admin/contacts/create'
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
* @see \App\Http\Controllers\Admin\AdminContactController::importMethod
* @see app/Http/Controllers/Admin/AdminContactController.php:110
* @route '/admin/contacts/import'
*/
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: importMethod.url(options),
    method: 'get',
})

importMethod.definition = {
    methods: ["get","head"],
    url: '/admin/contacts/import',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importMethod
* @see app/Http/Controllers/Admin/AdminContactController.php:110
* @route '/admin/contacts/import'
*/
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importMethod
* @see app/Http/Controllers/Admin/AdminContactController.php:110
* @route '/admin/contacts/import'
*/
importMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: importMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importMethod
* @see app/Http/Controllers/Admin/AdminContactController.php:110
* @route '/admin/contacts/import'
*/
importMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: importMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importMethod
* @see app/Http/Controllers/Admin/AdminContactController.php:110
* @route '/admin/contacts/import'
*/
const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importMethod
* @see app/Http/Controllers/Admin/AdminContactController.php:110
* @route '/admin/contacts/import'
*/
importMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importMethod
* @see app/Http/Controllers/Admin/AdminContactController.php:110
* @route '/admin/contacts/import'
*/
importMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

importMethod.form = importMethodForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::show
* @see app/Http/Controllers/Admin/AdminContactController.php:40
* @route '/admin/contacts/{contact}'
*/
export const show = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/contacts/{contact}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::show
* @see app/Http/Controllers/Admin/AdminContactController.php:40
* @route '/admin/contacts/{contact}'
*/
show.url = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { contact: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { contact: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            contact: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        contact: typeof args.contact === 'object'
        ? args.contact.id
        : args.contact,
    }

    return show.definition.url
            .replace('{contact}', parsedArgs.contact.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::show
* @see app/Http/Controllers/Admin/AdminContactController.php:40
* @route '/admin/contacts/{contact}'
*/
show.get = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::show
* @see app/Http/Controllers/Admin/AdminContactController.php:40
* @route '/admin/contacts/{contact}'
*/
show.head = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::show
* @see app/Http/Controllers/Admin/AdminContactController.php:40
* @route '/admin/contacts/{contact}'
*/
const showForm = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::show
* @see app/Http/Controllers/Admin/AdminContactController.php:40
* @route '/admin/contacts/{contact}'
*/
showForm.get = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::show
* @see app/Http/Controllers/Admin/AdminContactController.php:40
* @route '/admin/contacts/{contact}'
*/
showForm.head = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\AdminContactController::store
* @see app/Http/Controllers/Admin/AdminContactController.php:180
* @route '/admin/contacts'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/contacts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::store
* @see app/Http/Controllers/Admin/AdminContactController.php:180
* @route '/admin/contacts'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::store
* @see app/Http/Controllers/Admin/AdminContactController.php:180
* @route '/admin/contacts'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::store
* @see app/Http/Controllers/Admin/AdminContactController.php:180
* @route '/admin/contacts'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::store
* @see app/Http/Controllers/Admin/AdminContactController.php:180
* @route '/admin/contacts'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::fetchFromEvolution
* @see app/Http/Controllers/Admin/AdminContactController.php:200
* @route '/admin/contacts/fetch-from-evolution'
*/
export const fetchFromEvolution = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fetchFromEvolution.url(options),
    method: 'post',
})

fetchFromEvolution.definition = {
    methods: ["post"],
    url: '/admin/contacts/fetch-from-evolution',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::fetchFromEvolution
* @see app/Http/Controllers/Admin/AdminContactController.php:200
* @route '/admin/contacts/fetch-from-evolution'
*/
fetchFromEvolution.url = (options?: RouteQueryOptions) => {
    return fetchFromEvolution.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::fetchFromEvolution
* @see app/Http/Controllers/Admin/AdminContactController.php:200
* @route '/admin/contacts/fetch-from-evolution'
*/
fetchFromEvolution.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fetchFromEvolution.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::fetchFromEvolution
* @see app/Http/Controllers/Admin/AdminContactController.php:200
* @route '/admin/contacts/fetch-from-evolution'
*/
const fetchFromEvolutionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: fetchFromEvolution.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::fetchFromEvolution
* @see app/Http/Controllers/Admin/AdminContactController.php:200
* @route '/admin/contacts/fetch-from-evolution'
*/
fetchFromEvolutionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: fetchFromEvolution.url(options),
    method: 'post',
})

fetchFromEvolution.form = fetchFromEvolutionForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanInstances
* @see app/Http/Controllers/Admin/AdminContactController.php:325
* @route '/admin/contacts/scan-instances'
*/
export const scanInstances = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: scanInstances.url(options),
    method: 'post',
})

scanInstances.definition = {
    methods: ["post"],
    url: '/admin/contacts/scan-instances',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanInstances
* @see app/Http/Controllers/Admin/AdminContactController.php:325
* @route '/admin/contacts/scan-instances'
*/
scanInstances.url = (options?: RouteQueryOptions) => {
    return scanInstances.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanInstances
* @see app/Http/Controllers/Admin/AdminContactController.php:325
* @route '/admin/contacts/scan-instances'
*/
scanInstances.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: scanInstances.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanInstances
* @see app/Http/Controllers/Admin/AdminContactController.php:325
* @route '/admin/contacts/scan-instances'
*/
const scanInstancesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: scanInstances.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanInstances
* @see app/Http/Controllers/Admin/AdminContactController.php:325
* @route '/admin/contacts/scan-instances'
*/
scanInstancesForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: scanInstances.url(options),
    method: 'post',
})

scanInstances.form = scanInstancesForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importBatch
* @see app/Http/Controllers/Admin/AdminContactController.php:385
* @route '/admin/contacts/import-batch'
*/
export const importBatch = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importBatch.url(options),
    method: 'post',
})

importBatch.definition = {
    methods: ["post"],
    url: '/admin/contacts/import-batch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importBatch
* @see app/Http/Controllers/Admin/AdminContactController.php:385
* @route '/admin/contacts/import-batch'
*/
importBatch.url = (options?: RouteQueryOptions) => {
    return importBatch.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importBatch
* @see app/Http/Controllers/Admin/AdminContactController.php:385
* @route '/admin/contacts/import-batch'
*/
importBatch.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importBatch.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importBatch
* @see app/Http/Controllers/Admin/AdminContactController.php:385
* @route '/admin/contacts/import-batch'
*/
const importBatchForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importBatch.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importBatch
* @see app/Http/Controllers/Admin/AdminContactController.php:385
* @route '/admin/contacts/import-batch'
*/
importBatchForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importBatch.url(options),
    method: 'post',
})

importBatch.form = importBatchForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::edit
* @see app/Http/Controllers/Admin/AdminContactController.php:504
* @route '/admin/contacts/{contact}/edit'
*/
export const edit = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/contacts/{contact}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::edit
* @see app/Http/Controllers/Admin/AdminContactController.php:504
* @route '/admin/contacts/{contact}/edit'
*/
edit.url = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { contact: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { contact: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            contact: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        contact: typeof args.contact === 'object'
        ? args.contact.id
        : args.contact,
    }

    return edit.definition.url
            .replace('{contact}', parsedArgs.contact.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::edit
* @see app/Http/Controllers/Admin/AdminContactController.php:504
* @route '/admin/contacts/{contact}/edit'
*/
edit.get = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::edit
* @see app/Http/Controllers/Admin/AdminContactController.php:504
* @route '/admin/contacts/{contact}/edit'
*/
edit.head = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::edit
* @see app/Http/Controllers/Admin/AdminContactController.php:504
* @route '/admin/contacts/{contact}/edit'
*/
const editForm = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::edit
* @see app/Http/Controllers/Admin/AdminContactController.php:504
* @route '/admin/contacts/{contact}/edit'
*/
editForm.get = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::edit
* @see app/Http/Controllers/Admin/AdminContactController.php:504
* @route '/admin/contacts/{contact}/edit'
*/
editForm.head = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\AdminContactController::update
* @see app/Http/Controllers/Admin/AdminContactController.php:547
* @route '/admin/contacts/{contact}'
*/
export const update = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/contacts/{contact}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::update
* @see app/Http/Controllers/Admin/AdminContactController.php:547
* @route '/admin/contacts/{contact}'
*/
update.url = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { contact: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { contact: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            contact: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        contact: typeof args.contact === 'object'
        ? args.contact.id
        : args.contact,
    }

    return update.definition.url
            .replace('{contact}', parsedArgs.contact.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::update
* @see app/Http/Controllers/Admin/AdminContactController.php:547
* @route '/admin/contacts/{contact}'
*/
update.put = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::update
* @see app/Http/Controllers/Admin/AdminContactController.php:547
* @route '/admin/contacts/{contact}'
*/
const updateForm = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::update
* @see app/Http/Controllers/Admin/AdminContactController.php:547
* @route '/admin/contacts/{contact}'
*/
updateForm.put = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AdminContactController::destroy
* @see app/Http/Controllers/Admin/AdminContactController.php:567
* @route '/admin/contacts/{contact}'
*/
export const destroy = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/contacts/{contact}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::destroy
* @see app/Http/Controllers/Admin/AdminContactController.php:567
* @route '/admin/contacts/{contact}'
*/
destroy.url = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { contact: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { contact: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            contact: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        contact: typeof args.contact === 'object'
        ? args.contact.id
        : args.contact,
    }

    return destroy.definition.url
            .replace('{contact}', parsedArgs.contact.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::destroy
* @see app/Http/Controllers/Admin/AdminContactController.php:567
* @route '/admin/contacts/{contact}'
*/
destroy.delete = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::destroy
* @see app/Http/Controllers/Admin/AdminContactController.php:567
* @route '/admin/contacts/{contact}'
*/
const destroyForm = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::destroy
* @see app/Http/Controllers/Admin/AdminContactController.php:567
* @route '/admin/contacts/{contact}'
*/
destroyForm.delete = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\AdminContactController::batchDestroy
* @see app/Http/Controllers/Admin/AdminContactController.php:583
* @route '/admin/contacts/batch-delete'
*/
export const batchDestroy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: batchDestroy.url(options),
    method: 'post',
})

batchDestroy.definition = {
    methods: ["post"],
    url: '/admin/contacts/batch-delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::batchDestroy
* @see app/Http/Controllers/Admin/AdminContactController.php:583
* @route '/admin/contacts/batch-delete'
*/
batchDestroy.url = (options?: RouteQueryOptions) => {
    return batchDestroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::batchDestroy
* @see app/Http/Controllers/Admin/AdminContactController.php:583
* @route '/admin/contacts/batch-delete'
*/
batchDestroy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: batchDestroy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::batchDestroy
* @see app/Http/Controllers/Admin/AdminContactController.php:583
* @route '/admin/contacts/batch-delete'
*/
const batchDestroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: batchDestroy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::batchDestroy
* @see app/Http/Controllers/Admin/AdminContactController.php:583
* @route '/admin/contacts/batch-delete'
*/
batchDestroyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: batchDestroy.url(options),
    method: 'post',
})

batchDestroy.form = batchDestroyForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanGroups
* @see app/Http/Controllers/Admin/AdminContactController.php:607
* @route '/admin/contacts/scan-groups'
*/
export const scanGroups = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: scanGroups.url(options),
    method: 'post',
})

scanGroups.definition = {
    methods: ["post"],
    url: '/admin/contacts/scan-groups',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanGroups
* @see app/Http/Controllers/Admin/AdminContactController.php:607
* @route '/admin/contacts/scan-groups'
*/
scanGroups.url = (options?: RouteQueryOptions) => {
    return scanGroups.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanGroups
* @see app/Http/Controllers/Admin/AdminContactController.php:607
* @route '/admin/contacts/scan-groups'
*/
scanGroups.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: scanGroups.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanGroups
* @see app/Http/Controllers/Admin/AdminContactController.php:607
* @route '/admin/contacts/scan-groups'
*/
const scanGroupsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: scanGroups.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::scanGroups
* @see app/Http/Controllers/Admin/AdminContactController.php:607
* @route '/admin/contacts/scan-groups'
*/
scanGroupsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: scanGroups.url(options),
    method: 'post',
})

scanGroups.form = scanGroupsForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importGroupMembers
* @see app/Http/Controllers/Admin/AdminContactController.php:688
* @route '/admin/contacts/import-group-members'
*/
export const importGroupMembers = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importGroupMembers.url(options),
    method: 'post',
})

importGroupMembers.definition = {
    methods: ["post"],
    url: '/admin/contacts/import-group-members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importGroupMembers
* @see app/Http/Controllers/Admin/AdminContactController.php:688
* @route '/admin/contacts/import-group-members'
*/
importGroupMembers.url = (options?: RouteQueryOptions) => {
    return importGroupMembers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importGroupMembers
* @see app/Http/Controllers/Admin/AdminContactController.php:688
* @route '/admin/contacts/import-group-members'
*/
importGroupMembers.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importGroupMembers.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importGroupMembers
* @see app/Http/Controllers/Admin/AdminContactController.php:688
* @route '/admin/contacts/import-group-members'
*/
const importGroupMembersForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importGroupMembers.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importGroupMembers
* @see app/Http/Controllers/Admin/AdminContactController.php:688
* @route '/admin/contacts/import-group-members'
*/
importGroupMembersForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importGroupMembers.url(options),
    method: 'post',
})

importGroupMembers.form = importGroupMembersForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importCsv
* @see app/Http/Controllers/Admin/AdminContactController.php:132
* @route '/admin/contacts/import-csv'
*/
export const importCsv = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importCsv.url(options),
    method: 'post',
})

importCsv.definition = {
    methods: ["post"],
    url: '/admin/contacts/import-csv',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importCsv
* @see app/Http/Controllers/Admin/AdminContactController.php:132
* @route '/admin/contacts/import-csv'
*/
importCsv.url = (options?: RouteQueryOptions) => {
    return importCsv.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importCsv
* @see app/Http/Controllers/Admin/AdminContactController.php:132
* @route '/admin/contacts/import-csv'
*/
importCsv.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importCsv.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importCsv
* @see app/Http/Controllers/Admin/AdminContactController.php:132
* @route '/admin/contacts/import-csv'
*/
const importCsvForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importCsv.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::importCsv
* @see app/Http/Controllers/Admin/AdminContactController.php:132
* @route '/admin/contacts/import-csv'
*/
importCsvForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importCsv.url(options),
    method: 'post',
})

importCsv.form = importCsvForm

/**
* @see \App\Http\Controllers\Admin\AdminContactController::syncGroup
* @see app/Http/Controllers/Admin/AdminContactController.php:871
* @route '/admin/contacts/{contact}/sync-group'
*/
export const syncGroup = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncGroup.url(args, options),
    method: 'post',
})

syncGroup.definition = {
    methods: ["post"],
    url: '/admin/contacts/{contact}/sync-group',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminContactController::syncGroup
* @see app/Http/Controllers/Admin/AdminContactController.php:871
* @route '/admin/contacts/{contact}/sync-group'
*/
syncGroup.url = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { contact: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { contact: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            contact: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        contact: typeof args.contact === 'object'
        ? args.contact.id
        : args.contact,
    }

    return syncGroup.definition.url
            .replace('{contact}', parsedArgs.contact.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminContactController::syncGroup
* @see app/Http/Controllers/Admin/AdminContactController.php:871
* @route '/admin/contacts/{contact}/sync-group'
*/
syncGroup.post = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncGroup.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::syncGroup
* @see app/Http/Controllers/Admin/AdminContactController.php:871
* @route '/admin/contacts/{contact}/sync-group'
*/
const syncGroupForm = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncGroup.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminContactController::syncGroup
* @see app/Http/Controllers/Admin/AdminContactController.php:871
* @route '/admin/contacts/{contact}/sync-group'
*/
syncGroupForm.post = (args: { contact: number | { id: number } } | [contact: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncGroup.url(args, options),
    method: 'post',
})

syncGroup.form = syncGroupForm

const AdminContactController = { index, create, importMethod, show, store, fetchFromEvolution, scanInstances, importBatch, edit, update, destroy, batchDestroy, scanGroups, importGroupMembers, importCsv, syncGroup, import: importMethod }

export default AdminContactController