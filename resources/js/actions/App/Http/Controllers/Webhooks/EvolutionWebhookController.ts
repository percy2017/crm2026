import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::handle
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
export const handle = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(args, options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/api/webhooks/evolution/{instance?}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::handle
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
handle.url = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { instance: args }
    }

    if (Array.isArray(args)) {
        args = {
            instance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "instance",
    ])

    const parsedArgs = {
        instance: args?.instance,
    }

    return handle.definition.url
            .replace('{instance?}', parsedArgs.instance?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::handle
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
handle.post = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::handle
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
const handleForm = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::handle
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
handleForm.post = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(args, options),
    method: 'post',
})

handle.form = handleForm

const EvolutionWebhookController = { handle }

export default EvolutionWebhookController