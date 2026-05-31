# AGENTS.md

## Stack

- **PHP 8.4+**, Laravel 13, SQLite (or MySQL), nginx
- **React 19**, Inertia 3, Tailwind 4, TypeScript
- Auth: Laravel Fortify (login/register/2FA/passkeys)
- Realtime: Laravel Reverb (WebSocket, port 2002) via PM2
- Frontend build: Vite 8, Rolldown
- **AI**: Laravel AI SDK v0.7, Ollama (local LLM provider)
- **Roles/Permissions**: Spatie `laravel-permission` v8 (`roles`, `permissions`, `model_has_roles`, etc.)

## Key commands

| Action | Command |
|---|---|
| Dev servers | `composer dev` (PHP server + queue + logs + Vite concurrently) |
| Build frontend | `npm run build` |
| Type check | `npm run types:check` (`tsc --noEmit`) |
| Lint PHP | `composer lint` (pint) / `composer lint:check` (pint --test) |
| Lint JS/TS | `npm run lint` (eslint) / `npm run format` (prettier) |
| Test | `composer test` (pint check + artisan test) or `./vendor/bin/pest` |
| CI check | `composer ci:check` (lint + format + types + test) |
| Reverb | `pm2 start ecosystem.config.cjs` / `pm2 restart reverb` |
| Migrate | `php artisan migrate` |
| Seed test data | `php artisan db:seed --class=EntradasTestSeeder` / `php artisan db:seed --class=WebWidgetSeeder` |

## Architecture

- **All pages are Inertia pages** in `resources/js/pages/`. Route → page name mapping in `routes/web.php`.
- **Wayfinder** generates `resources/js/routes/` and `resources/js/actions/` (gitignored). After adding a named route, regenerate with `php artisan wayfinder:generate`.
- **`@/`** maps to `resources/js/` (tsconfig paths).
- **Layouts** auto-assigned by page name in `resources/js/app.tsx`: `welcome` → none, `auth/*` → AuthLayout, `settings/*` → AppLayout+SettingsLayout, rest → AppLayout.
- **Sidebar menu** defined in `resources/js/components/app-sidebar.tsx` as `NavItem[]`.
- **`.npmrc`** has `ignore-scripts=true` — npm install won't run build hooks.
- **`package.json`** has `"type": "module"` — CommonJS config files need `.cjs` extension (e.g. `ecosystem.config.cjs`).
- **`ecosystem.config.example.cjs`** — example PM2 config; copy to `ecosystem.config.cjs` and adjust `interpreter` path if needed.
- **CSRF token**: `<meta name="csrf-token">` added to `resources/views/app.blade.php` for manual fetch requests.
- **Only native Laravel route files**: `web.php`, `api.php`, `console.php`, `channels.php` (no custom `require` files).

## Environment quirks

- `.env` uses **SQLite** by default (`DB_CONNECTION=sqlite`). Also supports MySQL.
- If your system has multiple PHP versions, use the `php8.4` binary for artisan commands.
- Reverb runs on port **2002** (configurable via `REVERB_SERVER_PORT`). nginx proxies `/app` to the Reverb server.
- Echo + Pusher JS for frontend WebSocket client. Pusher client needs `cluster` option even with Reverb.
- Reverb requires `pcntl` extension. Ensure `pcntl_*` functions are NOT in `disable_functions` in your PHP CLI php.ini.
- **nginx for `pos.local`**: proxies `/api/*` to `php artisan serve` (port 8000), everything else to Vite (port 5003). If API routes return 404, check nginx config has the `/api` location block.

## Module Relationships (diagram)

