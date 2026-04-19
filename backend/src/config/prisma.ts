import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const connectionString = env.DATABASE_URL;

// Create pg pool
const pool = new Pool({
  connectionString,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Prisma client with adapter
export const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});