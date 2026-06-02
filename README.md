<p align="center">
  <h1 align="center">CRM Multicanal - Asistido por IA</h1>
  <p align="center">Sistema de gestión de clientes (CRM) construido con Laravel + React + Inertia</p>
</p>

## Stack

| Capa | Tecnología |
|---|---|
| Backend | PHP 8.4+, Laravel 13, MySQL |
| Frontend | React 19, Inertia 3, TypeScript, Tailwind 4 |
| Base de datos | MySQL (por defecto) / SQLite |
| Autenticación | Laravel Fortify (login, registro, 2FA, passkeys) |
| Roles/Permisos | Spatie laravel-permission v8 |
| Tiempo real | Laravel Reverb (WebSocket) vía PM2 |
| Cache | Redis (no tabla `cache` en DB) |
| Queue | Sync (sin tabla `jobs` en DB) |
| Build | Vite 8, Rolldown |
| AI | Laravel AI SDK v0.7 + Ollama (LLM local) |

## Requisitos

- PHP 8.4+
- Node.js 22+
- npm 10+
- Composer 2+
- MySQL (o SQLite para dev)
- Extensión `pcntl` (para Reverb) — NO debe estar en `disable_functions`
- Redis (para cache)

```bash
# 1. Clonar
git clone <repo> && cd crm

# 2. Instalar dependencias
composer install
npm install

# 3. Entorno
cp .env.example .env
# Editar .env con credenciales MySQL

# 4. Generar APP_KEY
php artisan key:generate

# 5. Link de storage
php artisan storage:link

# 6. Migraciones + seeders
APP_ENV=local php artisan migrate:fresh --seed

# 7. Wayfinder (genera rutas JS)
php artisan wayfinder:generate

# 8. Build frontend
npm run build

# 9. Cache para producción
php artisan optimize:clear
```

Credenciales por defecto: `admin@admin.com` / `Admin2026$`

### Reset DB (desarrollo)

```bash
APP_ENV=local php artisan migrate:fresh --seed
```

### OPcache

```bash
curl -sL https://crm.percyalvarez.lat/oc.php
```

### Reverb (WebSocket)

```bash
cp ecosystem.config.example.cjs ecosystem.config.cjs
pm2 start ecosystem.config.cjs
```

nginx:

```nginx
location /app {
    proxy_pass http://0.0.0.0:2002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Arquitectura

### 9 migraciones, 1 por tabla

| Migración | Tablas |
|---|---|
| `0001_01_01_000000` | `users`, `password_reset_tokens`, `sessions` |
| `2024_01_01_000000` | `passkeys` |
| `2026_05_29_174645` | `evolution_webhooks` |
| `2026_05_29_175631` | `contacts` (con uuid/ip/user_agent para web visitors) |
| `2026_05_31_035213` | Spatie permissions/roles |
| `2026_05_31_042101` | `pipelines`, `pipeline_stages`, `deals` |
| `2026_06_01_032311` | `inboxes` (config JSON con instanceId/apikey/serverUrl) |
| `2026_06_01_040000` | `conversations` (con status/assigned_to) |
| `2026_06_01_050000` | `messages` (con instance/message_id/sender_phone) |

### Tablas unificadas

Solo 4 tablas nucleares para TODOS los mensajes:

```
inboxes (type=evolution | web)
    |
    ├── conversations (inbox_id FK, channel_id + instance unique)
    |       ├── contact_id → contacts (WhatsApp + web visitors)
    |       └── messages (instance, channel_id, input_output, text, media_url)
    |
    └── config JSON: instanceId, apikey, ownerJid, profileName, etc.
```

### Tablas eliminadas (7)

| Tabla | Reemplazo |
|---|---|
| `web_widgets` | `inboxes.config` (JSON) |
| `web_visitors` | `contacts` (type=web_visitor, uuid) |
| `web_conversations` | `conversations` (status, assigned_to) |
| `web_messages` | `messages` (input_output=is_from_visitor) |
| `cache` / `cache_locks` | Redis |
| `jobs` / `job_batches` / `failed_jobs` | No se usan (QUEUE_CONNECTION=sync) |

### Modelos eliminados (4)

| Modelo | Razón |
|---|---|
| `WebWidget` | Config en `inboxes.config` |
| `WebVisitor` | Unificado en `Contact` |
| `WebConversation` | Unificado en `Conversation` |
| `WebMessage` | Unificado en `Message` |

## Módulos

### Inboxes (centralizado)

Todas las fuentes de mensajes (WhatsApp Evolution, web widgets) se gestionan desde una sola tabla `inboxes`.

**Create flow**:
- Evolution: usuario elige instancia de Evolution API → se crea inbox con config completa + webhook
- Web: usuario ingresa nombre → inbox creado con config por defecto

**Webhook**: cada inbox tiene su propia URL (`/api/webhooks/evolution/{name}`). El controller verifica que `payload.instance` coincida con la URL para evitar contaminación cruzada.

### Evolution API (WhatsApp)

- Webhooks sincrónicos (sin queue)
- Dedup de mensajes **por inbox** (mismo `message_id` puede existir en distintos inboxes con diferente dirección IN/OUT)
- Auto-echo prevention: mensajes de grupo no se duplican como IN
- `webhookBase64: true` + evento `MESSAGES_UPSERT` (sin `webhookByEvents`)
- Formato de respuesta plano (no nested en `instance`)
- `forInbox()` para usar credenciales por instancia

### Contactos (unificado)

WhatsApp contacts + web visitors en una sola tabla `contacts`:
- `type=individual`: contactos WhatsApp
- `type=group`: grupos WhatsApp
- `type=web_visitor`: visitantes web (con uuid, ip, user_agent, current_page)

### Entradas (Chat UI)

Interfaz de chat unificada para WhatsApp y web widgets en `/admin/entradas/{instance}`.

Endpoints:
- `GET /{instance}/chats` → conversaciones con last_message
- `GET /{instance}/messages?channel_id=` → mensajes (50 últimos, filtra por instance)
- `POST /{instance}/send` → enviar texto/multimedia
- `DELETE /{instance}/conversations/{id}` → eliminar conversación

### Web Widget (Live Chat)

Widget embebible en sitios externos:
- `/js/widget.js` → script auto-contenido
- API pública en `/api/widget/*`
- Usa las mismas tablas unificadas (inboxes, contacts, conversations, messages)

### Otros módulos

- **Medios**: gestor de archivos con filtros por tipo/tamaño
- **Deals**: pipeline CRM con Kanban drag & drop
- **WooCommerce**: POS, productos, pedidos via REST API
- **AI Agent**: asistente flotante con Ollama
- **Notificaciones**: frontend-only (localStorage), sin tabla en DB

## Testing

```bash
composer test
```

Pest con MySQL en tests. Tests en `tests/Feature/` y `tests/Unit/`.

## Conventions

- PHP: PSR-12 via Laravel Pint
- JS/TS: eslint + prettier (80 print width, 4 space indent, single quotes)
- 1TBS braces with padding lines
- 9 migrations only (1 per table)

## Licencia

Propietario.