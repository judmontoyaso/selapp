# 🔔 Web Push Notifications - Configuración

## ¡Ya está implementado el sistema de notificaciones push!

### ✅ Lo que se agregó:

1. **Service Worker** (`public/service-worker.js`)
   - Escucha notificaciones push del servidor
   - Muestra avisos nativos en el dispositivo
   - Maneja clics en notificaciones

2. **Componente de Configuración** (`PushNotificationSetup.tsx`)
   - Solicita permiso al usuario automáticamente
   - Registra el service worker
   - Guarda la suscripción en la base de datos

3. **API de Suscripción** (`/api/push/subscribe`)
   - Guarda suscripciones de usuarios
   - Elimina suscripciones expiradas

4. **Librería de Envío** (`lib/webpush.ts`)
   - `sendPushNotification(userId, data)` - Enviar a un usuario
   - `sendPushToAll(data)` - Enviar a todos

5. **Integración Automática**
   - Todas las notificaciones ahora envían push automáticamente
   - Cuando creas una notificación, también se envía push

---

## 🚀 Pasos para Activar

### 1. **Agregar Claves VAPID al archivo `.env`**

Las claves ya están generadas:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJa66skvoE7CFZT8xIeZlu0s9-XWuDkDZ_HyEhRsPFjIWIviB5Rs-_HeWXVp8zuvN1uLZnY3kzfhwvi8Sk1jl6g
VAPID_PRIVATE_KEY=4P2HhunMVmbHu9jNKxymSAP7JAZy-dXfbbrZEiVcnm8
VAPID_SUBJECT=mailto:tu-email@example.com
```

**Copia estas líneas a tu archivo `.env`** (el real, no el .env.example)

### 2. **Ejecutar la Migración SQL en Supabase**

Si aún no lo hiciste, ejecuta el script `setup_notifications_supabase.sql` en Supabase Dashboard → SQL Editor.

### 3. **Reiniciar el Servidor**

```bash
npm run dev
```

### 4. **Probar en tu Navegador**

1. Abre la app: `http://localhost:3000`
2. Después de 3 segundos, verás un popup pidiendo permiso
3. Haz clic en "Activar"
4. El navegador te pedirá permiso para notificaciones - acepta
5. ¡Listo! Ahora recibirás notificaciones push

---

## 🧪 Probar las Notificaciones Push

### Método 1: Usar el endpoint de prueba

```bash
# En otra terminal mientras la app está corriendo:
curl http://localhost:3000/api/test-notification
```

Deberías ver aparecer un aviso en tu dispositivo con "🧪 Notificación de Prueba"

### Método 2: Desde Prisma Studio

```bash
npx prisma studio
```

Crea una notificación manualmente en la tabla `Notification` y verás que también se envía push.

---

## 📱 Cómo Funciona

1. **Usuario abre la app** → `PushNotificationSetup` solicita permiso
2. **Usuario acepta** → Se registra el service worker
3. **Service Worker se suscribe** → Envía suscripción al servidor
4. **Servidor guarda suscripción** en tabla `PushSubscription`
5. **Cuando se crea notificación** → Se envía a base de datos Y push al dispositivo
6. **Service Worker recibe push** → Muestra aviso nativo
7. **Usuario hace clic** → Abre la app en la URL especificada

---

## 🎯 Notificaciones Automáticas con Push

Todas estas ya envían push:

- ✅ Versículo del día (6:00 AM)
- ✅ Recordatorio de lectura (8:00 PM)
- ✅ Recordatorio de diario (9:00 PM)
- ✅ Notificación de prueba (9:34 PM)
- ✅ Logros y rachas (11:00 PM)

---

## 🔐 Seguridad

- Las claves VAPID son como credenciales - manténlas secretas
- El service worker solo funciona en HTTPS (o localhost)
- Las suscripciones expiran automáticamente y se limpian

---

## 📝 Uso Manual en tu Código

Para enviar una notificación push manual:

```typescript
import { sendPushNotification } from "@/lib/webpush";

// Enviar a un usuario
await sendPushNotification("user-id-here", {
  title: "¡Nuevo logro!",
  message: "Has completado 7 días seguidos de lectura",
  icon: "🏆",
  link: "/achievements",
  tag: "achievement"
});
```

---

## 🐛 Troubleshooting

### No aparece el popup de permiso
- Revisa la consola del navegador
- Asegúrate de estar autenticado
- Espera 3 segundos después de cargar

### No recibo notificaciones push
- Verifica que diste permiso en el navegador
- Revisa las claves VAPID en `.env`
- Mira la consola del servidor para errores
- En Chrome: `chrome://settings/content/notifications`

### Error "Missing VAPID keys"
- Asegúrate de tener las 3 variables en `.env`:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`

---

## ✨ ¡Eso es todo!

Ahora tu app enviará notificaciones push reales que aparecerán como avisos nativos en cualquier dispositivo, incluso cuando la app esté cerrada. 🎉
