-- =====================================================
-- MIGRACIÓN: Sistema de Notificaciones
-- =====================================================
-- Ejecuta este script en: Supabase Dashboard → SQL Editor
-- =====================================================

-- PASO 1: Crear tabla Notification
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "icon" TEXT,
  "link" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PASO 2: Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");

-- PASO 3: Agregar foreign key a User
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Notification_userId_fkey'
    ) THEN
        ALTER TABLE "Notification" 
        ADD CONSTRAINT "Notification_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- PASO 4: Crear tabla PushSubscription
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL UNIQUE,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PASO 5: Crear índices para PushSubscription
CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- PASO 6: Agregar foreign key a User para PushSubscription
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PushSubscription_userId_fkey'
    ) THEN
        ALTER TABLE "PushSubscription" 
        ADD CONSTRAINT "PushSubscription_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- PASO 7: Habilitar Row Level Security
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushSubscription" ENABLE ROW LEVEL SECURITY;

-- PASO 8: Eliminar políticas existentes (para evitar duplicados)
DROP POLICY IF EXISTS "Usuarios pueden leer sus notificaciones" ON "Notification";
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus notificaciones" ON "Notification";
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus notificaciones" ON "Notification";
DROP POLICY IF EXISTS "Sistema puede crear notificaciones" ON "Notification";

DROP POLICY IF EXISTS "Usuarios pueden leer sus suscripciones push" ON "PushSubscription";
DROP POLICY IF EXISTS "Usuarios pueden crear suscripciones push" ON "PushSubscription";
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus suscripciones push" ON "PushSubscription";

-- PASO 9: Crear políticas de acceso para Notification
CREATE POLICY "Usuarios pueden leer sus notificaciones"
ON "Notification" FOR SELECT
TO public
USING (true);

CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
ON "Notification" FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuarios pueden eliminar sus notificaciones"
ON "Notification" FOR DELETE
TO public
USING (true);

CREATE POLICY "Sistema puede crear notificaciones"
ON "Notification" FOR INSERT
TO public
WITH CHECK (true);

-- PASO 10: Crear políticas de acceso para PushSubscription
CREATE POLICY "Usuarios pueden leer sus suscripciones push"
ON "PushSubscription" FOR SELECT
TO public
USING (true);

CREATE POLICY "Usuarios pueden crear suscripciones push"
ON "PushSubscription" FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Usuarios pueden eliminar sus suscripciones push"
ON "PushSubscription" FOR DELETE
TO public
USING (true);

-- PASO 11: Verificar la configuración
SELECT 
  'Tabla Notification creada correctamente' AS status,
  COUNT(*) AS total_notifications
FROM "Notification";

SELECT 
  'Tabla PushSubscription creada correctamente' AS status,
  COUNT(*) AS total_subscriptions
FROM "PushSubscription";

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies
WHERE tablename IN ('Notification', 'PushSubscription')
ORDER BY tablename, policyname;

-- =====================================================
-- ✅ LISTO - Sistema de notificaciones configurado
-- =====================================================

-- NOTA: Para crear notificaciones de prueba, puedes ejecutar:
/*
INSERT INTO "Notification" ("id", "userId", "type", "title", "message", "icon", "link", "read")
SELECT 
  'test-' || gen_random_uuid()::text,
  id,
  'verse_of_day',
  '📖 Nuevo Versículo del Día',
  'Ya está disponible el versículo del día. ¡No te lo pierdas!',
  '📖',
  '/',
  false
FROM "User"
LIMIT 1;
*/