```
Evolution API (WhatsApp)
    │
    ├── Webhooks ──→ EvolutionWebhooks (raw log)
    │   └── messages.upsert ──→ Contact (upsert by phone)
    │                           └── Conversation (firstOrCreate by channel_id)
    │                               └── Message (create with text/media)
    │
    └── REST API (fetchInstances, sendText, sendMedia, etc.)
        │
        ├── Entradas Chat UI
        │   ├── GET /{instance}/chats    → conversations + contacts + messages (local)
        │   ├── GET /{instance}/messages → messages (local)
        │   └── POST /{instance}/send    → Evolution API + Message::create (local)
        │
        ├── Medios (file upload)
        │   └── POST /media/upload → storage/app/public/
        │       └── Used by Entradas and AI Agent for attach/audio send
        │
        └── Contacts Import
            └── scanInstances → findContacts → importBatch → Contact::create

AI Agent (Ollama)
    │
    ├── CrmAgent ──→ instructions() from config/env
    ├── Floating Button ──→ AppLayout (all admin pages)
    └── Chat Panel ──→ Sheet with file/audio/text input
        └── POST /admin/ai-agent/chat ──→ Ollama via AI SDK
            └── Attachments uploaded via Medios

Deals (Pipeline CRM)
    │
    ├── AdminDealController (CRUD + moveStage)
    ├── AdminPipelineStageController (manage stages)
    ├── Kanban Board (drag & drop, configurable stages)
    ├── Table View (Yajra DataTable)
    └── Manage Stages Dialog (add/edit/delete/reorder)

Web Widgets (Live Chat Widget)
    │
    ├── Public JS widget (embedded in external sites)
    │   └── GET /api/widget/config → domain lookup → widget settings
    │   └── POST /api/widget/visitor → register/update visitor
    │   └── POST /api/widget/conversations → create conversation + first message
    │   └── POST /api/widget/messages → send message
    │   └── GET /api/widget/conversations → poll for new messages
    │
    ├── WidgetCors middleware ──→ handles CORS for cross-origin embed
    │
    └── Admin Web Chat
        ├── GET /admin/web-chat → Inertia page
        ├── GET /admin/web-chat/conversations → list all conversations
        ├── GET /admin/web-chat/conversations/{id}/messages → fetch messages
        ├── POST /admin/web-chat/conversations/{id}/send → agent reply
        ├── POST /admin/web-chat/conversations/{id}/assign → assign to user
        └── POST /admin/web-chat/conversations/{id}/close → close conversation
```

## Modules

### 1. Reverb (WebSocket / Realtime)
- **Stack**: Laravel Reverb, port **2002**, managed via PM2 (`ecosystem.config.cjs`)
- **Frontend**: Echo + Pusher JS client (needs `cluster` option even with Reverb)
- **Page**: `/reverb-monitor` → `resources/js/pages/reverb-monitor.tsx`
- **nginx**: proxies `/app` to `0.0.0.0:2002`
- **Commands**: `pm2 restart reverb`, `pm2 start ecosystem.config.cjs`

### 2. Evolution Instances (Admin read-only dashboard)
- **Route**: `/admin/evolution-instances` → `AdminEvolutionInstanceController`
- **Service**: `app/Services/EvolutionApiService.php` — HTTP client wrapping Evolution API
- **Config**: `config/evolution.php` — reads `EVOLUTION_SERVER_URL` and `EVOLUTION_API_KEY` from `.env`
- **Page**: `resources/js/pages/admin/evolution-instances/index.tsx` — cards grid with status badge, profile pic, stats + webhook log tab
- **No DB** — data fetched live from Evolution API
- **Sidebar**: "Evolution API" inside Configuración submenu

