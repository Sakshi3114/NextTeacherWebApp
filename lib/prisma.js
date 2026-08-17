import { PrismaClient } from "@prisma/client";

// Standard Next.js hot-reload-safe singleton: without this, every dev-server
// module reload would open a fresh Postgres connection pool.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
