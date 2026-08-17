import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires an explicit driver adapter instead of a datasource `url`
// in schema.prisma — this is also the better pattern for serverless
// deployments (Vercel), since it avoids the ORM's own Rust engine opening
// connections outside the request lifecycle.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Standard Next.js hot-reload-safe singleton: without this, every dev-server
// module reload would open a fresh Postgres connection pool.
const globalForPrisma = globalThis;

// A cold connection to Neon (TLS handshake, or Neon waking from idle) can
// outlast Prisma's default 2s transaction-acquisition window — relevant on
// Vercel, where a cold serverless invocation means a cold pool every time.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter, transactionOptions: { maxWait: 15000, timeout: 15000 } });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
