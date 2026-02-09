import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const connectionString = `${env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Create PrismaClient with the adapter. Recent Prisma builds using the
// "client" engine require either an adapter or accelerateUrl.
export const prisma = new PrismaClient({ adapter,
	log: [
		{ level: "info", emit: "stdout" },
		{ level: "warn", emit: "stdout" },
		{ level: "error", emit: "stdout" },
	],
});
