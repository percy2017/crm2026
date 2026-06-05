import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import webhooks from './webhooks'
/**
* @see \App\Http\Controllers\Api\LinkPreviewController::linkPreview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
export const linkPreview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: linkPreview.url(options),
    method: 'get',
})

linkPreview.definition = {
    methods: ["get","head"],
    url: '/api/link-preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::linkPreview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
linkPreview.url = (options?: RouteQueryOptions) => {
    return linkPreview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::linkPreview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
linkPreview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: linkPreview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::linkPreview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
linkPreview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: linkPreview.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::linkPreview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
const linkPreviewForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: linkPreview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::linkPreview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
linkPreviewForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: linkPreview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::linkPreview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
linkPreviewForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: linkPreview.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

linkPreview.form = linkPreviewForm

const api = {
    webhooks: Object.assign(webhooks, webhooks),
    linkPreview: Object.assign(linkPreview, linkPreview),
}

export default api