import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

register.form = registerForm

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
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

home.form = homeForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/reverb-monitor'
*/
export const reverbMonitor = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reverbMonitor.url(options),
    method: 'get',
})

reverbMonitor.definition = {
    methods: ["get","head"],
    url: '/reverb-monitor',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/reverb-monitor'
*/
reverbMonitor.url = (options?: RouteQueryOptions) => {
    return reverbMonitor.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/reverb-monitor'
*/
reverbMonitor.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reverbMonitor.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/reverb-monitor'
*/
reverbMonitor.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reverbMonitor.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/reverb-monitor'
*/
const reverbMonitorForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reverbMonitor.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/reverb-monitor'
*/
reverbMonitorForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reverbMonitor.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/reverb-monitor'
*/
reverbMonitorForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reverbMonitor.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

reverbMonitor.form = reverbMonitorForm
