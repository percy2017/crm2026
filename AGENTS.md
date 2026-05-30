# AGENTS.md

## Stack

- **PHP 8.3+**, Laravel 13, MariaDB, nginx
- **React 19**, Inertia 3, Tailwind 4, TypeScript
- Auth: Laravel Fortify (login/register/2FA/passkeys)
- Realtime: Laravel Reverb (WebSocket, port 6001) via PM2
- Frontend build: Vite 8, Rolldown

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

## Architecture

- **All pages are Inertia pages** in `resources/js/pages/`. Route → page name mapping in `routes/web.php` + `routes/settings.php`.
- **Wayfinder** generates `resources/js/routes/` and `resources/js/actions/` (gitignored). After adding a named route, regenerate with `php artisan wayfinder:generate`.
- **`@/`** maps to `resources/js/` (tsconfig paths).
- **Layouts** auto-assigned by page name in `resources/js/app.tsx`: `welcome` → none, `auth/*` → AuthLayout, `settings/*` → AppLayout+SettingsLayout, rest → AppLayout.
- **Sidebar menu** defined in `resources/js/components/app-sidebar.tsx` as `NavItem[]`.
- **`.npmrc`** has `ignore-scripts=true` — npm install won't run build hooks.
- **`package.json`** has `"type": "module"` — CommonJS config files need `.cjs` extension (e.g. `ecosystem.config.cjs`).
- **CSRF token**: `<meta name="csrf-token">` added to `resources/views/app.blade.php` for manual fetch requests.

## Environment quirks

- `.env` uses **MySQL** (`DB_CONNECTION=mysql`, database `laravel`) not the default SQLite.
- Reverb runs on port **6001** (not 8080) due to VS Code using 8080. nginx proxies `/app` and `/apps` to `0.0.0.0:6001`.
- Domain `laravel.local` → nginx serving `/home/percy/store2026/public`.
- Echo + Pusher JS for frontend WebSocket client. Pusher client needs `cluster` option even with Reverb.

## Modules

### 1. Reverb (WebSocket / Realtime)
- **Stack**: Laravel Reverb, port **6001**, managed via PM2 (`ecosystem.config.cjs`)
- **Frontend**: Echo + Pusher JS client (needs `cluster` option even with Reverb)
- **Page**: `/reverb-monitor` → `resources/js/pages/reverb-monitor.tsx`
- **nginx**: proxies `/app` and `/apps` to `0.0.0.0:6001`
- **Commands**: `pm2 restart reverb`, `pm2 start ecosystem.config.cjs`

### 2. Evolution Instances (Admin read-only dashboard)
- **Route**: `/admin/evolution-instances` → `routes/admin.php`
- **Controller**: `app/Http/Controllers/Admin/AdminEvolutionInstanceController.php`
- **Service**: `app/Services/EvolutionApiService.php` — HTTP client wrapping Evolution API:
  - `fetchInstances()`, `fetchProfile()`, `fetchProfilePictureUrl()`, `fetchBusinessProfile()`
  - `findContacts()`, `fetchGroups()` (120s timeout)
  - `whatsappNumbers(instance, number)` — verifica si un número existe en WhatsApp
- **Config**: `config/evolution.php` — reads `EVOLUTION_SERVER_URL` and `EVOLUTION_API_KEY` from `.env`
- **Page**: `resources/js/pages/admin/evolution-instances/index.tsx` — cards grid with status badge, profile pic, stats
- **No DB** — data fetched live from Evolution API
- **Sidebar**: "Evolution Instances" (Smartphone icon) in `mainNavItems`

### 3. Evolution Webhooks (webhook receiver + log)
- **Route**: `POST /webhooks/evolution` → `routes/webhooks.php` (public, validates apikey header)
- **Controller**: `app/Http/Controllers/Webhooks/EvolutionWebhookController.php`
- **Model**: `app/Models/EvolutionWebhook` — `instance`, `event`, `payload` (JSON cast)
- **DataTable (Yajra)**: `app/DataTables/EvolutionWebhooksDataTable.php`
- **Migration**: `create_evolution_webhooks_table` — `id`, `instance`, `event`, `payload` (json), timestamps
- **Page tab**: "Webhook Log" inside `admin/evolution-instances/index.tsx` — expandable rows showing full JSON
- Fetched via same Yajra endpoint (`GET /admin/evolution-instances` with DataTables query params)

