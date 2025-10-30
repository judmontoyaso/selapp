# Configuración de Políticas de Supabase para selapp

## Problema

Los errores 500 en producción se deben a que **Supabase tiene Row Level Security (RLS)** habilitado por defecto, lo que bloquea todas las operaciones desde el servidor (Vercel) a menos que configures políticas explícitas.

## Solución: Configurar Políticas de Acceso

### Opción A: Políticas Públicas (Más Simple - Recomendado para empezar)

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta este SQL:

```sql
-- =====================================================
-- POLÍTICAS PARA TABLAS DE SERMONES
-- =====================================================

-- 1. Tabla: sermons
-- Permitir todas las operaciones (INSERT, SELECT, UPDATE, DELETE)

ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública de sermones"
ON sermons FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir inserción de sermones"
ON sermons FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de sermones"
ON sermons FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de sermones"
ON sermons FOR DELETE
TO public
USING (true);

-- 2. Tabla: messages
-- Permitir todas las operaciones

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública de mensajes"
ON messages FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir inserción de mensajes"
ON messages FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de mensajes"
ON messages FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de mensajes"
ON messages FOR DELETE
TO public
USING (true);

-- 3. Tabla: images
-- Permitir todas las operaciones

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública de imágenes"
ON images FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir inserción de imágenes"
ON images FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de imágenes"
ON images FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de imágenes"
ON images FOR DELETE
TO public
USING (true);
```

### Opción B: Deshabilitar RLS (Solo para desarrollo/pruebas)

Si solo quieres probar rápido y no te preocupa la seguridad por ahora:

```sql
-- ADVERTENCIA: Esto deshabilita la seguridad. Solo para desarrollo.

ALTER TABLE sermons DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;
```

---

## Configuración de Políticas para Storage (Bucket de Imágenes)

### Paso 1: Verificar que el Bucket Existe

1. Ve a **Supabase Dashboard** → **Storage**
2. Verifica que el bucket **`Data_bucket`** existe
3. Si no existe, créalo:
   - Click en "New bucket"
   - Name: `Data_bucket`
   - Public: ✅ (marcar como público para que las imágenes sean accesibles)

### Paso 2: Configurar Políticas del Bucket

Ve a **Storage** → **Data_bucket** → **Policies** y añade estas políticas:

#### Política 1: Permitir Subida de Imágenes

```sql
-- En Storage > Policies > New Policy

-- Nombre: Permitir subir imágenes
-- Policy Definition:

CREATE POLICY "Permitir subir imágenes públicamente"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'Data_bucket'
);
```

#### Política 2: Permitir Lectura de Imágenes

```sql
-- Nombre: Permitir leer imágenes

CREATE POLICY "Permitir leer imágenes públicamente"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'Data_bucket'
);
```

#### Política 3: Permitir Actualizar Imágenes

```sql
-- Nombre: Permitir actualizar imágenes

CREATE POLICY "Permitir actualizar imágenes"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'Data_bucket'
)
WITH CHECK (
  bucket_id = 'Data_bucket'
);
```

#### Política 4: Permitir Eliminar Imágenes

```sql
-- Nombre: Permitir eliminar imágenes

CREATE POLICY "Permitir eliminar imágenes"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'Data_bucket'
);
```

### Paso 3: Configurar el Bucket como Público (Alternativa Simple)

Si prefieres no lidiar con políticas granulares por ahora:

1. Ve a **Storage** → **Data_bucket**
2. Click en los tres puntos (•••) → **Edit**
3. Marca ✅ **Public bucket**
4. Save

**NOTA**: Esto hace que todas las imágenes sean públicamente accesibles por URL.

---

## Opción C: Usar Service Role Key (Bypass RLS)

Tu código ya usa `SUPABASE_SERVICE_ROLE_KEY` en `/api/upload`, lo cual **debería funcionar** porque el service role **bypasea RLS automáticamente**.

**Verificación**:

1. Asegúrate de que en `src/lib/supabase.ts` el `getServiceSupabase()` usa correctamente el `SUPABASE_SERVICE_ROLE_KEY`
2. Verifica que en Vercel tienes configurada la variable `SUPABASE_SERVICE_ROLE_KEY` (Environment Variables)
3. Si usas el service role, **NO necesitas configurar políticas** para esas operaciones

**Código actual correcto**:

```typescript
// src/lib/supabase.ts
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey || !supabaseUrl) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL must be set');
  }
  
  return createClient(supabaseUrl, serviceKey);
};
```

El service role **ignora RLS**, así que si lo usas correctamente, no deberías tener problemas.

---

## Verificación de Políticas

Después de configurar las políticas, prueba:

### 1. Test desde Supabase SQL Editor

```sql
-- Verifica que puedes insertar un sermón
INSERT INTO sermons (title, pastor, date)
VALUES ('Test Sermon', 'Test Pastor', NOW());

-- Verifica que puedes leerlo
SELECT * FROM sermons WHERE title = 'Test Sermon';

-- Elimina el test
DELETE FROM sermons WHERE title = 'Test Sermon';
```

### 2. Test desde tu API en Vercel

1. Despliega la app con las políticas configuradas
2. Prueba crear un sermón desde `/sermons`
3. Verifica que las imágenes se suben correctamente
4. Revisa los logs de Vercel para confirmar que no hay errores 500

---

## Políticas de Seguridad Recomendadas (Producción)

Para producción, deberías usar políticas basadas en autenticación:

```sql
-- Ejemplo: Solo usuarios autenticados pueden crear sermones

CREATE POLICY "Solo usuarios autenticados pueden crear sermones"
ON sermons FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ejemplo: Solo el creador puede editar su sermón
CREATE POLICY "Solo el creador puede editar"
ON sermons FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)  -- Asumiendo que tienes columna user_id
WITH CHECK (auth.uid() = user_id);
```

**NOTA**: Tu schema actual no tiene columna `user_id` en sermons. Si quieres seguridad por usuario, deberás:
1. Añadir columna `user_id` a las tablas
2. Crear políticas basadas en `auth.uid()`

---

## Pasos Inmediatos (Resumen)

### Para Resolver el Error 500 Ahora:

**Opción Rápida (5 minutos)**:
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el SQL de "Opción A" (políticas públicas)
3. Ve a Storage → Data_bucket → Edit → Marca "Public bucket"
4. Redeploy en Vercel
5. ✅ Debería funcionar

**Opción Segura**:
1. Verifica que `SUPABASE_SERVICE_ROLE_KEY` está en Vercel Environment Variables
2. Asegúrate de que todos tus API routes usan `getServiceSupabase()` (no el cliente anon)
3. Redeploy
4. ✅ El service role bypasea RLS automáticamente

---

## Recursos

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Service Role Key](https://supabase.com/docs/guides/api/api-keys)

---

**¿Cuál opción prefieres?**
- A) Ejecuto las políticas públicas (desarrollo/pruebas)
- B) Verifico que uses correctamente el service role (producción segura)
- C) Te ayudo a configurar políticas por usuario (máxima seguridad)