### 3. Evolution Webhooks (receiver + processor)
- **Route**: `POST /webhooks/evolution` → `api.php`
- **Controller**: `app/Http/Controllers/Webhooks/EvolutionWebhookController.php`
- **Model**: `EvolutionWebhook` — raw log (`instance`, `event`, `payload` JSON)
- **Behavior**:
  - Stores ALL incoming webhooks in `evolution_webhooks` table (raw audit trail)
  - Filters: processes only `messages.upsert` events
  - Skips: `status@broadcast` (stories), empty message content (delivery receipts)
  - On valid `messages.upsert`:
    1. Extracts `remoteJid`, `pushName`, `key.fromMe`, `messageType`, text/media
    2. **Contact**: `updateOrCreate(['phone' => $phone])` — centralized in `contacts` table
    3. **Conversation**: `firstOrCreate(['channel_id' => $remoteJid])` — links contact_id + instance
    4. **Message**: `Message::create()` — saves text, media_url, input_output flag
    5. **Media**: downloads Evolution API URLs to `storage/app/public/` (same as Medios)

### 4. Contacts (Admin CRUD + sync center)
- **Route prefix**: `/admin/contacts` → `AdminContactController`
- **Model**: `app/Models/Contact` (central contact repository for ALL channels)
  - Fields: `name`, `phone`, `whatsapp_id`, `email`, `notes`, `profile_pic_url`, `is_active`, `country`, `type` (individual/group), `instance`, `group_jids`, `participant_count`, `is_community`, `owner`, `last_synced_at`, `is_business`, `wa_status`, `description`, `website`
  - `detectCountry()` uses `giggsey/libphonenumber-for-php`
  - auto-detecta `country` en `saving` event
  - Scopes: `individuals()`, `groups()`; Query builders: `groupContacts()`, `members()`
- **DataTable (Yajra)**: `app/DataTables/ContactsDataTable.php`
- **Import flow**: `scanInstances` → `findContacts` (Evolution API) → `importBatch` → `Contact::create`
- **Key rule**: ALL contacts are centralized here — webhooks, import, and manual create all use the same `Contact` model
- **Sidebar**: "Contacts" (BookUser icon) in `mainNavItems`

### 5. Medios (File manager, no DB)
- **Route prefix**: `/admin/media` → `AdminMediaController`
- **Storage**: `storage/app/public/` flat root (UUID filenames)
- **Frontend**: `resources/js/pages/admin/media/index.tsx` — cards grid, infinite scroll, Sheet preview
- **Used by**: Entradas chat for file/audio attachment upload before sending via Evolution API
- **Sidebar**: "Medios" (Images icon) in `mainNavItems`

### 6. Conversations + Messages (local chat storage)
- **No DB tables** — data fetched live from Evolution API (deprecated, but code kept for reference)

#### `conversations` table
| Column | Type | Notes |
|---|---|---|
| `id` | bigIncrements | PK |
| `channel_id` | string unique | remoteJid (`591xxx@s.whatsapp.net`) |
| `contact_id` | bigint FK → contacts | link to Contact |
| `instance` | string nullable | `entel1`, `tigo1`, etc |
| `timestamps` | | created_at, updated_at |

#### `messages` table
| Column | Type | Notes |
|---|---|---|
| `id` | bigIncrements | PK |
| `channel_id` | string index | remoteJid |
| `input_output` | boolean | true=entrada, false=salida |
| `message_type` | string nullable | `conversation`, `imageMessage`, `audioMessage`, `documentMessage`, `extendedTextMessage` |
| `text` | text nullable | caption or conversation text |
| `media_url` | string nullable | filename in `storage/app/public/` (Medios root) |
| `timestamps` | | created_at, updated_at |

- **Message rendering**: `audioMessage` → `<audio>` player, `imageMessage` → `<img>`, others → download link
- **No `message_id`, `data` (JSON), `source`, `timestamp` epoch** — intentionally minimal and channel-agnostic

### 7. Entradas (WhatsApp Chat UI)
- **Route prefix**: `/admin/entradas/{instance}` → `AdminEntradaController`
- **Service**: `EvolutionApiService` (sendText, sendMedia)
- **Chat page**: `resources/js/pages/admin/entradas/chat.tsx` — split layout:
  - Left: conversation list (searchable, ordered by last message)
  - Right: messages + send input with attach/audio/text
