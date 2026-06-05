# AGENTS.md

## Tech Stack

- **Backend**: Laravel 13 (PHP ^8.3)
- **Frontend**: Inertia 3 + React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`), class-variance-authority, tailwind-merge, tw-animate-css
- **DB**: SQLite for testing (`:memory:`), migrations-based; production config in `config/database.php`
- **Auth**: Laravel Fortify + Laravel Passkeys
- **Real-time**: Laravel Reverb (WebSocket) via PM2 (`ecosystem.config.cjs`) — uses `/usr/bin/php8.4` explicitly
- **External APIs**: Evolution API (WhatsApp), WooCommerce (via `codexshaper/laravel-woocommerce`)
- **Permissions**: spatie/laravel-permission (`config/permission.php`)

## Commands

```bash
# Dev (runs server + queue + logs + Vite concurrently)
composer dev

# Full CI check (lint → format → typecheck → test)
composer ci:check

# Test (config:clear → lint → test)
composer test

# Single test file
php artisan test --filter=SomeTest tests/Feature/SomeTest.php

# Lint PHP
composer lint          # fix
composer lint:check    # check only

# JS/TS lint
npm run lint           # fix (ESLint)
npm run lint:check     # check only

# Format (Prettier on resources/)
npm run format         # fix
npm run format:check   # check only

# TypeScript check
npm run types:check    # tsc --noEmit

# Build (Vite)
npm run build
npm run build:ssr      # SSR build

