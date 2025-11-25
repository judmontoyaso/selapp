# 🚀 Deploy a Vercel con Notificaciones Push

## Pasos para Desplegar

### 1. **Configurar Variables de Entorno en Vercel**

Ve a tu proyecto en Vercel → **Settings** → **Environment Variables** y agrega:

```env
# Database
DATABASE_URL=tu_database_url_de_supabase

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dwwzqwcoqlasgvpniwiu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=Data_bucket

# VAPID Keys para Push (IMPORTANTE)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDsfSl1V7yscMU4qomO5-RnHio82laly12sOF8bEgjM5uIG8SEs3wRIbPdvK_psttnxmzQKgSDji8uzllwrvdEk
VAPID_PRIVATE_KEY=jKdDhCAVuRz_G5Mt2UOW_tAEw5ZKLlreLpW9yCpOOpE
VAPID_SUBJECT=mailto:juandavidsolorzano73@gmail.com

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu_nextauth_secret

# Cron Security
CRON_SECRET=tu_cron_secret
```

⚠️ **IMPORTANTE**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` debe tener el prefijo `NEXT_PUBLIC_` para que funcione en el cliente.

---

### 2. **Ejecutar la Migración SQL en Supabase**

Si aún no lo hiciste, ejecuta el archivo `setup_notifications_supabase.sql` en:
- Supabase Dashboard → SQL Editor
- Pega todo el contenido y ejecuta

---

### 3. **Hacer Push a GitHub**

```bash
git add .
git commit -m "✨ Add Web Push Notifications system"
git push origin dev
```

---

### 4. **Desplegar en Vercel**

Vercel detectará el push automáticamente y desplegará.

**O manualmente:**
```bash
npm install -g vercel
vercel --prod
```

---

### 5. **Verificar que Funciona**

1. **Abre tu app en producción:** `https://tu-dominio.vercel.app`

2. **Da permiso a las notificaciones** cuando aparezca el popup

3. **Prueba el endpoint de test:**
   ```
   https://tu-dominio.vercel.app/test-push.html
   ```

4. **Verifica los Cron Jobs en Vercel:**
   - Ve a tu proyecto → **Settings** → **Cron Jobs**
   - Deberías ver 5 cron jobs programados

---

## 🔑 Diferencias entre Local y Producción

### Local (localhost)
- Service Worker funciona sin HTTPS
- Las notificaciones son solo de prueba
- Los cron jobs NO se ejecutan

### Producción (Vercel)
- **Requiere HTTPS** (Vercel lo provee automáticamente)
- Service Worker se registra correctamente
- **Los cron jobs se ejecutan automáticamente**:
  - 6:00 AM - Versículo del día
  - 8:00 PM - Recordatorio de lectura
  - 9:00 PM - Recordatorio de diario
  - 9:34 PM - Notificación de prueba
  - 11:00 PM - Verificación de rachas

---

## 🐛 Troubleshooting en Producción

### Si no aparecen notificaciones:

1. **Verifica las variables de entorno:**
   ```bash
   vercel env ls
   ```

2. **Verifica que `NEXT_PUBLIC_VAPID_PUBLIC_KEY` esté configurada**
   - Debe tener el prefijo `NEXT_PUBLIC_`
   - Se puede acceder desde el navegador

3. **Revisa los logs de Vercel:**
   - Vercel Dashboard → Tu proyecto → **Logs**
   - Busca errores de `web-push` o `service-worker`

4. **Verifica el Service Worker en producción:**
   - Abre DevTools (F12)
   - Application → Service Workers
   - Debe aparecer como "activated and is running"

5. **Prueba manualmente:**
   ```bash
   curl https://tu-dominio.vercel.app/api/test-push
   ```

---

## ✅ Checklist de Deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` con prefijo correcto
- [ ] Migración SQL ejecutada en Supabase
- [ ] Push a GitHub/deploy en Vercel
- [ ] Service Worker registrado (verificar en DevTools)
- [ ] Permiso de notificaciones concedido
- [ ] Cron jobs visibles en Vercel Settings
- [ ] Test manual funciona: `/api/test-push`
- [ ] Notificaciones push aparecen en el dispositivo

---

## 📝 Comandos Útiles

```bash
# Ver variables de entorno
vercel env ls

# Agregar variable de entorno
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY

# Ver logs en tiempo real
vercel logs --follow

# Desplegar manualmente
vercel --prod
```

---

## 🎯 Próximos Pasos Después del Deploy

1. Prueba todas las notificaciones en diferentes horarios
2. Verifica que los cron jobs se ejecuten correctamente
3. Prueba en diferentes dispositivos (móvil, desktop)
4. Asegúrate de que las notificaciones persistan después de cerrar la app

¡Listo para producción! 🚀
