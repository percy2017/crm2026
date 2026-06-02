# AGENTS.md

## Stack

- **PHP 8.4+**, Laravel 13, **MySQL**, nginx
- **React 19**, Inertia 3, Tailwind 4, TypeScript
- Auth: Laravel Fortify (login/register/2FA/passkeys)
- Realtime: Laravel Reverb (WebSocket, port 2002) via PM2
- Frontend build: Vite 8, Rolldown
- **AI**: Laravel AI SDK v0.7, Ollama (local LLM provider)

- **Roles/Permissions**: Spatie `laravel-permission` v8 (`roles`, `permissions`, `model_has_roles`, etc.)
- **Phone input**: `intl-tel-input` (vanilla JS widget) — flags, country detection, validation

## Key commands

| Action | Command |
|---|---|
| Dev servers | `composer dev` (PHP server + logs + Vite concurrently) |
| Build frontend | `npm run build` |
| Type check | `npm run types:check` (`tsc --noEmit`) |
| Lint PHP | `composer lint` (pint) / `composer lint:check` (pint --test) |
| Lint JS/TS | `npm run lint` (eslint) / `npm run format` (prettier) |
| Test | `composer test` (pint check + artisan test) or `./vendor/bin/pest` |
| CI check | `composer ci:check` (lint + format + types + test) |
| Reverb | `pm2 start ecosystem.config.cjs` / `pm2 restart reverb` |
| Restart Evolution API | `pm2 restart evolution-api` |

| Migrate | `php artisan migrate` |
| Seed test data | `php artisan db:seed --class=EntradasTestSeeder` / `php artisan db:seed --class=WebWidgetSeeder` |
| Regenerate routes | `php artisan wayfinder:generate` |
| Clear all cache | `php artisan optimize:clear` |

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

- `.env` uses **MySQL** (`DB_CONNECTION=mysql`) by default. Also supports SQLite for dev.
- **Cache** uses **Redis** (`CACHE_STORE=redis`).
- Reverb runs on port **2002** (configurable via `REVERB_SERVER_PORT`). nginx proxies `/app` to the Reverb server.
- Echo + Pusher JS for frontend WebSocket client. Pusher client needs `cluster` option even with Reverb.
- Reverb requires `pcntl` extension. Ensure `pcntl_*` functions are NOT in `disable_functions` in your PHP CLI php.ini.

## Inboxes System (centralized inbox management)

All message sources (Evolution WhatsApp instances, web widgets) are managed through a single **Inboxes** system.

### Concept

| Old (removed) | New |
|---|---|
| `evolution-instances` page (live API) | **`/admin/inboxes`** (DB-backed) |
| `web-widgets` page (separate CRUD) | Inboxes can be type `evolution` or `web` |
| `evolutionInstances` shared prop | `inboxes` shared prop from DB |
| Webhook `POST /api/webhooks/evolution` | `POST /api/webhooks/evolution/{inbox}` (per-inbox) |

### Model: `Inbox`

| Column | Type | Notes |
|---|---|---|
| `id` | bigIncrements | PK |
| `name` | string unique | `tigo1`, `entel1`, `mi-sitio` |
| `type` | string | `evolution`, `web` |
| `status` | string | `active`, `inactive` |
| `webhook_url` | string nullable | auto-generated: `/api/webhooks/evolution/{name}` |
| `webhook_enabled` | boolean | |
| `config` | json nullable | ownerJid, profileName, profilePicUrl, etc. |
| `web_widget_id` | FK nullable → web_widgets | linked WebWidget for type=web |

### Pages

- **`GET /admin/inboxes`** — list of all inboxes with avatar, type, webhook status
- **`GET /admin/inboxes/create`** — create page:
  - Select type (`evolution` or `web`)
  - If `evolution`: shows instances from Evolution API (with avatar, name, status)
  - If `web`: name input → auto-creates WebWidget
  - After create: success screen showing webhook URL with copy button
