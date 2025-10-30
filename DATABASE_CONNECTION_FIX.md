# 🔧 Fix: Database Connection Error en Vercel

## Problema Identificado

```
Can't reach database server at `db.dwwzqwcoqlasgvpniwiu.supabase.co:5432`
```

Este error ocurre porque **Vercel usa funciones serverless** que necesitan una **conexión con pooling**, no una conexión directa.

---

## ✅ Solución: Usar Connection Pooler de Supabase

### Paso 1: Obtener el Connection String con Pooling

1. Ve a **Supabase Dashboard** → **Project Settings** → **Database**
2. Busca la sección **"Connection string"**
3. Selecciona la pestaña **"Connection Pooling"** (NO "Session Mode")
4. Copia el **Connection Pooling URL** que se ve así:

```bash
# ❌ INCORRECTO (Session Mode - NO usar en Vercel):
postgresql://postgres.dwwzqwcoqlasgvpniwiu:[PASSWORD]@db.dwwzqwcoqlasgvpniwiu.supabase.co:5432/postgres

# ✅ CORRECTO (Connection Pooling - Usar en Vercel):
postgresql://postgres.dwwzqwcoqlasgvpniwiu:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Diferencias clave**:
- Puerto: `6543` (pooler) en lugar de `5432` (directo)
- Host: `pooler.supabase.com` en lugar de `db.supabase.co`
- Query param: `?pgbouncer=true` al final

### Paso 2: Actualizar Variables de Entorno en Vercel

1. Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Busca `DATABASE_URL`
3. Edita y reemplaza con el **Connection Pooling URL**
4. Asegúrate de que aplica a **Production, Preview, y Development**
5. Click en **Save**

### Paso 3: Redeploy

```bash
# Opción A: Redeploy desde Vercel Dashboard
# Ve a Deployments → Click en los tres puntos → Redeploy

# Opción B: Hacer un commit y push
git commit --allow-empty -m "Trigger redeploy after DB config fix"
git push
```

---

## Verificación Local (Opcional)

Si quieres probar localmente con el pooler:

1. Actualiza tu archivo `.env` local:

```bash
# .env
DATABASE_URL="postgresql://postgres.dwwzqwcoqlasgvpniwiu:[TU_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

2. Regenera el Prisma Client:

```bash
npx prisma generate
```

3. Prueba la conexión:

```bash
npx prisma db execute --stdin <<< "SELECT 1;"
```

Si responde correctamente, la conexión funciona.

---

## ⚠️ Limitaciones del Connection Pooler

El pooler de Supabase usa **pgBouncer en modo transacción**, lo que tiene algunas limitaciones:

### ❌ NO Soportado con Pooler:
- Prepared statements con nombre
- `LISTEN/NOTIFY`
- Cursores con `DECLARE`
- Large objects

### ✅ Sí Soportado:
- Todas las queries normales de Prisma
- Transacciones
- Migrations (aunque mejor correrlas en directo)

**Solución para Migrations**:
Usa el **Session Mode URL** (puerto 5432) solo para correr migrations localmente:

```bash
# .env.local (para migrations)
MIGRATION_DATABASE_URL="postgresql://postgres.dwwzqwcoqlasgvpniwiu:[PASSWORD]@db.dwwzqwcoqlasgvpniwiu.supabase.co:5432/postgres"
DATABASE_URL="postgresql://postgres.dwwzqwcoqlasgvpniwiu:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

```bash
# Correr migrations con Session Mode
npx prisma migrate dev --schema=./prisma/schema.prisma
```

---

## 🔍 Debugging Adicional

Si después del fix aún no funciona, verifica:

### 1. Verifica que Supabase esté activo

```bash
# Desde PowerShell
Test-NetConnection -ComputerName aws-0-us-east-1.pooler.supabase.com -Port 6543
```

Debería mostrar `TcpTestSucceeded: True`

### 2. Verifica las variables de entorno en Vercel

Ve a **Vercel** → **Settings** → **Environment Variables** y confirma:

```
DATABASE_URL = postgresql://postgres.xxx:[PASSWORD]@pooler.supabase.com:6543/postgres?pgbouncer=true
NEXT_PUBLIC_SUPABASE_URL = https://dwwzqwcoqlasgvpniwiu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
```

### 3. Revisa los logs de Vercel

```bash
# Desde terminal (si tienes Vercel CLI)
vercel logs
```

O desde **Vercel Dashboard** → **Deployments** → Click en deployment → **Functions** → Ver logs

### 4. Verifica el Prisma Client

Asegúrate de que Vercel está usando la versión correcta de Prisma:

```json
// package.json - verifica que tienes:
{
  "dependencies": {
    "@prisma/client": "^5.22.0"
  },
  "devDependencies": {
    "prisma": "^5.22.0"
  }
}
```

---

## 📋 Checklist Final

- [ ] Obtuve el **Connection Pooling URL** de Supabase (puerto 6543)
- [ ] Actualicé `DATABASE_URL` en **Vercel Environment Variables**
- [ ] Apliqué a **Production, Preview, Development**
- [ ] Hice **Redeploy** en Vercel
- [ ] Verifiqué que las **políticas RLS** están configuradas (ver SUPABASE_POLICIES.md)
- [ ] Probé crear un sermón desde `/sermons`
- [ ] ✅ Ya no hay errores de conexión

---

## 🆘 Si Sigue Sin Funcionar

1. **Verifica IP Allowlist en Supabase**:
   - Ve a **Database Settings** → **Network Restrictions**
   - Asegúrate de que **NO** hay restricciones IP (o agrega los IPs de Vercel)

2. **Verifica Pause Protection**:
   - Si tu proyecto de Supabase se pausa por inactividad, puede causar este error
   - Ve a **Project Settings** → **General** → Desactiva auto-pause si es gratis

3. **Contacta Soporte**:
   - Si nada funciona, el problema puede ser del lado de Supabase
   - Verifica el [status de Supabase](https://status.supabase.com/)

---

## 🔗 Recursos

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
