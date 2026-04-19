import { createClient } from "redis";
import { env } from "../config/env";
import logger from "./logger";

const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (err) => logger.error("Redis Client Error"));
redisClient.on("connect", () => logger.info("Redis Client Connected"));

if (env.REDIS_URL) {
  redisClient.connect().catch((err) => logger.error("Redis Connection Failed"));
}

export default redisClient;
