import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import users from './users'
import roles from './roles'
import deals from './deals'
import pipelineStages from './pipeline-stages'
import inboxes from './inboxes'
import entradas from './entradas'
import media from './media'
import cronJobs from './cron-jobs'
import quickReplies from './quick-replies'
import woocommerce from './woocommerce'
import aiAgent from './ai-agent'
import contacts from './contacts'
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
* @see app/Http/Controllers/Admin/AdminDashboardController.php:17
* @route '/admin'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
* @see app/Http/Controllers/Admin/AdminDashboardController.php:17
* @route '/admin'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
* @see app/Http/Controllers/Admin/AdminDashboardController.php:17
* @route '/admin'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
* @see app/Http/Controllers/Admin/AdminDashboardController.php:17
* @route '/admin'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
* @see app/Http/Controllers/Admin/AdminDashboardController.php:17
* @route '/admin'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
* @see app/Http/Controllers/Admin/AdminDashboardController.php:17
* @route '/admin'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
* @see app/Http/Controllers/Admin/AdminDashboardController.php:17
* @route '/admin'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::dashboardData
* @see app/Http/Controllers/Admin/AdminDashboardController.php:22
* @route '/admin/dashboard-data'
*/
export const dashboardData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboardData.url(options),
    method: 'get',
})

dashboardData.definition = {
    methods: ["get","head"],
    url: '/admin/dashboard-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::dashboardData
* @see app/Http/Controllers/Admin/AdminDashboardController.php:22
* @route '/admin/dashboard-data'
*/
dashboardData.url = (options?: RouteQueryOptions) => {
    return dashboardData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::dashboardData
* @see app/Http/Controllers/Admin/AdminDashboardController.php:22
* @route '/admin/dashboard-data'
*/
dashboardData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboardData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::dashboardData
* @see app/Http/Controllers/Admin/AdminDashboardController.php:22
* @route '/admin/dashboard-data'
*/
dashboardData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboardData.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::dashboardData
* @see app/Http/Controllers/Admin/AdminDashboardController.php:22
* @route '/admin/dashboard-data'
*/
const dashboardDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboardData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::dashboardData
* @see app/Http/Controllers/Admin/AdminDashboardController.php:22
* @route '/admin/dashboard-data'
*/
dashboardDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboardData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::dashboardData
* @see app/Http/Controllers/Admin/AdminDashboardController.php:22
* @route '/admin/dashboard-data'
*/
dashboardDataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboardData.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboardData.form = dashboardDataForm

const admin = {
    index: Object.assign(index, index),
    dashboardData: Object.assign(dashboardData, dashboardData),
    users: Object.assign(users, users),
    roles: Object.assign(roles, roles),
    deals: Object.assign(deals, deals),
    pipelineStages: Object.assign(pipelineStages, pipelineStages),
    inboxes: Object.assign(inboxes, inboxes),
    entradas: Object.assign(entradas, entradas),
    media: Object.assign(media, media),
    cronJobs: Object.assign(cronJobs, cronJobs),
    quickReplies: Object.assign(quickReplies, quickReplies),
    woocommerce: Object.assign(woocommerce, woocommerce),
    aiAgent: Object.assign(aiAgent, aiAgent),
    contacts: Object.assign(contacts, contacts),
}

export default admin