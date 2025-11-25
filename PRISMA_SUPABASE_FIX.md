# 🔧 Solución: Error de Prisma con Supabase

## Problema
```
prepared statement "s4" already exists
```

Esto ocurre por el connection pooling de PgBouncer en Supabase.

## Solución

En Vercel, necesitas **2 URLs de base de datos diferentes**:

### 1. Para Connection Pooling (la mayoría de las operaciones)
```
DATABASE_URL="postgresql://postgres.dwwzqwcoqlasgvpniwiu:PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```
✅ Usa esta para operaciones normales
✅ Más rápida
✅ Menos conexiones

### 2. Para Transacciones y Migraciones (sin pooler)
```
DIRECT_URL="postgresql://postgres.dwwzqwcoqlasgvpniwiu:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```
✅ Conexión directa sin PgBouncer
✅ Necesaria para `prisma migrate`
✅ Puerto 5432 (no 6543)

## Configurar en Vercel

1. Ve a **Vercel Dashboard** → Settings → Environment Variables

2. **Modifica** `DATABASE_URL` (quita `&connection_limit=1`):
```
postgresql://postgres.dwwzqwcoqlasgvpniwiu:.Jd0521ms.@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

3. **Agrega nueva variable** `DIRECT_URL`:
```
postgresql://postgres.dwwzqwcoqlasgvpniwiu:.Jd0521ms.@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

4. **Redeploy** el proyecto

## Alternativa más simple

Si el error persiste, cambia a conexión directa (sin pooler):

En Vercel, modifica `DATABASE_URL` a:
```
postgresql://postgres.dwwzqwcoqlasgvpniwiu:.Jd0521ms.@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

⚠️ Esto usará más conexiones pero evitará el error del prepared statement.

---

Después de cambiar, redeploy y prueba de nuevo.
