// Prisma 7 config — replaces the old package.json#prisma block and the
// datasource `url` in schema.prisma. Used by the CLI (migrate/studio/seed),
// not by the app at runtime (see lib/prisma.js for the app's own connection
// via a driver adapter).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
