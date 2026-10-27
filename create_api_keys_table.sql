-- Crear tabla ApiKey para claves, enlaces y permisos MCP dinámicos por usuario
-- Ejecutar este script en Supabase SQL Editor (o se ejecuta automáticamente desde la app)

CREATE TABLE IF NOT EXISTS "ApiKey" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL DEFAULT 'MCP Personal',
  "permissions" TEXT[] NOT NULL DEFAULT ARRAY['read', 'write']::TEXT[],
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Si ya habías creado la tabla antes, esta línea añade la columna de permisos sin perder tus claves actuales:
ALTER TABLE "ApiKey"
ADD COLUMN IF NOT EXISTS "permissions" TEXT[] NOT NULL DEFAULT ARRAY['read', 'write']::TEXT[];

-- Crear índices para búsqueda rápida por clave y por usuario
CREATE INDEX IF NOT EXISTS "ApiKey_key_idx" ON "ApiKey"("key");
CREATE INDEX IF NOT EXISTS "ApiKey_userId_idx" ON "ApiKey"("userId");
