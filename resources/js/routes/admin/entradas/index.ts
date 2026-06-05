import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import messages4ba6e9 from './messages'
import conversations from './conversations'
/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chat
* @see app/Http/Controllers/Admin/AdminEntradaController.php:33
* @route '/admin/entradas/{instance}'
*/
export const chat = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chat.url(args, options),
    method: 'get',
})

chat.definition = {
    methods: ["get","head"],
    url: '/admin/entradas/{instance}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chat
* @see app/Http/Controllers/Admin/AdminEntradaController.php:33
* @route '/admin/entradas/{instance}'
*/
chat.url = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { instance: args }
    }

    if (Array.isArray(args)) {
        args = {
            instance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        instance: args.instance,
    }

    return chat.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chat
* @see app/Http/Controllers/Admin/AdminEntradaController.php:33
* @route '/admin/entradas/{instance}'
*/
chat.get = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chat.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chat
* @see app/Http/Controllers/Admin/AdminEntradaController.php:33
* @route '/admin/entradas/{instance}'
*/
chat.head = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: chat.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chat
* @see app/Http/Controllers/Admin/AdminEntradaController.php:33
* @route '/admin/entradas/{instance}'
*/
const chatForm = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chat.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chat
* @see app/Http/Controllers/Admin/AdminEntradaController.php:33
* @route '/admin/entradas/{instance}'
*/
chatForm.get = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chat.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chat
* @see app/Http/Controllers/Admin/AdminEntradaController.php:33
* @route '/admin/entradas/{instance}'
*/
chatForm.head = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chat.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

chat.form = chatForm

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chats
* @see app/Http/Controllers/Admin/AdminEntradaController.php:40
* @route '/admin/entradas/{instance}/chats'
*/
export const chats = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chats.url(args, options),
    method: 'get',
})

chats.definition = {
    methods: ["get","head"],
    url: '/admin/entradas/{instance}/chats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chats
* @see app/Http/Controllers/Admin/AdminEntradaController.php:40
* @route '/admin/entradas/{instance}/chats'
*/
chats.url = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { instance: args }
    }

    if (Array.isArray(args)) {
        args = {
            instance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        instance: args.instance,
    }

    return chats.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chats
* @see app/Http/Controllers/Admin/AdminEntradaController.php:40
* @route '/admin/entradas/{instance}/chats'
*/
chats.get = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chats.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chats
* @see app/Http/Controllers/Admin/AdminEntradaController.php:40
* @route '/admin/entradas/{instance}/chats'
*/
chats.head = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: chats.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chats
* @see app/Http/Controllers/Admin/AdminEntradaController.php:40
* @route '/admin/entradas/{instance}/chats'
*/
const chatsForm = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chats.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chats
* @see app/Http/Controllers/Admin/AdminEntradaController.php:40
* @route '/admin/entradas/{instance}/chats'
*/
chatsForm.get = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chats.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::chats
* @see app/Http/Controllers/Admin/AdminEntradaController.php:40
* @route '/admin/entradas/{instance}/chats'
*/
chatsForm.head = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chats.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

chats.form = chatsForm

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::messages
* @see app/Http/Controllers/Admin/AdminEntradaController.php:70
* @route '/admin/entradas/{instance}/messages'
*/
export const messages = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/admin/entradas/{instance}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::messages
* @see app/Http/Controllers/Admin/AdminEntradaController.php:70
* @route '/admin/entradas/{instance}/messages'
*/
messages.url = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { instance: args }
    }

    if (Array.isArray(args)) {
        args = {
            instance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        instance: args.instance,
    }

    return messages.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::messages
* @see app/Http/Controllers/Admin/AdminEntradaController.php:70
* @route '/admin/entradas/{instance}/messages'
*/
messages.get = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::messages
* @see app/Http/Controllers/Admin/AdminEntradaController.php:70
* @route '/admin/entradas/{instance}/messages'
*/
messages.head = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::messages
* @see app/Http/Controllers/Admin/AdminEntradaController.php:70
* @route '/admin/entradas/{instance}/messages'
*/
const messagesForm = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: messages.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::messages
* @see app/Http/Controllers/Admin/AdminEntradaController.php:70
* @route '/admin/entradas/{instance}/messages'
*/
messagesForm.get = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: messages.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::messages
* @see app/Http/Controllers/Admin/AdminEntradaController.php:70
* @route '/admin/entradas/{instance}/messages'
*/
messagesForm.head = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: messages.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

messages.form = messagesForm

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::send
* @see app/Http/Controllers/Admin/AdminEntradaController.php:123
* @route '/admin/entradas/{instance}/send'
*/
export const send = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/admin/entradas/{instance}/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::send
* @see app/Http/Controllers/Admin/AdminEntradaController.php:123
* @route '/admin/entradas/{instance}/send'
*/
send.url = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { instance: args }
    }

    if (Array.isArray(args)) {
        args = {
            instance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        instance: args.instance,
    }

    return send.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::send
* @see app/Http/Controllers/Admin/AdminEntradaController.php:123
* @route '/admin/entradas/{instance}/send'
*/
send.post = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::send
* @see app/Http/Controllers/Admin/AdminEntradaController.php:123
* @route '/admin/entradas/{instance}/send'
*/
const sendForm = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::send
* @see app/Http/Controllers/Admin/AdminEntradaController.php:123
* @route '/admin/entradas/{instance}/send'
*/
sendForm.post = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(args, options),
    method: 'post',
})

send.form = sendForm

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::reaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
export const reaction = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reaction.url(args, options),
    method: 'post',
})

reaction.definition = {
    methods: ["post"],
    url: '/admin/entradas/{instance}/reaction',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::reaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
reaction.url = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { instance: args }
    }

    if (Array.isArray(args)) {
        args = {
            instance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        instance: args.instance,
    }

    return reaction.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::reaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
reaction.post = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reaction.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::reaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
const reactionForm = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reaction.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::reaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
reactionForm.post = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reaction.url(args, options),
    method: 'post',
})

reaction.form = reactionForm

const entradas = {
    chat: Object.assign(chat, chat),
    chats: Object.assign(chats, chats),
    messages: Object.assign(messages, messages4ba6e9),
    send: Object.assign(send, send),
    reaction: Object.assign(reaction, reaction),
    conversations: Object.assign(conversations, conversations),
}

export default entradas