import { PrismaClient } from '@prisma/client'

// Export `prisma` as `any` to avoid strict generated Prisma typings
// causing TypeScript errors across different schema states during build.
const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma: any = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