### 4. Contacts (Admin CRUD, standalone)
- **Route prefix**: `/admin/contacts`, defined in `routes/admin.php`
- **Controller**: `app/Http/Controllers/Admin/AdminContactController.php`:
  - `index` (Yajra), `create`, `store`, `show` (JSON detail + groups/members), `edit`, `update`, `destroy`
  - `fetchFromEvolution` — verifies number with `whatsappNumbers` first, then fetches profile/business data
  - `scanInstances`, `importBatch`, `scanGroups`, `importGroupMembers`
- **Model**: `app/Models/Contact`:
  - Fields: `name`, `phone` (nullable, unique for individuals), `whatsapp_id` (unique for groups), `email`, `notes`, `profile_pic_url`, `is_active`, `country` (ISO 3166-1 alpha-2), `type` ('individual'|'group'), `instance`, `group_jids` (json, array of group JIDs for members), `participant_count`, `is_community`, `owner`, `last_synced_at`
  - `Contact::detectCountry(?string $phone): ?string` — usa `giggsey/libphonenumber-for-php` para detectar país del número
  - `booted()` — auto-detecta `country` en `saving` event cuando cambia `phone`
  - Scopes: `individuals()`, `groups()`
  - Query builders: `groupContacts()` (groups matching `group_jids`), `members()` (individuals in a group)
- **Form Requests**:
  - `StoreContactRequest.php` — `name required`, groups validate `whatsapp_id` unique instead of `phone`
  - `UpdateContactRequest.php` — same + ignores current contact ID
- **DataTable (Yajra)**: `app/DataTables/ContactsDataTable.php`:
  - Server-side processing with search, sort, pagination
  - `editColumn('profile_pic_url')` transforms internal storage paths via `asset()`
  - `editColumn('country')` renders flag emoji + code
  - `rawColumns(['action', 'country'])`
  - Filters via `query()` → `request()->input('filters.*')` for country, type, is_active
  - Default sort by `id DESC`
- **Migrations**:
  - `create_contacts_table` + `add_unique_phone_to_contacts_table` + `add_whatsapp_id_to_contacts_table`
  - `add_type_to_contacts_table` (adds `type`, `instance`, `group_jids`, `participant_count`, `is_community`, `owner`, `last_synced_at`; makes `phone` nullable)
  - `add_country_to_contacts_table` — `country` VARCHAR(4) nullable after `is_active`
- **Commands**: `php artisan contacts:detect-countries` — parsea números existentes y actualiza `country`
- **Pages** (Inertia/React):
  - `resources/js/pages/admin/contacts/index.tsx` — DataTable-style UI:
    - "Show entries" selector (10/25/50/100), search, sortable headers, page navigation
    - 3 dropdown filters: Country (dynamic from DB), Type (Individual/Group), Status (Active/Inactive) + Clear button
    - Columns: ID, Name (+avatar), Phone, Email, Active, Country (🇧🇴 BO), Created, Type badge, Actions
    - Click any row opens `ContactDetailSheet` (right-side panel with full details)
    - `ConfirmDialog` for delete
  - `resources/js/pages/admin/contacts/create.tsx` — 4 tabs:
    - **Manual** — form with name, phone, email, notes, active
    - **From Evolution** — enter number → barra de progreso (verifying → fetching → downloading) → auto-fills form + country flag
    - **Import** — 2-step bulk import via `findContacts`
    - **From Groups** — scan via `fetchAllGroups?getParticipants=true`, select groups → import one-by-one sequentially with real-time progress bar
  - `resources/js/pages/admin/contacts/edit.tsx` — groups: read-only info card (name, photo, JID, country flag, owner, members count, description). Individuals: same UI as create but pre-filled.
