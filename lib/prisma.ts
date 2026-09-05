import {
  PrismaClient,
} from "@/app/generated/prisma/client";

import {
  PrismaPg,
} from "@prisma/adapter-pg";

const globalForPrisma =
  globalThis as unknown as {
    prisma:
      | PrismaClient
      | undefined;
  };

const adapter =
  new PrismaPg({
    connectionString:
      process.env.DATABASE_URL!,

    // Important for Vercel/serverless.
    max: 3,

    connectionTimeoutMillis:
      10_000,

    idleTimeoutMillis:
      10_000,
  });

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForPrisma.prisma =
    prisma;
}

export default prisma;