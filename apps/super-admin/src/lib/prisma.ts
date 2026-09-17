import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Vercel par DATABASE_URL ya DIRECT_URL dono me se jo bhi mile use uthayega
const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

const connectionString = rawConnectionString.trim();

if (!connectionString && process.env.NODE_ENV === "production") {
  console.error(
    "CRITICAL DATABASE ERROR: No DATABASE_URL or DIRECT_URL found in environment variables."
  );
}

// Neon/Supabase cloud pooling connection ke mutabiq pool configure karein
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production" || connectionString.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;