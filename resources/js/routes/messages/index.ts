import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\WidgetController::send
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/api/widget/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\WidgetController::send
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WidgetController::send
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::send
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
const sendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::send
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
sendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
})

send.form = sendForm

const messages = {
    send: Object.assign(send, send),
}

export default messages