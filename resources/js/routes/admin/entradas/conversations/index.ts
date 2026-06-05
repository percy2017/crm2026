import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
export const destroy = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/entradas/{instance}/conversations/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
destroy.url = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            instance: args[0],
            conversation: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        instance: args.instance,
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
    }

    return destroy.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
destroy.delete = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroy
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
const destroyForm = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
destroyForm.delete = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const conversations = {
    destroy: Object.assign(destroy, destroy),
}

export default conversations