- **ContactDetailSheet**: `resources/js/components/contacts/contact-detail-sheet.tsx`:
  - shadcn Sheet, right side, opens on row click in index
  - Fetches `GET /admin/contacts/{id}` for full details + associated groups/members
  - Shows: avatar, name, country flag, type badge, phone, email, WhatsApp ID, instance, owner, status, created date
  - For individuals: linked groups list. For groups: scrollable members list
- **Service**: `app/Services/EvolutionApiService.php`
- **Storage**: `php artisan storage:link` — images served from `/storage/`; all files stored flat in `storage/app/public/` root (no subdirectories)
- **DB migration**: old paths `contacts/uuid.jpg` migrated to `uuid.jpg` via REPLACE
- **CSRF excluded**: `admin/contacts/scan-groups`, `admin/contacts/import-group-members`
- **ConfirmDialog**: `resources/js/components/confirm-dialog.tsx` + `resources/js/hooks/use-confirm-dialog.ts` — shadcn Dialog replacing native `confirm()`
- **Sidebar**: "Contacts" (BookUser icon) in `mainNavItems`

### 5. Medios (File manager, no DB)
- **Route prefix**: `/admin/media`, defined in `routes/admin.php`
- **Controller**: `app/Http/Controllers/Admin/AdminMediaController.php` — index (Inertia), list (JSON paginated), upload, destroy
- **Model**: None — files scanned directly from filesystem
- **Storage**: `storage/app/public/` flat root — same folder as contact photos
- **Frontend**: `resources/js/pages/admin/media/index.tsx` — cards grid (responsive 2-5 cols), infinite scroll via IntersectionObserver, click card opens right Sheet (shadcn) with details:
  - Preview (image thumbnail or MIME icon)
  - Metadata: Type, Size, Modified, URL
  - Actions: Copy URL (clipboard), Download, Delete (ConfirmDialog)
- **Upload**: single file, max 100MB, via file picker
- **Pagination**: server-side JSON with 20 items per page, ordered by mtime desc
- **CSRF**: `<meta name="csrf-token">` added to `resources/views/app.blade.php`
- **Sidebar**: "Medios" (Images icon) in `mainNavItems`
- **Wayfinder routes**: `@/routes/admin/media` — exports `index`, `list`, `upload`, `destroy`

### 6. Users (Admin CRUD)
- **Route prefix**: `/admin/users`, defined in `routes/admin.php`
- **Controller**: `app/Http/Controllers/Admin/AdminUserController.php`
- **Middleware**: `app/Http/Middleware/AdminMiddleware.php` — checks `user.is_admin`, registered as alias `admin` in `bootstrap/app.php`
- **DataTable (yajra)**: `app/DataTables/UsersDataTable.php` — server-side processing; uses standard DataTables query params (`columns[i][data]`, `order[i][column]`, `search[value]`)
- **Form Requests**: `StoreUserRequest`, `UpdateUserRequest` in `app/Http/Requests/Admin/`
- **Pages** (Inertia/React): `resources/js/pages/admin/users/index.tsx` (fetch + sort + search + "Show entries" selector + pagination), `create.tsx`, `edit.tsx`
- **Sidebar**: `resources/js/components/app-sidebar.tsx` — "Users" in `mainNavItems`
- **Layout**: `admin/*` → AppLayout (registered in `resources/js/app.tsx`)
- **Wayfinder routes**: `@/routes/admin/users` — exports `index`, `create`, `store`, `edit`, `update`, `destroy`
- **Auth guard**: `is_admin` boolean on `users` table; shared prop `auth.can.access_admin` via `HandleInertiaRequests`

## Testing

- **Pest** framework (not plain PHPUnit). Tests in `tests/Feature/` and `tests/Unit/`.
- Feature tests auto-use `RefreshDatabase` trait (defined in `tests/Pest.php`).
- SQLite in-memory database in tests (`phpunit.xml`).
- No front-end tests exist.

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