- **Endpoints**:
  - `GET /{instance}` → Inertia page
  - `GET /{instance}/chats` → JSON: conversations with contact info + last message
  - `GET /{instance}/messages?channel_id=...` → JSON: messages for a channel
  - `POST /{instance}/send` → accepts `number`, `text`, `channel_id`, `media_url`, `media_type`, `media_mimetype`, `file_name`
    - If `media_url` present → `sendMedia()` (Evolution API) → saves local Message
    - If text only → `sendText()` (Evolution API) → saves local Message
- **File/audio send**:
  1. User picks file or records audio
  2. Uploads to Medios (`POST /admin/media/upload`) → gets filename
  3. Calls `POST /{instance}/send` with `media_url` = filename from Medios
  4. Backend calls `sendMedia()` with public URL (`asset('storage/'.$filename)`)
  5. Evolution API downloads from the URL and sends to WhatsApp
- **Sidebar**: "Entradas" → dynamic submenus per instance (loaded from shared `evolutionInstances` prop)
- **Shared prop**: `HandleInertiaRequests` shares `evolutionInstances` globally

### 8. Evolution API Service
- **File**: `app/Services/EvolutionApiService.php`
- **Methods**:
  - `fetchInstances()` — `GET /instance/fetchInstances`
  - `fetchProfile(instance, number)` — `POST /chat/fetchProfile`
  - `fetchProfilePictureUrl()` — `POST /chat/fetchProfilePictureUrl`
  - `fetchBusinessProfile()` — `POST /chat/fetchBusinessProfile`
  - `whatsappNumbers()` — `POST /chat/whatsappNumbers`
  - `findContacts(instance)` — `POST /chat/findContacts`
  - `fetchChats(instance)` — `GET /chat/findChats` (deprecated for Entradas, now uses local tables)
  - `fetchMessages(instance, remoteJid, limit)` — `POST /chat/fetchMessages` (deprecated for Entradas)
  - `sendText(instance, number, text)` — `POST /message/sendText`
  - `sendMedia(instance, number, mediaType, mediaUrl, mimetype, caption?, fileName?)` — `POST /message/sendMedia`
  - `fetchGroups(instance)` — `GET /group/fetchAllGroups`

### 9. Users (Admin CRUD)
- **Route prefix**: `/admin/users` → `AdminUserController`
- **DataTable (yajra)**: `app/DataTables/UsersDataTable.php`
- **Sidebar**: "Users" inside Configuración
- **Auth guard**: `admin` role via Spatie; shared prop `auth.can.access_admin`

### 10. Roles (Admin CRUD)
- **Route prefix**: `/admin/roles` → `AdminRoleController`
- **DataTable (Yajra)**: `app/DataTables/RolesDataTable.php` — includes `users_count`
- **Page**: `resources/js/pages/admin/roles/index.tsx` — DataTable list + read-only Sheet for details + Dialog for create/edit
- **Blade partial**: `resources/views/admin/roles/actions.blade.php` — DataTable action buttons
- **Protected role**: `admin` role cannot be modified or deleted
- **Sidebar**: "Roles" inside Configuración with `ShieldCheck` icon

### 11. WooCommerce (POS + Orders + Products + Calendar)
- **Controller**: `app/Http/Controllers/Admin/AdminWooCommerceController.php`
- **All routes** in `routes/web.php` under `/admin/woocommerce/*`
- **WooCommerce API** via `codexshaper/laravel-woocommerce` facade (`Order`, `Product`, `Customer`, etc.)
- **Important**: WooCommerce REST API returns `stdClass`, not arrays — cast to `(array)` before `$obj['key']` access in PHP 8+
- **POS** (`/admin/woocommerce/pos` → `resources/js/pages/admin/woocommerce/pos.tsx`):
  - Full-featured POS with variable products, coupons, subscription sale type
  - Sale type toggle (Directa / Suscripción) with manual title + end date
  - Subscription data stored as WooCommerce order meta (`_is_pos_subscription`, `_subscription_title`, `_subscription_end_date`, `_subscription_start_date`)
  - Contact image via `_contact_id` WooCommerce meta → resolved from local `Contact` model
  - Print ticket: uses `Blob` + `URL.createObjectURL` (not `document.write`) to avoid TrustedScript errors
  - Calendar button + Dashboard button in product grid filters area
