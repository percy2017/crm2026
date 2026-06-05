import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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
* @see \App\Http\Controllers\Admin\AdminEntradaController::sendReaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
export const sendReaction = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendReaction.url(args, options),
    method: 'post',
})

sendReaction.definition = {
    methods: ["post"],
    url: '/admin/entradas/{instance}/reaction',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::sendReaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
sendReaction.url = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return sendReaction.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::sendReaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
sendReaction.post = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendReaction.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::sendReaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
const sendReactionForm = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendReaction.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::sendReaction
* @see app/Http/Controllers/Admin/AdminEntradaController.php:252
* @route '/admin/entradas/{instance}/reaction'
*/
sendReactionForm.post = (args: { instance: string | number } | [instance: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendReaction.url(args, options),
    method: 'post',
})

sendReaction.form = sendReactionForm

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyConversation
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
export const destroyConversation = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyConversation.url(args, options),
    method: 'delete',
})

destroyConversation.definition = {
    methods: ["delete"],
    url: '/admin/entradas/{instance}/conversations/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyConversation
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
destroyConversation.url = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return destroyConversation.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyConversation
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
destroyConversation.delete = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyConversation.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyConversation
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
const destroyConversationForm = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyConversation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyConversation
* @see app/Http/Controllers/Admin/AdminEntradaController.php:329
* @route '/admin/entradas/{instance}/conversations/{conversation}'
*/
destroyConversationForm.delete = (args: { instance: string | number, conversation: number | { id: number } } | [instance: string | number, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyConversation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyConversation.form = destroyConversationForm

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyMessage
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
export const destroyMessage = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyMessage.url(args, options),
    method: 'delete',
})

destroyMessage.definition = {
    methods: ["delete"],
    url: '/admin/entradas/{instance}/messages/{message}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyMessage
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
destroyMessage.url = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return destroyMessage.definition.url
            .replace('{instance}', parsedArgs.instance.toString())
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyMessage
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
destroyMessage.delete = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyMessage.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyMessage
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
const destroyMessageForm = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyMessage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminEntradaController::destroyMessage
* @see app/Http/Controllers/Admin/AdminEntradaController.php:341
* @route '/admin/entradas/{instance}/messages/{message}'
*/
destroyMessageForm.delete = (args: { instance: string | number, message: number | { id: number } } | [instance: string | number, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyMessage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyMessage.form = destroyMessageForm

const AdminEntradaController = { chat, chats, messages, send, sendReaction, destroyConversation, destroyMessage }

export default AdminEntradaController