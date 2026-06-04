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
| Clear all cache | `php artisan optimize:clear` |
| Reset DB | `APP_ENV=local php artisan migrate:fresh --seed` |
| Regenerate routes | `php artisan wayfinder:generate` |
| OPcache reset | `curl -sL https://crm.percyalvarez.lat/oc.php` |

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
- **Cache** uses **Redis** (`CACHE_STORE=redis`). No `cache` DB table needed.
- **Queue**: `QUEUE_CONNECTION=sync`. No `jobs` DB table needed.
- Reverb runs on port **2002** (configurable via `REVERB_SERVER_PORT`). nginx proxies `/app` to the Reverb server.
- Echo + Pusher JS for frontend WebSocket client. Pusher client needs `cluster` option even with Reverb.
- Reverb requires `pcntl` extension. Ensure `pcntl_*` functions are NOT in `disable_functions` in your PHP CLI php.ini.

## Database: 10 migrations, 1 per table

| # | File | Tables |
|---|---|---|
| 1 | `0001_01_01_000000_create_users_table.php` | `users`, `password_reset_tokens`, `sessions` |
| 2 | `2024_01_01_000000_create_passkeys_table.php` | `passkeys` |
| 3 | `2026_05_29_174645_create_evolution_webhooks_table.php` | `evolution_webhooks` |
| 4 | `2026_05_29_175631_create_contacts_table.php` | `contacts` (con uuid, ip, user_agent, first_seen_at, etc.) |
| 5 | `2026_05_31_035213_create_permission_tables.php` | Spatie permissions/roles |
| 6 | `2026_05_31_042101_create_pipelines_table.php` | `pipelines`, `pipeline_stages`, `deals` |
| 7 | `2026_06_01_032311_create_inboxes_table.php` | `inboxes` (config JSON con instanceId/apikey/serverUrl) |
| 8 | `2026_06_01_040000_create_conversations_table.php` | `conversations` (con status/assigned_to, FK → inboxes/contacts) |
| 9 | `2026_06_01_050000_create_messages_table.php` | `messages` (instance, message_id, sender_phone, status, reaction_to) |
| 10 | `2026_06_02_210000_add_status_and_reaction_to_to_messages_table.php` | Adds `status`(pending/sent/delivered/read/failed) + `reaction_to`(FK message_id) to `messages` |

## Unified Table Architecture

Every message source (WhatsApp Evolution, web widgets) uses the SAME 4 tables:

```
inboxes (type=evolution | web)
    │
    ├── conversations (inbox_id FK, channel_id + instance unique)
    │       ├── contact_id → contacts (WhatsApp users + web visitors)
    │       └── messages (instance, channel_id, input_output, text, media_url)
    │
    └── Evolution API config (inboxes.config JSON):
            instanceId, apikey, ownerJid, profileName, profilePicUrl, etc.
```

### Tables removed (7)

| Removed table | Replaced by |
|---|---|
| `web_widgets` | `inboxes.config` (JSON: domain, color, greeting, position) |
| `web_visitors` | `contacts` (type=web_visitor, uuid, ip, user_agent, current_page) |
| `web_conversations` | `conversations` (status, assigned_to) |
| `web_messages` | `messages` (input_output = is_from_visitor) |
| `cache` / `cache_locks` | Redis |
| `jobs` / `job_batches` / `failed_jobs` | No queue |

### Models removed (4)

| Removed model | Reason |
|---|---|
| `WebWidget` | Config in `inboxes.config` |
| `WebVisitor` | Merged into `Contact` |
| `WebConversation` | Merged into `Conversation` |
| `WebMessage` | Merged into `Message` |

### Controllers removed (2)

| Removed controller | Reason |
|---|---|
| `AdminWebWidgetController` | Replaced by `InboxCrudController` |
| `AdminWebChatController` | Replaced by `AdminEntradaController` |

### Events removed (1)

| Removed event | Reason |
|---|---|
| `WebMessageCreated` | `MessageCreated` handles all message types |

## Inboxes System

### Concept

All message sources (Evolution WhatsApp + web widgets) are managed through a single **Inboxes** table.

| Inbox type | Data source | Chat UI |
|---|---|---|
| `evolution` | Evolution API webhooks | `/admin/entradas/{name}` |
| `web` | WidgetController API | `/admin/entradas/{name}` |

### Model: `Inbox`

| Column | Type | Notes |
|---|---|---|
| `id` | bigIncrements | PK |
| `name` | string unique | `tigo1`, `entel1`, `mi-sitio` |
| `type` | string | `evolution`, `web` |
| `status` | string | `active`, `inactive` |
| `webhook_url` | string nullable | `/api/webhooks/evolution/{name}` |
| `webhook_enabled` | boolean | |
| `config` | json nullable | instanceId, apikey, ownerJid, profileName, etc. |

### config JSON (type=evolution)