- **Products** (`/admin/woocommerce/products` → `resources/js/pages/admin/woocommerce/products/index.tsx`):
  - Table rows clickable → opens Sheet sidebar with product details (image, price, stock, categories, brands, tags, attributes, variations, delete)
  - Read-only (no create/edit buttons), No page heading
  - JSON endpoint: `GET /admin/woocommerce/products/{id}`
- **Orders** (`/admin/woocommerce/orders` → `resources/js/pages/admin/woocommerce/orders/index.tsx`):
  - Table rows clickable → opens Sheet sidebar with order details (billing, shipping, products, coupons, notes, subscription meta)
  - Customer avatar shown in billing section (not header), Delete button with ConfirmDialog
  - No page heading, No separate show page
  - JSON endpoint: `GET /admin/woocommerce/orders/{id}`, `DELETE /admin/woocommerce/orders/{id}`
- **Calendar** (`/admin/woocommerce/subscriptions/calendar` → `resources/js/pages/admin/woocommerce/subscriptions/calendar.tsx`):
  - FullCalendar dayGridMonth, Event click opens Sheet with order details
  - Customer avatar shown in Cliente section (not header), JSON endpoint: `GET /admin/woocommerce/subscriptions/calendar-data`
- **Dashboard** (`/admin/woocommerce` → `resources/js/pages/admin/woocommerce/index.tsx`):
  - Stats cards, No page heading
- **Customers**: Removed entirely
- **Sidebar**: WooCommerce section with POS, Products, Orders (no Dashboard child)
- **No local DB tables** — all data via WooCommerce REST API

## WooCommerce Key Conventions

- `formatOrder()` helper always casts `(array)` before array access on stdClass
- Subscription metadata: `_is_pos_subscription`, `_subscription_title`, `_subscription_end_date`, `_subscription_start_date`
- Contact photo: stored as `_contact_id` meta, resolved via `Contact` model `profile_pic_url`
- No Inertia page for show views — all detail viewing via Sheet sidebars fetched client-side with `fetch()`
- Delete operations use `fetch()` with `DELETE` method + `X-CSRF-TOKEN` header (not Inertia `router.delete()`)
- `Customer` facade no longer imported (customers removed)

### 12. Deals (Pipeline CRM)
- **Route prefix**: `/admin/deals` → `AdminDealController`
- **Controller**: `app/Http/Controllers/Admin/AdminDealController.php` (CRUD + moveStage)
- **Stage management**: `app/Http/Controllers/Admin/AdminPipelineStageController.php` (index, store, update, destroy, reorder)
- **Models**: `Pipeline`, `PipelineStage`, `Deal` (softDeletes)
- **DataTable (Yajra)**: `app/DataTables/DealsDataTable.php` — includes contact_name, stage_name, assigned_name
- **Defaults**:
  - Single pipeline "Sales Pipeline" seeded with 5 stages: Nuevo, Cotizado, Negociación, Ganado, Perdido
  - Colors: gray, amber, blue, green, red
- **Page**: `resources/js/pages/admin/deals/index.tsx` — toggle between Kanban and Table views
- **Components**:
  - `kanban-board.tsx` — drag & drop columns via `@hello-pangea/dnd`
  - `deal-card.tsx` — card with title, value, contact avatar, probability
  - `deal-form-dialog.tsx` — create/edit dialog
  - `deal-detail-sheet.tsx` — read-only detail sheet
  - `manage-stages-dialog.tsx` — add/edit/delete/reorder stages