# Setup fresh project
composer setup
```

## Testing quirks

- Uses **Pest PHP 4** (not PHPUnit directly), with `pestphp/pest-plugin-laravel` and `pestphp/pest-plugin-browser`
- Three test suites: Unit, Feature, Browser (`tests/{Unit,Feature,Browser}/`)
- Tests run against in-memory SQLite — no external DB needed
- Pest test files end in `.php` and use `->assert*()` chain syntax
- Playwright is also available as an npm dependency but not integrated into CI

## Architecture notes

- **Routes**: `routes/web.php` (web), `routes/api.php` (API), `routes/channels.php` (broadcast), `routes/console.php` (artisan commands)
- **Admin routes** are prefixed `/admin`, middleware `['auth', 'verified', 'admin']` — the admin gate is defined in `app/Providers/AppServiceProvider.php` (likely checks `spatie/permission`)
- **Frontend entry**: `resources/js/app.tsx`, aliased as `@/*` in TypeScript paths
- **Wayfinder** (`@laravel/vite-plugin-wayfinder`) generates Type-safe route helpers — run `php artisan wayfinder:generate` after adding/changing routes
- **React Compiler** is enabled via `babel-plugin-react-compiler` in Vite config — strict mode may flag memoization issues
- **Key feature modules**: Inbox (WhatsApp/Evolution), Contacts, Deals/Pipeline, WooCommerce POS, Quick Replies, Media, AI Agent, Roles
- **DataTables**: Uses `yajra/laravel-datatables` for server-side pagination/sorting

## Config files to know

- `.env.example` — copy to `.env` before setup
- `config/evolution.php` — WhatsApp/Evolution API settings
- `config/woocommerce.php` — WooCommerce API keys
- `config/fortify.php` — Auth features
- `config/permission.php` — spatie/laravel-permission
- `config/datatables.php` — Yajra DataTables
- `config/reverb.php` — WebSocket server
- `config/ai.php` — Laravel AI config
- `pint.json` — PHP lint preset (laravel)
- `eslint.config.js` — JS lint config
- `.prettierrc` — Prettier config (Tailwind CSS plugin)
- `components.json` — UI component registry (Radix + shadcn-style)

---

## Sidebar behavior

- **`resources/js/components/nav-main.tsx`**: Solo un menú colapsable puede estar abierto a la vez. Usa `useEffect` para sincronizar `openKey` con `defaultKey` (detecta la URL actual). Cuando navegas a una sección diferente, el menú anterior se cierra automáticamente.

---

## Module: Cron Jobs (Tareas Programadas)

### Architecture

DB-driven scheduling. Un orquestador (`cron:runner`) ejecutado cada minuto desde `routes/console.php` lee la tabla `cron_jobs` y ejecuta los comandos activos según su frecuencia.

### Tables

**`cron_jobs`**: `id`, `name`, `command`, `arguments` (json), `frequency`, `is_active`, `timeout`, `max_runs`, `run_count`, `last_run_at`, `last_result`, `last_output`, timestamps.

**`cron_job_logs`**: `id`, `cron_job_id` (FK), `started_at`, `finished_at`, `result`, `output`, `duration_ms`.

### Frequencies supported

`everyMinute`, `everyFiveMinutes`, `everyTenMinutes`, `everyFifteenMinutes`, `everyThirtyMinutes`, `hourly`, `everyTwoHours`, `everySixHours`, `daily`, `weekly`, `monthly`.

### Routes (all under `auth + verified + admin`)

- `GET /admin/cron-jobs` — Inertia page
- `GET /admin/cron-jobs/list` — JSON list
- `GET /admin/cron-jobs/commands` — available Artisan commands
- `POST /admin/cron-jobs` — create
- `PUT /admin/cron-jobs/{id}` — update
- `DELETE /admin/cron-jobs/{id}` — delete + logs cascade
- `POST /admin/cron-jobs/{id}/toggle` — activate/deactivate
- `POST /admin/cron-jobs/{id}/run` — execute immediately
- `GET /admin/cron-jobs/{id}/logs` — last 50 execution logs

### Real-time behavior

- **None**. No socket events. `cron:runner` runs every minute via Laravel Schedule.

### Key known issues

- **Commands list shows all Artisan commands** including Laravel internals (`migrate`, `cache:clear`, etc.) — only the 8 custom commands should be scheduled from UI
- **Logs capped at 100 per job** — older logs auto-deleted by `cron:runner`

### Key files

- `app/Http/Controllers/Admin/AdminCronJobController.php` — CRUD + run + logs + commands
- `app/Models/CronJob.php`, `app/Models/CronJobLog.php`
- `app/Console/Commands/CronJobRunner.php` — orchestrator
- `app/Console/Commands/InboxHealthCheck.php` — the only pre-existing scheduled command (now also manageable from UI)
- `resources/js/pages/admin/cron-jobs/index.tsx` — full SPA (list, create, edit, run, history drawer)
- `database/migrations/2026_06_04_040000_create_cron_jobs_table.php`

---

## Module: Quick Replies (Respuestas Rápidas)

### Architecture

Simple CRUD with chat integration. No socket events, no real-time sync.

- **Backend**: `AdminQuickReplyController` — 58 lines, 5 methods (`index`, `list`, `store`, `update`, `destroy`)
- **Frontend**: `pages/admin/quick-replies/index.tsx` — CRUD table + create/edit dialogs with file upload
- **Chat integration**: `quick-reply-dropdown.tsx` — `/` trigger → client-side filter → variable substitution → send

### Data model

| Column | Type | Notes |
|--------|------|-------|
| `shortcut` | string(50) | UNIQUE, used with `/` prefix in chat |
| `message` | text/null | Supports `{nombre}`, `{telefono}` variables |
| `media_url` | string/null | Relative path in `storage/app/public/` |
| `media_type` | string(20)/null | image, video, audio, document |

### Chat trigger flow

1. User types `/` in chat input
2. `ChatInputFooter` detects prefix, passes remainder as `quickReplyQuery`
3. `QuickReplyDropdown` fetches ALL replies on mount, filters client-side with `includes()`
4. Selection calls `handleQuickReplySelect` in `chat.tsx`:
   - Replaces `{nombre}` → `contact.name`, `{telefono}` → phone
   - Sets input text (user can edit before send)
   - If `media_url` exists, auto-sends immediately with media

### File upload

- Files uploaded via `FormData` with `file` field (up to 100MB)
- Stored in `storage/app/public/` with UUID prefix
- `media_url` stores relative path only (not full URL)
- Existing file shown as preview (images) or filename badge when editing
- `remove_media=1` signal to delete file on update

### Known issues

- **No categorization/tags** — all replies global, no folders
- **No permissions** — any admin can create/edit/delete any reply
- **Hard delete** — no soft delete, no restore
- **No pagination** — `list()` returns ALL records
- **Client-side filter only** — no backend search
- **Stale data** — dropdown fetches once on mount, never refetches
- **Variables limited** — only `{nombre}` and `{telefono}`, hardcoded
- **No error feedback** — try/catch was silent (fixed: now uses `toast.error()`)
- **No tests** — zero coverage

### Key files

- `app/Http/Controllers/Admin/AdminQuickReplyController.php`
- `app/Models/QuickReply.php`
- `database/migrations/2026_06_04_030000_create_quick_replies_table.php`
- `resources/js/pages/admin/quick-replies/index.tsx`
- `resources/js/components/entradas/quick-reply-dropdown.tsx`
- `resources/js/components/entradas/chat/chat-input-footer.tsx`

---

## Module: Inbox (WhatsApp/Evolution)

### Architecture

Full socket-reactive chat via Laravel Reverb. No polling.

- **Backend**: `EvolutionWebhookController` (webhook), `AdminEntradaController` (chat/send), `EvolutionApiService` (API client)
- **Frontend**: `pages/admin/entradas/chat.tsx` (1069 lines), components in `components/entradas/chat/`
- **Events** (all `ShouldBroadcastNow`):
  - `MessageCreated` → channel `private-entradas.{instance}`, event `.message.created`
  - `MessageStatusUpdated` → channel `private-entradas.{instance}`, event `.message.status.updated`
  - `InboxStatusUpdated` → channels `private-entradas.{instance}` + `private-inboxes.global`, event `.inbox.status.updated`
- **Auth**: `routes/channels.php` — any authenticated user can auth to any instance channel

### Real-time behavior

| Flow | Socket? | Mechanism |
|---|---|---|
| Incoming messages | ✅ Sí | Webhook → `MessageCreated` → Reverb → Echo listener |
| Outgoing messages | ✅ Sí | Send API → `MessageCreated` → Reverb → Echo (replaces temp message) |
| Status updates (sent/delivered/read) | ✅ Sí | Webhook → `MessageStatusUpdated` → Reverb → Echo |
| Connection status | ✅ Sí | Webhook → `InboxStatusUpdated` → Reverb → Echo |
| Unread count | ✅ Sí | Incremented in frontend socket listener (non-selected conversations only) |
| Conversation sorting | ✅ Sí | `sort()` by `last_message.created_at` descending on broadcast |

### Critical known issues

- **Evolution API sendMedia timeout**: `EvolutionApiService::sendMedia()` sends base64 (not URL). Evolution processes it without downloading from CRM. If it still fails, it's an Evolution-side issue (body parser limit, instance problem).
- **No granular permission checks per-instance**: Any admin can listen to any instance channel.
- **media_url normalization**: `AdminEntradaController::send()` must strip the storage URL prefix before saving to DB. Uses `normalizeMediaUrl()` helper. The `EvolutionApiService::sendMedia()` also handles both relative paths and full URLs.

### Print ticket fix (POS)

- `resources/js/pages/admin/woocommerce/pos.tsx` — replaced `Blob` + `URL.createObjectURL()` with `window.open('')` + `document.write()` to avoid Chrome's `TrustedScript` block on print tickets.

### Key files

- `app/Http/Controllers/Admin/AdminEntradaController.php` — send message, reactions, fetch chats/messages
- `app/Http/Controllers/Admin/InboxCrudController.php` — CRUD inbox instances
- `app/Http/Controllers/Webhooks/EvolutionWebhookController.php` — handles 34 event types from Evolution
- `app/Services/EvolutionApiService.php` — HTTP client to Evolution API (all calls use `->timeout(0)`)
- `app/Events/MessageCreated.php`, `MessageStatusUpdated.php`, `InboxStatusUpdated.php`
- `app/Models/{Inbox,Conversation,Message,EvolutionWebhook}.php`
- `resources/js/pages/admin/entradas/chat.tsx` — main chat SPA
- `resources/js/components/entradas/chat/` — 6 subcomponents (conversation list, header, input, bubble, sidebar, etc.)

---

## Module: WooCommerce POS

### Architecture

Simple proxy: reads from WooCommerce API, writes via `codexshaper/laravel-woocommerce` package. All logic in a single controller (585+ lines). No service layer.

### Routes (all under `auth + verified + admin`)

- `GET /admin/woocommerce` — dashboard
- `GET /admin/woocommerce/pos` — POS main page (loads categories + payment gateways)
- `POST /admin/woocommerce/pos/order` — create order
- `GET /admin/woocommerce/pos/contacts` — search CRM contacts
- `GET /admin/woocommerce/pos/recent-orders` — last 10 orders
- `GET /admin/woocommerce/products` — product listing (paginated, filterable)
- `GET /admin/woocommerce/products/{id}` — product detail
- `GET /admin/woocommerce/products/{id}/variations` — product variations
- `GET /admin/woocommerce/orders` — order listing
- `GET /admin/woocommerce/orders/{id}` — order detail
- `DELETE /admin/woocommerce/orders/{id}` — force delete order
- `GET /admin/woocommerce/subscriptions/calendar` — subscription calendar view

### POS checkout flow

1. Product grid (search, category filter, pagination)
2. Cart panel (quantity, inline price editing, line items)
3. Customer search (CRM contacts, max 20 results)
4. Coupon codes (client-side only — no server-side discount calculation)
5. Sale type toggle: Direct / Subscription
6. Purchase date override
7. Payment method selector (from WC enabled gateways)
8. Order creation → stores `_contact_id`, `_contact_name`, `_contact_email`, `_contact_phone`, `_sale_date`, `_tvp_terminal`, `_tvp_vendedor` in `meta_data`

### HPOS (High-Performance Order Storage)

WooCommerce uses HPOS. Data lives in custom tables (not `wp_posts`):
- `wp_{prefix}_wc_orders` — main order records
- `wp_{prefix}_wc_orders_meta` — order metadata (contact_id, etc.)
- `wp_{prefix}_wc_order_addresses` — billing/shipping addresses

### Known issues

- **No server-side price validation**: Client sends prices, server trusts them — vulnerability
- **`/admin/woocommerce/products` Inertia page missing**: PHP renders but React page `admin/woocommerce/products/index` doesn't exist (500 error)
- **`/admin/woocommerce/customers` is dead**: Referenced from dashboard but no route or page
- **No tests**: Zero test coverage for WooCommerce module
- **No granular permissions**: Any admin can delete any order
- **Coupons are cosmetic**: Collected and sent but no discount calculated (client nor server)
- `billing.email` fallback: if invalid/empty → `{phone}@whatsapp.placeholder` else `cliente@tienda.local`

### Key files

- `app/Http/Controllers/Admin/AdminWooCommerceController.php` — all WooCommerce endpoints
- `config/woocommerce.php` — API credentials (store_url, consumer_key, consumer_secret)
- `resources/js/pages/admin/woocommerce/pos.tsx` — POS main page
- `resources/js/pages/admin/woocommerce/orders/index.tsx` — order listing + detail sheet
- `resources/js/pages/admin/woocommerce/subscriptions/calendar.tsx` — subscription calendar
- `resources/js/components/woocommerce/pos/` — 6 POS components (product-grid, product-card, cart-panel, variation-selector, customer-search, recent-orders-bar)
- `resources/js/types/woocommerce.ts` — WooCommerce type definitions