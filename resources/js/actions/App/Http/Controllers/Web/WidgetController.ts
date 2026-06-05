import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\WidgetController::config
* @see app/Http/Controllers/Web/WidgetController.php:17
* @route '/api/widget/config'
*/
export const config = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: config.url(options),
    method: 'get',
})

config.definition = {
    methods: ["get","head"],
    url: '/api/widget/config',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\WidgetController::config
* @see app/Http/Controllers/Web/WidgetController.php:17
* @route '/api/widget/config'
*/
config.url = (options?: RouteQueryOptions) => {
    return config.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WidgetController::config
* @see app/Http/Controllers/Web/WidgetController.php:17
* @route '/api/widget/config'
*/
config.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: config.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::config
* @see app/Http/Controllers/Web/WidgetController.php:17
* @route '/api/widget/config'
*/
config.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: config.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::config
* @see app/Http/Controllers/Web/WidgetController.php:17
* @route '/api/widget/config'
*/
const configForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: config.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::config
* @see app/Http/Controllers/Web/WidgetController.php:17
* @route '/api/widget/config'
*/
configForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: config.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::config
* @see app/Http/Controllers/Web/WidgetController.php:17
* @route '/api/widget/config'
*/
configForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: config.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

config.form = configForm

/**
* @see \App\Http\Controllers\Web\WidgetController::visitor
* @see app/Http/Controllers/Web/WidgetController.php:44
* @route '/api/widget/visitor'
*/
export const visitor = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: visitor.url(options),
    method: 'post',
})

visitor.definition = {
    methods: ["post"],
    url: '/api/widget/visitor',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\WidgetController::visitor
* @see app/Http/Controllers/Web/WidgetController.php:44
* @route '/api/widget/visitor'
*/
visitor.url = (options?: RouteQueryOptions) => {
    return visitor.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WidgetController::visitor
* @see app/Http/Controllers/Web/WidgetController.php:44
* @route '/api/widget/visitor'
*/
visitor.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: visitor.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::visitor
* @see app/Http/Controllers/Web/WidgetController.php:44
* @route '/api/widget/visitor'
*/
const visitorForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: visitor.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::visitor
* @see app/Http/Controllers/Web/WidgetController.php:44
* @route '/api/widget/visitor'
*/
visitorForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: visitor.url(options),
    method: 'post',
})

visitor.form = visitorForm

/**
* @see \App\Http\Controllers\Web\WidgetController::conversations
* @see app/Http/Controllers/Web/WidgetController.php:89
* @route '/api/widget/conversations'
*/
export const conversations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(options),
    method: 'get',
})

conversations.definition = {
    methods: ["get","head"],
    url: '/api/widget/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\WidgetController::conversations
* @see app/Http/Controllers/Web/WidgetController.php:89
* @route '/api/widget/conversations'
*/
conversations.url = (options?: RouteQueryOptions) => {
    return conversations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WidgetController::conversations
* @see app/Http/Controllers/Web/WidgetController.php:89
* @route '/api/widget/conversations'
*/
conversations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::conversations
* @see app/Http/Controllers/Web/WidgetController.php:89
* @route '/api/widget/conversations'
*/
conversations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::conversations
* @see app/Http/Controllers/Web/WidgetController.php:89
* @route '/api/widget/conversations'
*/
const conversationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::conversations
* @see app/Http/Controllers/Web/WidgetController.php:89
* @route '/api/widget/conversations'
*/
conversationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::conversations
* @see app/Http/Controllers/Web/WidgetController.php:89
* @route '/api/widget/conversations'
*/
conversationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

conversations.form = conversationsForm

/**
* @see \App\Http\Controllers\Web\WidgetController::createConversation
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
export const createConversation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(options),
    method: 'post',
})

createConversation.definition = {
    methods: ["post"],
    url: '/api/widget/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\WidgetController::createConversation
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
createConversation.url = (options?: RouteQueryOptions) => {
    return createConversation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WidgetController::createConversation
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
createConversation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::createConversation
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
const createConversationForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createConversation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::createConversation
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
createConversationForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createConversation.url(options),
    method: 'post',
})

createConversation.form = createConversationForm

/**
* @see \App\Http\Controllers\Web\WidgetController::sendMessage
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
export const sendMessage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(options),
    method: 'post',
})

sendMessage.definition = {
    methods: ["post"],
    url: '/api/widget/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\WidgetController::sendMessage
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
sendMessage.url = (options?: RouteQueryOptions) => {
    return sendMessage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WidgetController::sendMessage
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
sendMessage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::sendMessage
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
const sendMessageForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendMessage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::sendMessage
* @see app/Http/Controllers/Web/WidgetController.php:231
* @route '/api/widget/messages'
*/
sendMessageForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendMessage.url(options),
    method: 'post',
})

sendMessage.form = sendMessageForm

const WidgetController = { config, visitor, conversations, createConversation, sendMessage }

export default WidgetController