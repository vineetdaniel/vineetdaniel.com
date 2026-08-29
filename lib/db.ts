import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Prisma `where` condition for posts that are publicly visible right now:
 * published AND either no scheduled date or a date that has already passed.
 * Future-dated posts stay hidden until their time (scheduling).
 */
export function publiclyVisible() {
  return {
    published: true,
    OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
  }
}
