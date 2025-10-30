# Guía de Despliegue en Vercel - selapp

## Pasos para desplegar en Vercel

### 1. Preparar el Repositorio

Asegúrate de que todos los cambios estén commiteados y pusheados a GitHub:

```powershell
git add .
git commit -m "Preparar para deploy en Vercel"
git push origin main
```

### 2. Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "Add New" → "Project"
3. Importa tu repositorio de GitHub `judmontoyaso/selapp`
4. Configura el proyecto:
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `./` (por defecto)
   - **Build Command**: `npm run build` (por defecto)
   - **Output Directory**: `.next` (por defecto)
   - **Install Command**: `npm install` (por defecto)

### 3. Configurar Variables de Entorno

**IMPORTANTE**: Antes de desplegar, debes añadir TODAS estas variables de entorno en Vercel.

Ve a **Project Settings** → **Environment Variables** y añade:

#### Database (Supabase PostgreSQL)
```
DATABASE_URL
```
Valor: `postgresql://postgres:.Jd0521ms.@db.dwwzqwcoqlasgvpniwiu.supabase.co:5432/postgres`

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL
```
Valor: `https://dwwzqwcoqlasgvpniwiu.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3d3pxd2NvcWxhc2d2cG5pd2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDkwMjIsImV4cCI6MjA3NzQyNTAyMn0.2UUBoyVnEmGfABQcoqGZ6gOuQJBo5GyqCfZqldnbWRI`

```
SUPABASE_SERVICE_ROLE_KEY
```
Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3d3pxd2NvcWxhc2d2cG5pd2l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg0OTAyMiwiZXhwIjoyMDc3NDI1MDIyfQ.2zjRvVs1ZcTT1EdCHwloWSPWcpMUkxUFcBK2IUAEda4`

#### Storage Bucket
```
NEXT_PUBLIC_STORAGE_BUCKET
```
Valor: `Data_bucket`

#### Web Push (VAPID)
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY
```
Valor: `BDsfSl1V7yscMU4qomO5-RnHio82laly12sOF8bEgjM5uIG8SEs3wRIbPdvK_psttnxmzQKgSDji8uzllwrvdEk`

```
VAPID_PRIVATE_KEY
```
Valor: `jKdDhCAVuRz_G5Mt2UOW_tAEw5ZKLlreLpW9yCpOOpE`

```
VAPID_SUBJECT
```
Valor: `mailto:juandavidsolorzano73@gmail.com`

#### NextAuth
```
NEXTAUTH_URL
```
Valor: `https://selapp.vercel.app` (o tu dominio personalizado)

```
NEXTAUTH_SECRET
```
Valor: `f116217313ba3c607d0a13718601cbc63f4efdb192be5f3f84bd180ccab531bb`

### 4. Configurar el Entorno

Para cada variable de entorno, selecciona los entornos donde debe estar disponible:
- ✅ **Production** (obligatorio)
- ✅ **Preview** (recomendado para pruebas)
- ⬜ **Development** (opcional)

### 5. Ejecutar Migraciones de Base de Datos

**ANTES del primer deploy**, ejecuta las migraciones desde tu máquina local:

```powershell
# Asegúrate de que DATABASE_URL apunta a tu DB de producción (Supabase)
npx prisma migrate deploy
npx prisma generate
```

Esto creará las tablas necesarias en tu base de datos de Supabase.

### 6. Deploy

Una vez configuradas las variables de entorno:

1. Click en **"Deploy"** en Vercel
2. Espera a que el build complete (2-3 minutos)
3. Vercel te dará una URL: `https://selapp.vercel.app`

### 7. Verificar el Deploy

Visita tu aplicación en la URL proporcionada y verifica:

- ✅ La página principal carga correctamente
- ✅ Las rutas `/sermons`, `/devotionals`, `/notes` funcionan
- ✅ Las imágenes se suben correctamente a Supabase Storage
- ✅ Las notificaciones push funcionan (en HTTPS)

## Troubleshooting

### Error: "Failed to collect page data"
- Asegúrate de que TODAS las variables de entorno están configuradas en Vercel
- Verifica que `DATABASE_URL` sea accesible desde los servidores de Vercel
- Revisa los logs de build en Vercel para más detalles

### Error: "Prisma Client not generated"
- El script `postinstall` en `package.json` ejecuta automáticamente `prisma generate`
- Si falla, verifica que `prisma` está en `devDependencies`

### PWA no se instala
- Asegúrate de que los íconos existen en `public/`:
  - `icon-192x192.png`
  - `icon-512x512.png`
- Vercel provee HTTPS automáticamente (necesario para PWA)

### Notificaciones Push no funcionan
- VAPID keys deben estar configuradas correctamente
- Las notificaciones push solo funcionan sobre HTTPS
- Verifica que el Service Worker esté registrado

### Base de datos no conecta
- Verifica que Supabase permite conexiones desde cualquier IP
- Ve a Supabase Dashboard → Settings → Database → Connection Pooling
- Considera usar Connection Pooling para evitar límites de conexiones

## Comandos Útiles

### Redesplegar después de cambios
```powershell
git add .
git commit -m "Descripción de cambios"
git push origin main
```
Vercel detectará el push y redesplegará automáticamente.

### Ver logs en tiempo real
Ve a tu proyecto en Vercel → Deployments → Click en el deploy actual → View Function Logs

### Rollback a versión anterior
Ve a Deployments → Click en un deploy anterior → "Promote to Production"

## Dominios Personalizados

Para usar un dominio propio (ej. `selapp.com`):

1. Ve a Project Settings → Domains
2. Añade tu dominio
3. Configura los DNS según las instrucciones de Vercel
4. Actualiza `NEXTAUTH_URL` al nuevo dominio

## Optimizaciones Recomendadas

### Caching
Vercel cachea automáticamente assets estáticos y páginas generadas.

### Edge Functions
Considera mover algunas API routes a Edge Functions para mejor rendimiento global.

### Analytics
Activa Vercel Analytics en Project Settings → Analytics para métricas de rendimiento.

### Monitoring
Configura alertas en Settings → Alerts para recibir notificaciones si el deploy falla.

## Seguridad

### Rotar Secrets
Si necesitas cambiar algún secret (ej. NEXTAUTH_SECRET):

1. Genera un nuevo valor
2. Actualiza la variable en Vercel
3. Redeploy
4. **Nota**: Todos los usuarios deberán volver a iniciar sesión

### Backup de Base de Datos
Configura backups automáticos en Supabase:
- Ve a Supabase Dashboard → Database → Backups
- Configura backups diarios

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Supabase](https://supabase.com/docs)

---

**¡Tu aplicación selapp está lista para producción!** 🚀
