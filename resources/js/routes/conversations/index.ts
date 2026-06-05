import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\WidgetController::create
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/widget/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\WidgetController::create
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WidgetController::create
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::create
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WidgetController::create
* @see app/Http/Controllers/Web/WidgetController.php:130
* @route '/api/widget/conversations'
*/
createForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: create.url(options),
    method: 'post',
})

create.form = createForm

const conversations = {
    create: Object.assign(create, create),
}

export default conversations