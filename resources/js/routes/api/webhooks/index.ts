import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::evolution
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
export const evolution = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: evolution.url(args, options),
    method: 'post',
})

evolution.definition = {
    methods: ["post"],
    url: '/api/webhooks/evolution/{instance?}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::evolution
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
evolution.url = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return evolution.definition.url
            .replace('{instance?}', parsedArgs.instance?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::evolution
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
evolution.post = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: evolution.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::evolution
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
const evolutionForm = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: evolution.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Webhooks\EvolutionWebhookController::evolution
* @see app/Http/Controllers/Webhooks/EvolutionWebhookController.php:23
* @route '/api/webhooks/evolution/{instance?}'
*/
evolutionForm.post = (args?: { instance?: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: evolution.url(args, options),
    method: 'post',
})

evolution.form = evolutionForm

const webhooks = {
    evolution: Object.assign(evolution, evolution),
}

export default webhooks