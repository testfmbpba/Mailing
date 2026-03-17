# MailingBP — Plataforma de Email Marketing

Portal web fullstack para envío, tracking y gestión de campañas de email.

FM

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Email:** Resend API
- **Deploy:** Vercel

## Setup rápido

### 1. Clonar y configurar entorno

```bash
cp .env.local.example .env.local
# Completar con tus credenciales de Supabase y Resend
```

### 2. Configurar Supabase

1. Ir a [supabase.com](https://supabase.com) → Nuevo proyecto
2. Abrir **SQL Editor**
3. Pegar y ejecutar el contenido de `supabase_setup.sql`

### 3. Instalar y correr

```bash
npm install
npm run dev
```

### 4. Crear primer admin

1. Registrarse en `/register`
2. Ejecutar en Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
| `RESEND_API_KEY` | API key de [Resend](https://resend.com) para enviar emails |
| `NEXT_PUBLIC_APP_URL` | URL pública de tu app (para tracking pixel) |
| `CRON_SECRET` | Secret para proteger el endpoint del scheduler |

## Funcionalidades

### Usuarios autenticados
- 📧 **Templates**: Subir HTML con variables `{{nombre}}`, `{{empresa}}`, etc.
- 👥 **Contactos**: Importar bases CSV/Excel con cualquier columna
- 📨 **Campañas**: Crear, enviar ahora o programar
- 📊 **Tracking**: Ver estado por destinatario (enviado, abierto, fallido)
- 💾 **Exportar**: Descargar resultados en Excel

### Admin
- 🛡️ Panel de administración
- 👤 Gestionar roles y estados de usuarios
- 📈 Métricas globales de todas las campañas

## Scheduler (envíos programados)

El endpoint `/api/scheduler/process` es llamado automáticamente por Vercel Cron cada 5 minutos (configurado en `vercel.json`).

Para producción, agregar `CRON_SECRET` en las variables de Vercel y configurar el header en el dashboard de Vercel.

## Tracking de aperturas

Cada email incluye un píxel de tracking 1x1 transparente. Cuando el destinatario abre el email, el servidor registra:
- Timestamp exacto de apertura
- Actualización del contador de la campaña

## Deploy en Vercel

```bash
# Conectar repo a Vercel, agregar variables de entorno, deploy automático
vercel --prod
```
