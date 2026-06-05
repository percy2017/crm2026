import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\LinkPreviewController::preview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
export const preview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(options),
    method: 'get',
})

preview.definition = {
    methods: ["get","head"],
    url: '/api/link-preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::preview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::preview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
preview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::preview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
preview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::preview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::preview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
previewForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\LinkPreviewController::preview
* @see app/Http/Controllers/Api/LinkPreviewController.php:13
* @route '/api/link-preview'
*/
previewForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

preview.form = previewForm

const LinkPreviewController = { preview }

export default LinkPreviewController