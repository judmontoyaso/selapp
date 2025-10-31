import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar la URL de la base de datos para entornos serverless
const databaseUrl = process.env.DATABASE_URL
const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
const isDevelopment = process.env.NODE_ENV === 'development'

// En entornos serverless o desarrollo, agregar parámetros para evitar problemas con prepared statements
const connectionUrl = (isServerless || isDevelopment) && databaseUrl
  ? `${databaseUrl}?pgbouncer=true&connect_timeout=15&prepared_statements=false`
  : databaseUrl

// En desarrollo, no reutilizar la instancia global para evitar problemas con prepared statements
const shouldReuseClient = !isDevelopment

export const prisma = shouldReuseClient
  ? (globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
    }))
  : new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
    })

// Solo reutilizar en producción/serverless
if (shouldReuseClient) {
  globalForPrisma.prisma = prisma
}

// Función helper para manejar errores de prepared statements
export async function safeQuery<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query()
  } catch (error: any) {
    // Si es un error de prepared statement duplicado, intentar de nuevo con más delay
    if (error.code === 'P2002' || error.message?.includes('prepared statement') || error.message?.includes('42P05')) {
      console.warn('Prepared statement error detected, retrying query after longer delay...')
      // Mayor pausa antes de reintentar (500ms en lugar de 100ms)
      await new Promise(resolve => setTimeout(resolve, 500))
      try {
        return await query()
      } catch (retryError: any) {
        console.error('Retry also failed:', retryError.message)
        // Si el retry también falla, intentar una tercera vez con aún más delay
        console.warn('Attempting second retry...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return await query()
      }
    }
    throw error
  }
}
