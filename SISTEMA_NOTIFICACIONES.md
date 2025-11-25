# 🔔 Sistema de Notificaciones - Selapp

## Descripción

Sistema completo de notificaciones en tiempo real para la aplicación Selapp que incluye:
- ✅ Notificaciones dentro de la app (bell icon)
- ✅ Centro de notificaciones completo
- ✅ Notificaciones automáticas programadas
- ✅ Sistema de logros y rachas
- ✅ Soporte para notificaciones push (preparado)

---

## 🚀 Instalación y Configuración

### Paso 1: Ejecutar Migración de Base de Datos

1. **Abre Supabase Dashboard**: https://supabase.com/dashboard
2. **Ve a tu proyecto** → **SQL Editor**
3. **Copia y pega** el contenido del archivo `setup_notifications_supabase.sql`
4. **Ejecuta** (botón Run o Ctrl+Enter)

Esto creará:
- Tabla `Notification` con índices optimizados
- Tabla `PushSubscription` para notificaciones push futuras
- Políticas RLS para seguridad
- Relaciones con la tabla `User`

### Paso 2: Regenerar Prisma Client

```bash
npx prisma generate
```

### Paso 3: (Opcional) Configurar Cron Jobs en Vercel

Para notificaciones automáticas, crea un archivo `vercel.json` en la raíz:

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications?task=verse-of-day",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/notifications?task=reading-reminder",
      "schedule": "0 20 * * *"
    },
    {
      "path": "/api/cron/notifications?task=diary-reminder",
      "schedule": "0 21 * * *"
    },
    {
      "path": "/api/cron/notifications?task=check-streaks",
      "schedule": "0 23 * * *"
    }
  ]
}
```

**Horarios programados:**
- `6:00 AM` - Notificación del versículo del día
- `8:00 PM` - Recordatorio para leer la Biblia
- `9:00 PM` - Recordatorio para escribir en el diario
- `11:00 PM` - Verificar rachas y logros

### Paso 4: Configurar Variable de Entorno (Seguridad)

Agrega en Vercel → Settings → Environment Variables:

```bash
CRON_SECRET="tu-secreto-aleatorio-aqui"
```

Genera un secreto aleatorio con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📱 Componentes Creados

### 1. NotificationBell (Campanita)
- Icono de campana en el header (top-right)
- Badge con contador de notificaciones sin leer
- Dropdown con últimas 10 notificaciones
- Actualización automática cada 30 segundos

**Ubicación**: `src/components/NotificationBell.tsx`

### 2. Página de Notificaciones
- Vista completa de todas las notificaciones
- Filtros: Todas / No leídas
- Acciones: Marcar como leídas, Eliminar
- Timestamps relativos ("Hace 5 min")

**Ruta**: `/notifications`
**Ubicación**: `src/app/notifications/page.tsx`

### 3. API de Notificaciones
- `GET /api/notifications` - Obtener notificaciones
- `POST /api/notifications` - Crear notificación
- `PATCH /api/notifications` - Marcar como leídas
- `DELETE /api/notifications` - Eliminar notificaciones

**Ubicación**: `src/app/api/notifications/route.ts`

### 4. Helpers de Notificaciones
- Funciones para crear notificaciones automáticas
- Sistema de logros y rachas
- Recordatorios programados

**Ubicación**: `src/lib/notifications.ts`

### 5. Cron Endpoint
- Endpoint para ejecutar tareas programadas
- Protegido con API key

**Ubicación**: `src/app/api/cron/notifications/route.ts`

---

## 🎯 Tipos de Notificaciones

### 1. Versículo del Día
- **Tipo**: `verse_of_day`
- **Icono**: 📖
- **Cuándo**: Diariamente a las 6:00 AM
- **Link**: `/` (página principal)

### 2. Recordatorio de Lectura
- **Tipo**: `reading_reminder`
- **Icono**: 📚
- **Cuándo**: 8:00 PM si el usuario no ha leído hoy
- **Link**: `/` (para registrar lectura)

### 3. Recordatorio de Diario
- **Tipo**: `diary_reminder`
- **Icono**: ✍️
- **Cuándo**: 9:00 PM si el usuario no ha escrito hoy
- **Link**: `/notes` (página de diario)

### 4. Logros
- **Tipo**: `achievement`
- **Icono**: 🏆
- **Cuándo**: Al alcanzar hitos (rachas, semillas)
- **Ejemplos**:
  - 🔥 Racha de 7 días consecutivos
  - 🌱 100 semillas de fe
  - 🌳 500 semillas de fe
  - 🏆 1000 semillas de fe

### 5. Personalizada
- **Tipo**: `custom`
- **Icono**: 🔔 (o el que se especifique)
- **Cuándo**: Cuando se crea manualmente

---

## 💻 Uso en el Código

### Crear una notificación manualmente

```typescript
import { createNotification } from "@/lib/notifications";

