<p align="center">
  <h1 align="center">CRM2026</h1>
  <p align="center">Sistema de gestión de clientes (CRM) construido con Laravel + React + Inertia</p>
</p>

## Stack

| Capa | Tecnología |
|---|---|
| Backend | PHP 8.4+, Laravel 13 |
| Frontend | React 19, Inertia 3, TypeScript, Tailwind 4 |
| Base de datos | SQLite (por defecto) / MySQL |
| Autenticación | Laravel Fortify (login, registro, 2FA, passkeys) |
| Tiempo real | Laravel Reverb (WebSocket) vía PM2 |
| Build | Vite 8, Rolldown |

## Requisitos

- PHP 8.4+
- Node.js 22+
- npm 10+
- Composer 2+
- SQLite (extensiones `pdo_sqlite` + `sqlite3`) o MySQL
- Extensión `pcntl` (para Reverb) — NO debe estar en `disable_functions`

## Instalación

```bash
# 1. Clonar
git clone <repo> && cd crm2026

# 2. Dependencias PHP
composer install --no-dev --optimize-autoloader

# 3. Entorno
cp .env.example .env
# Editar .env con tus valores (ver variables de entorno abajo)

# 4. Generar APP_KEY
php artisan key:generate

# 5. Crear base de datos SQLite (omitir si usas MySQL)
touch database/database.sqlite

# 6. Link de storage
php artisan storage:link

# 7. Migraciones
php artisan migrate --force

# 8. Frontend
npm install
php artisan wayfinder:generate
npm run build

# 9. Cache para producción
php artisan config:cache
```

### Reverb (WebSocket)

Para funciones en tiempo real, inicia Reverb con PM2:

```bash
pm2 start ecosystem.config.cjs
```

Elige un puerto libre y configúralo en `.env`:

```env
REVERB_SERVER_PORT=<PUERTO_LIBRE>
```

Agrega esto a tu nginx (usando el mismo puerto):

```nginx
location /app {
    proxy_pass http://0.0.0.0:<PUERTO_LIBRE>;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}
```

> Si Reverb falla con "Signals are not supported", las funciones `pcntl` están deshabilitadas en tu php.ini. Solución:
> ```bash
> sed -i 's/^disable_functions =.*/disable_functions =/' /etc/php/8.4/cli/php.ini
> ```

### Si usas MySQL

Cambia en `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crm2026
DB_USERNAME=root
DB_PASSWORD=
```

## Variables de Entorno

| Variable | Descripción | Por defecto |
|---|---|---|
| `APP_URL` | URL de la aplicación | `http://localhost` |
| `DB_CONNECTION` | Motor de base de datos | `sqlite` |
| `BROADCAST_CONNECTION` | Driver de broadcasting | `log` |
| `REVERB_SERVER_PORT` | Puerto interno de Reverb | (elegir puerto libre) |
| `REVERB_HOST` | Host público de Reverb | — |
| `EVOLUTION_SERVER_URL` | URL de Evolution API | — |
| `EVOLUTION_API_KEY` | API Key de Evolution | — |

Generar credenciales Reverb:

```bash
php -r "
echo 'REVERB_APP_ID=' . rand(100000, 999999) . PHP_EOL;
echo 'REVERB_APP_KEY=' . bin2hex(random_bytes(32)) . PHP_EOL;
echo 'REVERB_APP_SECRET=' . bin2hex(random_bytes(32)) . PHP_EOL;
"
```

## Comandos Disponibles

| Acción | Comando |
|---|---|
| Servidores de desarrollo | `composer dev` |
| Compilar frontend | `npm run build` |
| TypeScript check | `npm run types:check` |
| PHP lint (Pint) | `composer lint` |
| JS/TS lint | `npm run lint` |
| Formatear código | `npm run format` |
| Tests | `composer test` |
| CI check completo | `composer ci:check` |
| Migrar base de datos | `php artisan migrate` |

## Estructura del Proyecto

```
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Controladores CRUD de administración
│   │   └── Webhooks/       # Receptores de webhooks
│   ├── Models/
│   ├── Services/           # ImageProxyService, EvolutionApiService
│   └── DataTables/         # Clases Yajra DataTable
├── config/
├── database/migrations/
├── resources/js/
│   ├── pages/              # Componentes Inertia (páginas)
│   ├── components/         # Componentes reutilizables
│   └── app.tsx             # Asignación automática de layouts
├── routes/
│   ├── admin.php           # Rutas de administración
│   └── webhooks.php        # Rutas de webhooks
└── public/build/           # Assets compilados (gitignorado)
```

## Arquitectura

- **Páginas**: Todas son componentes Inertia en `resources/js/pages/`. El mapeo ruta → página está en `routes/web.php`.
- **Layouts**: Asignación automática por nombre de página en `app.tsx`:
  - `welcome/*` → sin layout
  - `auth/*` → AuthLayout
  - `settings/*` → AppLayout + SettingsLayout
  - `admin/*` y el resto → AppLayout
- **Wayfinder**: Genera `resources/js/routes/` y `resources/js/actions/` (gitignorado). Regenerar con `php artisan wayfinder:generate` después de agregar rutas con nombre.
- **CSRF**: `<meta name="csrf-token">` en `app.blade.php` para peticiones fetch manuales.

## Módulos

### Evolution Instances
Dashboard de solo lectura para instancias de Evolution API. Sin base de datos.

### Evolution Webhooks
Receptor de webhooks en `POST /webhooks/evolution`. Logs en tabla `evolution_webhooks`.

### Contactos
CRUD completo con DataTables (Yajra). Soporta contactos individuales y grupos. Importación desde Evolution API.

### Medios
Gestor de archivos plano. Sin base de datos — archivos leídos directamente de `storage/app/public/`.

### Usuarios
Administración de usuarios con DataTable server-side.

## Tests

```bash
composer test
```

Usa Pest con base de datos SQLite en memoria.

## Licencia

Propietario.