- **`POST /admin/inboxes`** — store (creates inbox + configures webhook on Evolution API)
- **`DELETE /admin/inboxes/{inbox}`** — delete

### Webhook Flow

```
Evolution API → POST /api/webhooks/evolution/{instance}
  → EvolutionWebhookController::handle()
    → EvolutionWebhook::create() (raw log)
    → processMessage() (sync — Contact, Conversation, Message, broadcast)
    → 200 OK

Processing (synchronous, no queue):
  → Contact::firstOrCreate() by phone
  → Conversation::firstOrCreate() by channel_id + instance (composite unique)
  → Message::create() with message_id dedup (try-catch for duplicates)
  → unread_count++ on conversation for incoming messages
  → broadcast MessageCreated to entradas.{instance}
```

### Sidebar

Inboxes with `type=evolution` appear under "Entradas" with `Zap` icon.
Inboxes with `type=web` appear under "Entradas" with `Globe` icon.

## Module Relationships (diagram)

```
Evolution API (WhatsApp)
    │
    ├── Inbox (DB) ←── Webhooks ──→ EvolutionWebhooks (raw log)
    │                               └── EvolutionWebhookController (sync, no queue)
    │                                   ├── Contact (firstOrCreate by phone)
    │                                   ├── Conversation (firstOrCreate by channel_id + instance)
    │                                   ├── Message (create with message_id dedup, try-catch dups)
    │                                   ├── unread_count++ for incoming messages
    │                                   └── broadcast MessageCreated to entradas.{instance}
    │
    └── REST API (fetchInstances, sendText, sendMedia, setWebhook, etc.)
        │
        └── Entradas Chat UI
            ├── GET /{instance}/chats    → conversations + contacts + messages (local)
            ├── GET /{instance}/messages → messages (local), resets unread_count
            └── POST /{instance}/send    → Evolution API + Message::create (local)

AI Agent (Ollama)
    │
    ├── CrmAgent ──→ instructions() from config/env
    ├── Header Button ──→ AppSidebarHeader (all admin pages)
    └── Chat Panel ──→ Sheet with file/audio/text input
        └── POST /admin/ai-agent/chat ──→ Ollama via AI SDK

Notifications (Global)
    ├── chat.tsx socket listener ──→ dispatch window event `notify:message`
    ├── NotificationsContext ──→ group by instance+channel, persist localStorage
    ├── NotificationBell ──→ icon in AppSidebarHeader with badge
    └── NotificationsSheet ──→ custom side panel (no Radix)

Deals (Pipeline CRM)
    ├── AdminDealController (CRUD + moveStage)
    ├── AdminPipelineStageController (manage stages)
    ├── Kanban Board (drag & drop, configurable stages)
    └── Table View + Manage Stages Dialog
```

## Modules