- **Views**: Kanban (default, 5 columns with droppable zones) and Table (Yajra DataTable, sortable/searchable/paginated)
- **Shared prop**: pipeline + stages loaded via `AdminDealController::index()`
- **Sidebar**: "Deals" (TrendingUp icon) in Platform section below Dashboard

### 13. AI Agent (Ollama chat asistente)

**Stack**: Laravel AI SDK v0.7, Ollama (local LLM provider)
- **Route**: `POST /admin/ai-agent/chat` → `AdminAiAgentController::chat`
- **Agent class**: `app/Ai/Agents/CrmAgent` — implements `Agent`, uses `Promptable`
- **System prompt**: configurable via `AI_AGENT_INSTRUCTIONS` en `.env` (leído en `config/ai.php` y expuesto en `CrmAgent::instructions()`)
- **Provider/model**: `AI_AGENT_PROVIDER` (default `ollama`) y `AI_AGENT_MODEL` (default `llama3.1:8b`) en `.env`
- **No persistencia**: mensajes no se guardan en DB (stateless, cada llamada es independiente)
- **Frontend**:
  - `resources/js/components/ai-agent/ai-agent-floating-button.tsx` — botón flotante neutro (gris, `BotMessageSquare`)
  - `resources/js/components/ai-agent/ai-agent-chat-panel.tsx` — Sheet con chat, file upload (Medios), audio recording
  - Inyectado en `resources/js/layouts/app-layout.tsx` — aparece en todas las páginas admin
- **File/audio send**: sube a Medios (`POST /admin/media/upload`), no se envía el archivo al LLM
- **Sidebar**: no tiene entrada en sidebar (es flotante)

### 14. Web Widgets (Live Chat Widget)

**Public-facing embeddable chat widget** for external websites. Domain-based matching — each widget is tied to a domain.

- **Public JS**: `public/js/widget.js` — self-contained, injects UI into any page
- **Embed**: `<script src="http://pos.local/js/widget.js"></script>` (loads from Laravel server)
- **API prefix**: `routes/api.php` under `/api/widget/*` with `WidgetCors` middleware
- **Controller**: `app/Http/Controllers/Web/WidgetController.php`
- **Admin CRUD**: `app/Http/Controllers/Admin/AdminWebWidgetController.php` → `/admin/web-widgets`
- **Admin page**: `resources/js/pages/admin/web-widgets/index.tsx`
- **Sidebar**: "Web Widgets" entry in sidebar (dynamic: only shows when widgets exist in DB)

**Models**:
- `WebWidget` — `name`, `domain`, `color`, `position`, `greeting`, `is_active`
- `WebVisitor` — `uuid`, `name`, `email`, `phone`, `ip`, `user_agent`, `current_page`, `first_seen_at`, `last_seen_at`
- `WebConversation` — `visitor_id`, `widget_id`, `assigned_to`, `status` (pending/active/closed), `unread_count`
- `WebMessage` — `conversation_id`, `content`, `is_from_visitor`

**Relationships** (critical: foreign keys must be explicit):
```php
// WebConversation
visitor()       → belongsTo(WebVisitor::class, 'visitor_id')
widget()        → belongsTo(WebWidget::class, 'widget_id')
assignedUser()  → belongsTo(User::class, 'assigned_to')
messages()      → hasMany(WebMessage::class, 'conversation_id')

// WebMessage
conversation()  → belongsTo(WebConversation::class, 'conversation_id')
```

**API flow**:
1. `GET /api/widget/config` — looks up widget by `Origin`/`Referer` host (strips scheme). Returns `widget_id`, `color`, `position`, `greeting`
2. `POST /api/widget/visitor` — registers/updates visitor by `uuid`. Returns `visitor.id`
3. `GET /api/widget/conversations?visitor_id=` — returns existing active conversation with messages
4. `POST /api/widget/conversations` — creates conversation + first message (visitor side). Increments `unread_count`
5. `POST /api/widget/messages` — sends message to existing conversation. If closed, reopens as `pending`