```json
{
  "instanceId": "635cd8e6-51b5-4b6a-aad1-ef47e3cfd129",
  "apikey": "CC531996E938-443A-85EA-AD97E69AE19D",
  "ownerJid": "59169375664@s.whatsapp.net",
  "profileName": "rioblanco",
  "profilePicUrl": "https://...",
  "connectionStatus": "open",
  "number": "59169375664",
  "integration": "WHATSAPP-BAILEYS"
}
```

### config JSON (type=web)

```json
{
  "domain": "tusitio.com",
  "color": "#3b82f6",
  "position": "right",
  "greeting": "Hola, ¿en qué podemos ayudarte?"
}
```

### Create flow

- **Evolution**: User picks instance from Evolution API (fetched live) → inbox created with full config + webhook set
- **Web**: User enters name → inbox created with default config

## Evolution API Service

**File**: `app/Services/EvolutionApiService.php`

### Response format (fetchInstances)

The API returns flat instance objects (NOT nested in `instance` key):

```json
[
  {
    "id": "635cd8e6-...",
    "name": "tigo1",
    "connectionStatus": "open",
    "ownerJid": "59169375664@s.whatsapp.net",
    "profileName": "rioblanco",
    "profilePicUrl": "https://...",
    "integration": "WHATSAPP-BAILEYS",
    "token": "CC531996E938-443A-85EA-AD97E69AE19D"
  }
]
```

### setWebhook format

```json
{
  "webhook": {
    "enabled": true,
    "url": "https://crm.percyalvarez.lat/api/webhooks/evolution/tigo1",
    "webhookBase64": true,
    "events": ["MESSAGES_UPSERT", "SEND_MESSAGE", "MESSAGES_UPDATE"]
  }
}
```

### Events (latest)

The webhook now subscribes to **9 events** via `setWebhookWithAllEvents()`:

| Event | Handler | Purpose |
|---|---|---|
| `MESSAGES_UPSERT` | `processMessage()` | New incoming/outgoing messages (text, image, video, audio, reaction, etc.) |
| `SEND_MESSAGE` | `processAck()` | Confirmation message was sent (`SERVER_ACK` → `sent`, `PENDING` ignored) |
| `MESSAGES_UPDATE` | `processAck()` | Status changes (`DELIVERY_ACK` → `delivered`, `READ` → `read`, `ERROR` → `failed`) |
| `CONNECTION_UPDATE` | `handleSystemEvent()` | Connection status changes |
| `QRCODE_UPDATED` | `handleSystemEvent()` | QR reconnection |
| `LOGOUT_INSTANCE` | `handleSystemEvent()` | Logout deactivates inbox |
| `REMOVE_INSTANCE` | `handleSystemEvent()` | Instance removal deactivates inbox |
| `APPLICATION_STARTUP` | `handleSystemEvent()` | App restart |
| `CALL` | `handleSystemEvent()` | Call log |

### processAck (status update)

```
send.message / messages.update → processAck():
  → Extrae key.id (o keyId en messages.update) + status del payload
  → Mapea: SERVER_ACK→sent, DELIVERY_ACK→delivered, READ→read, ERROR→failed
  → Busca Message por message_id + instance + fromMe=false
  → Actualiza status en DB
  → Broadcast MessageStatusUpdated a entradas.{instance}
```

`messages.update` usa `keyId` (no `key.id`). `send.message` envía `status: "PENDING"` que se ignora.

### Methods

| Method | Endpoint |
|---|---|
| `fetchInstances()` | `GET /instance/fetchInstances` |
| `setWebhook(instance, url, enabled, events)` | `POST /webhook/set/{instance}` |
| `sendText(instance, number, text)` | `POST /message/sendText/{instance}` |
| `sendMedia(instance, number, mediaType, mediaUrl, ...)` | `POST /message/sendMedia/{instance}` |
| `fetchProfile(instance, number)` | `POST /chat/fetchProfile/{instance}` |
| `fetchProfilePictureUrl(instance, number)` | `POST /chat/fetchProfilePictureUrl/{instance}` |
| `fetchGroups(instance)` | `GET /group/fetchAllGroups/{instance}` |
| `getBase64FromMediaMessage(instance, messageId, remoteJid)` | `POST /chat/getBase64FromMediaMessage/{instance}` |
| `findContacts(instance)` | `POST /chat/findContacts/{instance}` |
| `fetchChats(instance)` | `GET /chat/findChats/{instance}` |
| `sendReaction(instance, number, reactionEmoji, originalMessageId)` | `POST /message/sendReaction/{instance}` |
| `forInbox(Inbox)` | Returns cloned service with per-instance serverUrl+apikey |

## Webhook Flow

