import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pino from "pino-http";
import routes from "../routes";
import { errorMiddleware } from "../middlewares/error.middleware";
import { env } from "../config/env";
import logger from "../utils/logger";
import { apiRateLimiter } from "../middlewares/rateLimiter.middleware";

export class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security headers
    this.app.use(helmet());

    // Logging
    this.app.use(pino({ logger }));

    // CORS
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: "16kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "16kb" }));

    // Cookies
    this.app.use(cookieParser());

    // Global Rate Limiting
    this.app.use("/api", apiRateLimiter);
  }

  private initializeRoutes(): void {
    this.app.use("/api/v1", routes);

    // Health check
    this.app.get("/health", (req, res) => {
      res.status(200).json({ status: "UP", timestamp: new Date() });
    });

    // 404 handler
    this.app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public getApp(): Application {
    return this.app;
  }
}
