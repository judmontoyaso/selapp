import { prisma } from "@/lib/prisma";

let tableEnsured = false;

/**
 * Garantiza que la tabla "ApiKey" y sus índices existan en PostgreSQL
 * sin necesidad de correr migraciones manuales en el despliegue de Vercel.
 */
export async function ensureApiKeyTable(): Promise<void> {
  if (tableEnsured) return;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ApiKey" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL DEFAULT 'MCP Personal',
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastUsedAt" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ApiKey_key_idx" ON "ApiKey"("key");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ApiKey_userId_idx" ON "ApiKey"("userId");
    `);

    tableEnsured = true;
  } catch (error) {
    // Si ya existe o el usuario de BD tiene restricciones de DDL pero la tabla existe, continuamos
    console.warn("Notice checking ApiKey table:", error);
  }
}
