import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
export const destroy = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/entradas/{instance}/messages/{message}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
destroy.url = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            instance: args[0],
            message: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        instance: args.instance,
        message: typeof args.message === 'object'
        ? args.message.id
        : args.message,
    }

    return destroy.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
destroy.delete = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
const destroyForm = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
destroyForm.delete = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const messages = {
    destroy: Object.assign(destroy, destroy),
}

export default messages