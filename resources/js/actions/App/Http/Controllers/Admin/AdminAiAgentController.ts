import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminAiAgentController::chat
* @see app/Http/Controllers/Admin/AdminAiAgentController.php:13
* @route '/admin/ai-agent/chat'
*/
export const chat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

chat.definition = {
    methods: ["post"],
    url: '/admin/ai-agent/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminAiAgentController::chat
* @see app/Http/Controllers/Admin/AdminAiAgentController.php:13
* @route '/admin/ai-agent/chat'
*/
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAiAgentController::chat
* @see app/Http/Controllers/Admin/AdminAiAgentController.php:13
* @route '/admin/ai-agent/chat'
*/
chat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminAiAgentController::chat
* @see app/Http/Controllers/Admin/AdminAiAgentController.php:13
* @route '/admin/ai-agent/chat'
*/
const chatForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminAiAgentController::chat
* @see app/Http/Controllers/Admin/AdminAiAgentController.php:13
* @route '/admin/ai-agent/chat'
*/
chatForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chat.url(options),
    method: 'post',
})

chat.form = chatForm

const AdminAiAgentController = { chat }

export default AdminAiAgentController