### 1. Reverb (WebSocket / Realtime)
- **Stack**: Laravel Reverb, port **2002**, managed via PM2 (`ecosystem.config.cjs`)
- **Frontend**: Echo + Pusher JS client (needs `cluster` option even with Reverb)
- **Page**: `/reverb-monitor` → `resources/js/pages/reverb-monitor.tsx`
- **nginx**: proxies `/app` to `0.0.0.0:2002`
- **Commands**: `pm2 restart reverb`, `pm2 start ecosystem.config.cjs`
- **Echo config** (in `chat.tsx` and `use-echo.ts`):
  - Pusher client needs `channelAuthorization: { endpoint: '/broadcasting/auth', transport: 'ajax' }` for private channels
  - Echo needs `authEndpoint: '/broadcasting/auth'` (Pusher defaults to `/pusher/auth` which doesn't exist)

### 2. Inboxes (Centralized inbox management)
- **Route**: `/admin/inboxes` → `InboxCrudController.php`
- **Model**: `Inbox` — `name`, `type` (evolution/web), `status`, `webhook_url`, `webhook_enabled`, `config` (JSON), `web_widget_id` (FK)
- **Create flow**:
  - Select type → if `evolution`: pick from Evolution API instances (fetched live, shows avatar/status)
  - If `web`: enter name → auto-creates WebWidget with defaults
  - On success: shows webhook URL with copy button
- **Delete**: removes inbox + optional linked WebWidget
- **Sidebar**: "Inboxes" under Configuración (replaces old "Evolution API" + "Web Widgets")
- **Shared prop**: `inboxes` — `Inbox::where('status', 'active')->get(['id', 'name', 'type', 'webhook_enabled', 'config'])`

### 3. Evolution Webhooks (receiver + processor sync)
- **Route**: `POST /api/webhooks/evolution/{instance?}` → `api.php`
- **Controller**: `app/Http/Controllers/Webhooks/EvolutionWebhookController.php`
- **Process**: stores raw log → calls `processMessage()` synchronously → returns 200 immediately
- **Inbox check**: verifies `Inbox::where('name', $instance)->where('status', 'active')` exists — ignores if not
- **Only processes**: `messages.upsert` events
- **Skip types**: `albumMessage`, `reactionMessage`, `protocolMessage` (NOT `senderKeyDistributionMessage` — removed because it's a valid group metadata field)
- **Message create**: wrapped in try-catch for `UniqueConstraintViolationException` — handles duplicates silently
- **Model**: `EvolutionWebhook` — raw log (`instance`, `event`, `payload` JSON)
- **No queue** — synchronous processing (QUEUE_CONNECTION=sync)
- **File**: `app/Jobs/ProcessEvolutionWebhook.php` (not used, sync only)
- **Behavior**:
  - Filters: only `messages.upsert` events
  - Skips: `status@broadcast` (stories), `@newsletter`
  - Skips types: `albumMessage`, `reactionMessage`, `protocolMessage`, `senderKeyDistributionMessage`
  - **Stickers** (`stickerMessage`): processed (not skipped), media download attempted with fallback
  - **Groups**: `safeGroupName()` fetches name from Evolution API with try/catch fallback — fallback name: `"Group {last8digits}"` (NOT `$pushName` which is the sender)
  - **Contact**: `firstOrCreate(['phone' => $phone])`
    - When `fromMe=true` (outgoing): name is NOT saved (avoids showing instance owner's name)
    - When `fromMe=false` (incoming): name saved from `$pushName`
  - **Conversation**: `firstOrCreate(['channel_id', 'instance'])` with `inbox_id` FK
  - **Message**: `create` by `message_id` dedup (try-catch for duplicates) — `message_id` is global unique, checked without channel_id
  - **Media**: tries `getBase64FromMediaMessage` with try/catch — if fails, message is saved without media
  - **Broadcast**: `MessageCreated` event on `entradas.{instance}` (incoming AND outgoing)

### 4. Conversations + Messages (local DB storage)
- **Table**: `conversations`
  - `id`, `channel_id` (string), `contact_id`, `instance`, `inbox_id` (FK → inboxes), `unread_count` (default 0), timestamps
  - **Unique constraint**: composite `(channel_id, instance)` — same group can exist in different inboxes
- **Table**: `messages`
  - `id`, `message_id` (string unique — WhatsApp msg ID, dedup), `channel_id`, `input_output` (true=entrada), `message_type`, `text`, `media_url`, `sender_phone` (string nullable), timestamps
- **Group detection**: `str_ends_with($jid, '@g.us')` → type=group, otherwise individual
- **Message bubbles**: unified `bg-muted` in UI
- **Unread tracking**: `unread_count` incremented in `EvolutionWebhookController::processMessage()` for incoming messages; reset in `AdminEntradaController::messages()` when opening conversation; frontend clears badge locally on click

### 5. Entradas (WhatsApp Chat UI)
- **Route prefix**: `/admin/entradas/{instance}` → `AdminEntradaController`
- **Chat page**: `resources/js/pages/admin/entradas/chat.tsx`
  - Header: avatar from `inbox.config.profilePicUrl`, name, JID, no Info button
  - Left: conversations (searchable, ordered by last message)
  - Right: messages + input area
- **Endpoints**:
  - `GET /{instance}/chats` → JSON conversations with contact + last message
  - `GET /{instance}/messages?channel_id=...` → JSON messages
  - `POST /{instance}/send` → sendText/sendMedia via Evolution API + save locally
  - `DELETE /{instance}/conversations/{conversation}` → delete
- **Chat UI features**:
  - **Emoji picker** (`emoji-picker-react`) — popover above input, 😊 button
  - **Drag & drop** files
  - **Audio recording** (MediaRecorder)
  - **Paste image** (Ctrl+V) — captures clipboard images as file attachment
  - **File upload** with caption textarea
  - **Compact footer** — buttons grouped (Paperclip, Mic, Smile), textarea, Send
  - **Conversation header click** → opens ChatSidebar (Sheet with contact details)
  - **Real-time**: Echo listener on `entradas.{instance}` private channel
  - **Delete dialog**: confirmation Dialog before deleting conversation
  - **Scroll-to-bottom button**: floating ChevronDown button (appears when scrolled up) with badge showing new messages received while away
  - **Unread badge**: per-conversation `unread_count` displayed as primary-colored badge in conversation list
- **ChatSidebar component** (`resources/js/components/entradas/chat-sidebar.tsx`):
  - Always shows name + phone in header (even if contact not in DB)
  - Falls back to channelId, contactName, contactAvatar from props
  - "Contacto no encontrado" removed — just shows empty body
  - Copy phone with toast "Teléfono copiado"
  - Delete button with confirmation
- **Shared prop**: `inboxes` from `HandleInertiaRequests`

### 6. Evolution API Service
- **File**: `app/Services/EvolutionApiService.php`
- **Methods**:
  - `fetchInstances()` — `GET /instance/fetchInstances`
  - `fetchWebhookStatus(instance)` — `GET /webhook/find/{instance}`
  - `setWebhook(instance, url, enabled, events)` — `POST /webhook/set/{instance}` — sets webhook with URL, events, base64
  - `fetchProfile(instance, number)` — `POST /chat/fetchProfile`
  - `fetchProfilePictureUrl()` — `POST /chat/fetchProfilePictureUrl`
  - `sendText(instance, number, text)` — `POST /message/sendText`
  - `sendMedia(instance, number, mediaType, mediaUrl, mimetype, caption?, fileName?)` — `POST /message/sendMedia`
  - `fetchGroups(instance)` — `GET /group/fetchAllGroups`
  - `getBase64FromMediaMessage(instance, messageId, remoteJid)` — `POST /chat/getBase64FromMediaMessage`
  - `findContacts(instance)` — `POST /chat/findContacts`
  - `fetchChats(instance)` — `GET /chat/findChats`

### 7. Notificaciones Globales
- **Context**: `resources/js/contexts/notifications-context.tsx`
- **Registration**: Wrapped in `app.tsx` as `<NotificationsProvider>`
- **Bell**: `notification-bell.tsx` in header with red badge counter
- **Panel**: `notifications-sheet.tsx` — custom side panel (no Radix)
- **Flow**: socket listener → `notify:message` event → Context aggregates by `instance+channel_id` → localStorage (max 20)

### 8. Web Widgets (Live Chat Widget)
- **Public JS**: `public/js/widget.js` — self-contained, **injects `intl-tel-input` dynamically** (CSS + JS from server)
- **Embed**: `<script src="/js/widget.js"></script>` (loads from Laravel server)
- **Features**: pre-chat form (name required, email, phone with country flags autodetection, message)
- **API prefix**: `routes/api.php` under `/api/widget/*` with `WidgetCors` middleware
- **Controller**: `app/Http/Controllers/Web/WidgetController.php`
- **Admin**: via Inboxes (type=web) — see Inboxes module
- **Models**: `WebWidget`, `WebVisitor`, `WebConversation`, `WebMessage`
- **Widget creates inbox** — when `type=web` inbox is created, WebWidget is auto-created with defaults

### 9. Queue (Redis + PM2)
- **Backend**: Redis (`QUEUE_CONNECTION=redis`, via `predis/predis`)
- **Worker**: `php artisan queue:listen --tries=3 --timeout=120` managed by PM2 (`ecosystem.config.cjs` → app `queue`)
- **Why PM2**: keeps worker alive 24/7, auto-restart on crash
- **Key queue**: `default`
- **Job**: `ProcessEvolutionWebhook` — processes incoming WhatsApp messages async

### 10. Medios (File manager)
- **Route**: `/admin/media` → `AdminMediaController`
- **Storage**: `storage/app/public/`
- **Filters**: type (image/video/audio/document/archive/other) and size (tiny/small/medium/large) via `GET /admin/media/list?type=X&size=Y`
- **Used by**: Entradas (file/audio attachment upload before send), AI Agent

### 11. Deals (Pipeline CRM)
- **Route**: `/admin/deals` → `AdminDealController`
- **Models**: `Pipeline`, `PipelineStage`, `Deal` (softDeletes)
- **Views**: Kanban (drag & drop via `@hello-pangea/dnd`) + Table (Yajra DataTable)

### 12. AI Agent (Ollama)
- **Route**: `POST /admin/ai-agent/chat` → `AdminAiAgentController::chat`
- **Stack**: Laravel AI SDK v0.7, Ollama
- **UI**: Header button → Sheet with file/audio/text input

### 13. WooCommerce (POS + Orders + Products)
- **Controller**: `AdminWooCommerceController.php`
- **All routes** under `/admin/woocommerce/*`
- **No local DB** — all data via REST API

### 14. Users & Roles (Admin CRUD)
- **Routes**: `/admin/users`, `/admin/roles`
- **DataTables**: Yajra
- **Auth guard**: `admin` role via Spatie

## Key Architectural Decisions

- **Inboxes centralize all message sources** — no more separate CRUD per type
- **Webhook per inbox** — each inbox gets its own URL (`/api/webhooks/evolution/{name}`)
- **Async processing via queue** — webhooks return 200 immediately, processing happens in background (Redis queue via PM2)
- **Message dedup** — WhatsApp `message_id` is stored and checked before insert; same message_id from multiple instances creates only 1 record
- **`firstOrCreate` for contacts** — never overwrite existing contact data
- **No inbox check in webhook controller** — all messages are processed regardless of inbox existence
- **Group names safe** — `safeGroupName()` wraps fetch in try/catch; fallback is `"Group {last8}"` NOT `$pushName` (sender name)
- **Outgoing contact names**: when `fromMe=true`, contact name is NOT saved (avoids showing instance owner's name as contact)

## Testing

- **Pest** framework. Tests in `tests/Feature/` and `tests/Unit/`.
- Feature tests auto-use `RefreshDatabase` trait.
- MySQL in tests (or SQLite in-memory via `phpunit.xml`).
- No front-end tests exist.


## Conventions

- **PHP**: PSR-12 via Laravel Pint preset.
- **JS/TS**: eslint with import ordering (builtin → external → internal → parent → sibling → index, alphabetical within groups). Consistent type imports preferred (`type-imports`).
- **Formatting**: Prettier with `prettier-plugin-tailwindcss`, 80 print width, 4 space indent, single quotes, semicolons.
- **Brace style**: 1TBS with padding lines around control statements.
- **EditorConfig**: 4 space indent, LF endings.
- `resources/js/components/ui/*` is lint-ignored (shadcn components). Do not edit.