**Domain matching** (`WidgetController::config`):
- Extracts host from `Origin` header (or falls back to `Referer`) using `parse_url()`
- Matches against stored domain with or without scheme: `pos.local`, `http://pos.local`, `https://pos.local`
- Only returns active widgets (`is_active = true`)

**WidgetCors middleware** (`app/Http/Middleware/WidgetCors.php`):
- Applied to all `/api/widget/*` routes
- Sets `Access-Control-Allow-Origin: *`
- Handles OPTIONS preflight requests

**widget.js** (`public/js/widget.js`):
- Self-contained vanilla JS, no dependencies
- Creates DOM elements: floating button, chat panel, messages area, input
- Polls `/api/widget/conversations` every 3s for new messages
- Stores visitor UUID in `localStorage` (`crm_widget_uuid`)
- `api()` function uses default parameter `opts = {}` — GET requests don't need opts

### 15. Admin Web Chat (Agent interface)

**Admin interface** for responding to widget conversations.

- **Route prefix**: `/admin/web-chat` → `AdminWebChatController`
- **Controller**: `app/Http/Controllers/Admin/AdminWebChatController.php`
- **Page**: `resources/js/pages/admin/web-chat/index.tsx`
- **Sidebar**: "Web Chat" in sidebar (dynamic: only shows when widgets exist in DB)

**Endpoints**:
- `GET /admin/web-chat` → Inertia page
- `GET /admin/web-chat/conversations` → JSON: all conversations with visitor, widget, assigned user, last message
- `GET /admin/web-chat/conversations/{id}/messages` → JSON: messages for a conversation
- `POST /admin/web-chat/conversations/{id}/send` → agent reply (creates message with `is_from_visitor = false`)
- `POST /admin/web-chat/conversations/{id}/assign` → assign conversation to a user
- `POST /admin/web-chat/conversations/{id}/close` → close conversation

**Conversations query** (`AdminWebChatController::conversations`):
- Orders by status: `CASE WHEN 'pending' THEN 1 WHEN 'active' THEN 2 WHEN 'closed' THEN 3 END` (SQLite compatible, NOT MySQL `FIELD()`)
- Eager loads: `visitor`, `widget`, `assignedUser`
- Returns: `unread_count`, `last_message`, `last_message_at`

**Shared props** (`HandleInertiaRequests`):
- `webWidgets` — `WebWidget::where('is_active', true)->get(['id', 'name'])` — used by sidebar to show widget inboxes

## Testing

- **Pest** framework. Tests in `tests/Feature/` and `tests/Unit/`.
- Feature tests auto-use `RefreshDatabase` trait.
- SQLite in-memory database in tests (`phpunit.xml`).
- No front-end tests exist.
- **Seeders**: `EntradasTestSeeder` (70 WhatsApp conversations), `WebWidgetSeeder` (1 widget + 3 visitor conversations + messages).

## CI

- Two workflows: `lint.yml` (pint + prettier + eslint) and `tests.yml` (PHP 8.3/8.4/8.5 matrix, Node 22, Pest).
- CI triggers: `develop`, `main`, `master`, `workos` branches + PRs.

## Conventions

- **PHP**: PSR-12 via Laravel Pint preset.
- **JS/TS**: eslint with import ordering (builtin → external → internal → parent → sibling → index, alphabetical within groups). Consistent type imports preferred (`type-imports`).
- **Formatting**: Prettier with `prettier-plugin-tailwindcss`, 80 print width, 4 space indent, single quotes, semicolons.
- **Brace style**: 1TBS with padding lines around control statements.
- **EditorConfig**: 4 space indent, LF endings.
- `resources/js/components/ui/*` is lint-ignored (shadcn components). Do not edit.
