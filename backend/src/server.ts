import { app } from "./app";
import { env } from "./config/env";
import logger from "./utils/logger";

const PORT = process.env.PORT || env.PORT || 8080;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Handle uncaught exceptions — log and exit so process manager can restart
process.on("uncaughtException", (err: Error) => {
  logger.fatal({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal({ reason }, "Unhandled rejection — shutting down");
  server.close(() => process.exit(1));
});

// Graceful shutdown on SIGTERM (Docker stop, Kubernetes, etc.)
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

// Graceful shutdown on SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});