await createNotification({
  userId: "user-id-here",
  type: "custom",
  title: "¡Bienvenido!",
  message: "Gracias por unirte a Selapp",
  icon: "👋",
  link: "/",
});
```

### Enviar notificación de logro

```typescript
import { notifyAchievement } from "@/lib/notifications";

await notifyAchievement(userId, {
  title: "🎉 ¡Primera lectura!",
  message: "Has completado tu primera lectura bíblica",
  icon: "🎉",
});
```

### Notificar a todos los usuarios

```typescript
import { notifyVerseOfTheDay } from "@/lib/notifications";

await notifyVerseOfTheDay();
```

---

## 🧪 Pruebas Manuales

### 1. Crear notificación de prueba desde SQL

```sql
-- Reemplaza 'USER_ID_AQUI' con un ID real de tu tabla User
INSERT INTO "Notification" ("id", "userId", "type", "title", "message", "icon", "link", "read")
VALUES (
  'test-' || gen_random_uuid()::text,
  'USER_ID_AQUI',
  'custom',
  '🎉 Prueba de Notificación',
  'Esta es una notificación de prueba del sistema',
  '🎉',
  '/',
  false
);
```

### 2. Ejecutar cron manualmente

```bash
# En desarrollo (sin API key)
curl http://localhost:3000/api/cron/notifications?task=all

# En producción (con API key)
curl -H "Authorization: Bearer TU_CRON_SECRET" \
  https://tu-app.vercel.app/api/cron/notifications?task=all
```

### 3. Probar notificación desde la app

```typescript
// En cualquier API route o server component
import { createNotification } from "@/lib/notifications";

const user = await prisma.user.findUnique({
  where: { email: session.user.email },
});

await createNotification({
  userId: user.id,
  type: "achievement",
  title: "🎯 ¡Logro Desbloqueado!",
  message: "Has completado todas las lecturas de la semana",
  icon: "🎯",
  link: "/",
});
```

---

## 📊 Consultas Útiles

### Ver todas las notificaciones de un usuario

```sql
SELECT * FROM "Notification"
WHERE "userId" = 'USER_ID_AQUI'
ORDER BY "createdAt" DESC;
```

### Contar notificaciones no leídas

```sql
SELECT COUNT(*) as unread_count
FROM "Notification"
WHERE "userId" = 'USER_ID_AQUI'
AND "read" = false;
```

### Eliminar notificaciones antiguas (más de 30 días)

```sql
DELETE FROM "Notification"
WHERE "createdAt" < NOW() - INTERVAL '30 days'
AND "read" = true;
```

---

## 🔮 Futuras Mejoras

### Notificaciones Push (Web Push)
- Ya está preparada la tabla `PushSubscription`
- Implementar service worker
- Usar Web Push API
- Configurar VAPID keys

### Preferencias de Usuario
- Tabla `NotificationPreferences`
- Permitir habilitar/deshabilitar tipos de notificaciones
- Configurar horarios personalizados

### Notificaciones por Email
- Integrar con servicio de email (SendGrid, Resend)
- Resumen diario/semanal por email

### Analytics
- Tabla `NotificationAnalytics`
- Tracking de clicks y conversiones
- A/B testing de mensajes

---

## 🐛 Troubleshooting

### Las notificaciones no aparecen

1. Verifica que las tablas existen en Supabase
2. Verifica que las políticas RLS están configuradas
3. Revisa la consola del navegador por errores
4. Verifica que el usuario está autenticado

### El contador no se actualiza

- El componente se actualiza cada 30 segundos
- Refresca la página manualmente
- Verifica que `/api/notifications` funciona correctamente

### Los cron jobs no se ejecutan

1. Verifica que `vercel.json` está en la raíz del proyecto
2. Verifica que el `CRON_SECRET` está configurado en Vercel
3. Revisa los logs de Vercel: Dashboard → Deployments → Logs
4. Los cron jobs solo funcionan en producción (no en development)

---

## 📝 Checklist de Implementación

- [x] Modelo de base de datos (`Notification`, `PushSubscription`)
- [x] Migración SQL para Supabase
- [x] API endpoints CRUD para notificaciones
- [x] Componente `NotificationBell`
- [x] Página de notificaciones (`/notifications`)
- [x] Helpers para crear notificaciones automáticas
- [x] Sistema de logros y rachas
- [x] Endpoint de cron jobs
- [ ] Configurar cron jobs en Vercel (`vercel.json`)
- [ ] Agregar `CRON_SECRET` en variables de entorno
- [ ] Probar notificaciones en producción

---

## 🎉 ¡Listo!

El sistema de notificaciones está completamente funcional. Los usuarios ahora recibirán:
- Notificaciones del versículo del día
- Recordatorios para leer y escribir en el diario
- Notificaciones de logros y rachas
- Pueden ver y gestionar todas sus notificaciones

**Próximo paso**: Ejecuta la migración SQL en Supabase y regenera Prisma client.
