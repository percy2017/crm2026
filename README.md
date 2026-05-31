<p align="center">
  <h1 align="center">CRM Multicanal - Asistido por IA</h1>
  <p align="center">Sistema de gestión de clientes (CRM) construido con Laravel + React + Inertia</p>
</p>

## Stack

| Capa | Tecnología |
|---|---|
| Backend | PHP 8.4+, Laravel 13 |
| Frontend | React 19, Inertia 3, TypeScript, Tailwind 4 |
| Base de datos | SQLite (por defecto) / MySQL |
| Autenticación | Laravel Fortify (login, registro, 2FA, passkeys) |
| Roles/Permisos | Spatie laravel-permission v8 |
| Tiempo real | Laravel Reverb (WebSocket) vía PM2 |
| Build | Vite 8, Rolldown |
| AI | Laravel AI SDK v0.7 + Ollama (LLM local) |

## Requisitos

- PHP 8.4+
- Node.js 22+
- npm 10+
- Composer 2+
- SQLite (extensiones `pdo_sqlite` + `sqlite3`) o MySQL
- Extensión `pcntl` (para Reverb) — NO debe estar en `disable_functions`

> **SQLite recomendado** — no requiere configuración de servidor de base de datos. También soporta MySQL si lo prefieres.

```bash
# 1. Clonar
git clone <repo> && cd crm2026

# 2. Instalar dependencias
composer install
npm install

# 3. Entorno
cp .env.example .env

# 4. Generar APP_KEY
php artisan key:generate

# 5. Crear base de datos SQLite (recomendado)
touch database/database.sqlite

# 6. Link de storage
php artisan storage:link

# 7. Migraciones + seeders
php artisan migrate --force
php artisan db:seed --force

# 8. Wayfinder (genera rutas JS)
php artisan wayfinder:generate

# 9. Build frontend
npm run build

# 10. Cache para producción
php artisan config:cache
```

Credenciales por defecto: `admin@admin.com` / `Admin2026$`

### Reverb (WebSocket)

Para funciones en tiempo real, inicia Reverb con PM2:

```bash
cp ecosystem.config.example.cjs ecosystem.config.cjs
# Editar ecosystem.config.cjs si la ruta de php es diferente
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

## Módulos

### Evolution API (WhatsApp)
Integración con Evolution API para gestión de WhatsApp. Incluye webhooks (recepción automática de mensajes), envío de texto/multimedia, y escaneo de contactos desde las instancias.

### Contactos
CRUD completo con DataTables (Yajra), búsqueda server-side. Soporta contactos individuales y grupos WhatsApp. Importación automática desde Evolution API.

### Entradas (Chat UI)
Interfaz de chat WhatsApp con lista de conversaciones, búsqueda, envío de texto/multimedia/audio. Integración con Medios para subida de archivos.

### Medios
Gestor de archivos plano (sin base de datos). Subida, previsualización y borrado de archivos en `storage/app/public/`. Usado por Entradas y AI Agent.

### WooCommerce (POS + Ecommerce)
Integración con WooCommerce via REST API. Incluye Punto de Venta (POS) con ventas directas y suscripciones, gestión de productos, pedidos, y calendario de suscripciones. Sin tablas locales — todo via API de WooCommerce.

### Deals (Pipeline CRM)
Kanban de ventas con arrastrar y soltar via `@hello-pangea/dnd`. 5 etapas configurables: Nuevo → Cotizado → Negociación → Ganado → Perdido. Vista Kanban y Tabla (DataTables Yajra). Gestión de etapas desde la UI (agregar/editar/eliminar/reordenar).

### Roles & Permisos
Administración de roles vía Spatie. DataTable server-side con conteo de usuarios. Rol `admin` protegido contra modificación/eliminación.

### Usuarios
CRUD de usuarios con DataTable server-side. Los permisos se manejan via roles (Spatie).

### AI Agent
Asistente AI flotante disponible en todas las páginas.

## Testing

```bash
composer test
```

Pest con SQLite en memoria. Tests en `tests/Feature/` y `tests/Unit/`.

## Licencia

Propietario.
