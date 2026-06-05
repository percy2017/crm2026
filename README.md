<p align="center">
  <h1 align="center">CRM Multicanal — Asistido por IA</h1>
  <p align="center">
    CRM moderno con integración WhatsApp, WooCommerce POS, chat en tiempo real y automatizaciones
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-13-FF2D20" alt="Laravel 13" />
  <img src="https://img.shields.io/badge/React-19-61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/Inertia-3-8250DF" alt="Inertia 3" />
  <img src="https://img.shields.io/badge/Reverb-WebSocket-FF2D20" alt="Reverb WebSocket" />
</p>

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Laravel 13 (PHP 8.3) |
| **Frontend** | Inertia 3 + React 19 + TypeScript (strict) |
| **Estilos** | Tailwind CSS 4 (CVA, tailwind-merge, tw-animate-css) |
| **Tiempo real** | Laravel Reverb (WebSocket vía PM2) |
| **Base de datos** | MySQL (producción), SQLite in-memory (tests) |
| **Autenticación** | Laravel Fortify + Passkeys |
| **Permisos** | spatie/laravel-permission |
| **APIs externas** | Evolution API (WhatsApp), WooCommerce API |
| **SEO/Rutas** | Wayfinder (type-safe route helpers) |

## Módulos

### 📨 Inbox (WhatsApp/Evolution)
- Chat en tiempo real vía WebSocket (Reverb)
- Recepción y envío de mensajes, imágenes, videos, audios y documentos
- Reacciones a mensajes (emojis)
- Estados de mensaje (enviado, entregado, leído)
- Indicador de conexión en sidebar (🟢 abierto, 🔴 desconectado, ⚠️ stale)
- Enlaces con preview (incluye mapas estáticos para Google Maps)
- Respuestas rápidas con variables `{nombre}`, `{telefono}` y adjuntos multimedia

### 🛒 WooCommerce POS
- Punto de venta integrado con WooCommerce
- Búsqueda de productos, categorías, variaciones
- Carrito con edición de precios y cantidades
- Búsqueda de clientes CRM y descuentos manuales
- Creación de pedidos con metadatos personalizados
- Historial de órdenes recientes
- Calendario de suscripciones
- Impresión de tickets (sin bloqueo TrustedScript)

### 👥 Contactos
- CRUD completo con importación CSV/WhatsApp
- Sincronización desde grupos de WhatsApp
- Detección de país y negocio
- Limpieza de contactos inválidos

### 🤖 AI Agent
- Asistente conversacional integrado en el chat
- Responde usando el contexto del CRM
- Generación de respuestas automáticas

### ⏰ Cron Jobs (Tareas Programadas)
- Gestión desde la UI (DB-driven scheduling)
- Frecuencias: cada minuto, 5/10/15/30 min, horaria, diaria, semanal, mensual
- Historial de ejecuciones con output y duración
- Ejecución manual desde la interfaz
- Comandos disponibles: `inbox:health-check`, `contacts:clean`, `inbox:backup`, etc.

### 📁 Medios
- Gestor de archivos multimedia
- Upload, preview y eliminación
- Estadísticas de almacenamiento

## Requisitos

- PHP 8.3+
- Node.js 20+
- Composer 2
- MySQL 8+
- PM2 (para Reverb)

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd <project>

# Instalar dependencias PHP
composer install

# Instalar dependencias frontend
npm install

# Copiar entorno y generar key
cp .env.example .env
php artisan key:generate

# Configurar .env (DB, Evolution API, WooCommerce, Reverb)

# Migrar base de datos
php artisan migrate

# Crear enlace simbólico storage
php artisan storage:link

# Compilar assets
npm run build

# Iniciar servidor de desarrollo
composer dev
```

## Comandos útiles

```bash
# Desarrollo (server + queue + logs + Vite)
composer dev

# Tests
composer test

# Lint PHP
composer lint
composer lint:check

# Lint JS/TS
npm run lint
npm run lint:check

# TypeScript check
npm run types:check

# Build producción
npm run build
```

## Tiempo Real (WebSocket)

El servidor Reverb se ejecuta vía PM2:

```bash
pm2 start ecosystem.config.cjs
```

Canales:
- `private-entradas.{instance}` — mensajes y estados de cada instancia WhatsApp
- `private-inboxes.global` — estado de conexión de todas las instancias

## APIs Externas

| API | Config | Propósito |
|-----|--------|-----------|
| **Evolution API** | `config/evolution.php` | Envío/recepción de mensajes WhatsApp |
| **WooCommerce** | `config/woocommerce.php` | POS, productos, órdenes, suscripciones |

## Licencia

MIT