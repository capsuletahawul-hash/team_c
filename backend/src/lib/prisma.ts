import { PrismaClient } from '@prisma/client';

// Declare global type for the PrismaClient singleton
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}