```
Evolution API → POST /api/webhooks/evolution/{inbox_name}
  → EvolutionWebhookController::handle()
    → ¿Inbox existe y status=active? NO → ignora
    → ¿payload.instance ≠ URL instance? SÍ → ignora (evita contaminación cruzada)
    → EvolutionWebhook::create() (raw log)
    → ¿event === 'messages.upsert'? SÍ → processMessage()
    → ¿event === 'send.message' o 'messages.update'? SÍ → processAck()
    → else → handleSystemEvent()
    → 200 OK

processMessage (sincrónico, sin queue):
  → Filtra: @broadcast, @newsletter
  → Dedup por message_id: solo dentro de conversaciones de ESTE inbox
  → Skip types: albumMessage, protocolMessage
  → reactionMessage NO se salta (se guarda con reaction_to al mensaje padre)
  → senderKeyDistributionMessage NO se salta (metadata válida de grupo)
  → Contact::firstOrCreate() by phone
  → Conversation::firstOrCreate() by channel_id + instance
  → Message::create() con try-catch para UniqueConstraintViolationException
  → unread_count++ para mensajes entrantes
  → broadcast MessageCreated a entradas.{instance}
```

### Dedup per inbox

`message_id` se verifica SOLO dentro de conversaciones de ese inbox (via subquery `whereIn('channel_id', conversations.where('instance'))`). El mismo `message_id` puede existir en diferentes inboxes con diferente dirección IN/OUT.

## Contacts (unified)

**Migration**: `2026_05_29_175631_create_contacts_table.php`
**Model**: `app/Models/Contact.php`
**Controller**: `app/Http/Controllers/Admin/AdminContactController.php`

| Type | phone | uuid | whatsapp_id |
|---|---|---|---|
| `individual` | WhatsApp number | NULL | JID |
| `group` | Group JID (number) | NULL | @g.us JID |
| `web_visitor` | NULL or visitor phone | UUID | NULL |

Additional web visitor fields: `ip`, `user_agent`, `current_page`, `first_seen_at`, `last_seen_at`

## Conversations + Messages (unified)

**Controller**: `app/Http/Controllers/Admin/AdminEntradaController.php` — handles BOTH WhatsApp and web widget conversations/messages.

### Conversations table

| Column | Type | Notes |
|---|---|---|
| `id` | bigIncrements | PK |
| `inbox_id` | FK → inboxes | CASCADE |
| `channel_id` | string | WhatsApp JID or visitor UUID |
| `contact_id` | FK → contacts | CASCADE |
| `instance` | string | Inbox name |
| `unread_count` | unsignedSmallInt | default 0 |
| `status` | string(20) | default 'active' (pending/active/closed) |
| `assigned_to` | FK → users | nullable |

Unique: `(channel_id, instance)`

### Messages table

| Column | Type | Notes |
|---|---|---|
| `id` | bigIncrements | PK |
| `message_id` | string | nullable (WhatsApp msg ID) |
| `reaction_to` | string | nullable, index (message_id del mensaje original para reacciones) |
| `channel_id` | string | indexed |
| `instance` | string | nullable, indexed |
| `input_output` | boolean | true=IN(entrada), false=OUT(salida) |
| `message_type` | string | nullable |
| `text` | text | nullable |
| `media_url` | string | nullable |
| `sender_phone` | string | nullable, indexed |
| `status` | string(20) | nullable (pending/sent/delivered/read/failed) |

No unique constraint on `message_id` — same message can exist across different inboxes.

## Web Widget (Live Chat)

**Public JS**: `public/js/widget.js` — self-contained, injects intl-tel-input dynamically
**Embed**: `<script src="/js/widget.js"></script>` (loads from Laravel server)
**API prefix**: `routes/api.php` under `/api/widget/*` with `WidgetCors` middleware
**Controller**: `app/Http/Controllers/Web/WidgetController.php`

Widget controller uses **unified tables**:
- `Inbox` (with type=web, config JSON for domain/color/greeting) instead of `WebWidget`
- `Contact` (with uuid, type=web_visitor) instead of `WebVisitor`
- `Conversation` (with status, inbox_id) instead of `WebConversation`
- `Message` (input_output = is_from_visitor) instead of `WebMessage`

## Key Architectural Decisions

- **Unified tables**: Only 4 core tables (inboxes, contacts, conversations, messages) for ALL message sources
- **Each inbox 100% independent**: messages scoped by `instance` + `channel_id`, dedup per inbox
- **Webhook payload check**: ignores if `payload.instance` ≠ URL instance (prevents cross-inbox contamination)
- **No queue**: `QUEUE_CONNECTION=sync`, webhooks processed synchronously
- **Message dedup per inbox**: `message_id` scoped to conversations of THIS inbox only
- **Auto-echo prevention**: `fromMe=false` webhook skipped if OUT already exists for same message_id
- **`firstOrCreate` for contacts**: never overwrite existing contact data
- **Conversation unique**: composite `(channel_id, instance)` — same group in different inboxes
- **`send.message`/`messages.update`**: status updates (SERVER_ACK→sent, DELIVERY_ACK→delivered, READ→read)
- **Reactions**: `reactionMessage` stored with `reaction_to` pointing to original message's `message_id`
- **10 migrations**: 1 per table + status/reaction_to columns
- **No cache/jobs tables**: cache uses Redis, queue is sync

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