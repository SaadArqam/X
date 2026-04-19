import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger";

export const prisma = new PrismaClient({
  log: [
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" },
  ],
});

prisma.$connect()
  .then(() => logger.info("Prisma connected to Database"))
  .catch((err: any) => logger.error("Prisma connection failed"));