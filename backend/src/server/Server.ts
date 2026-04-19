import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pino from "pino-http";
import routes from "../routes";
import { errorMiddleware } from "../middlewares/error.middleware";
import { sanitizeMiddleware } from "../middlewares/sanitize.middleware";
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
    const allowedOrigins = [
      "http://localhost:3000",
      "https://x-blond-delta.vercel.app"
    ];

    // 1. CORS first — before anything touches headers
    this.app.use(
      cors({
        origin: function (origin, callback) {
          // Allow requests with no origin (server-to-server, curl, etc.)
          if (!origin) return callback(null, true);

          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          return callback(new Error("CORS blocked: " + origin));
        },
        credentials: true,
      })
    );

    // 2. Helmet after CORS
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", ...allowedOrigins],
            frameSrc: ["'none'"],
          },
        },
        xFrameOptions: { action: "deny" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        xContentTypeOptions: true,
      })
    );

    // 3. Rest stays the same...
    this.app.use(pino({ logger }));
    this.app.use(express.json({ limit: "16kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "16kb" }));
    this.app.use(cookieParser());
    this.app.use(sanitizeMiddleware);
    this.app.use("/api", apiRateLimiter);
  }

  private initializeRoutes(): void {
    this.app.use("/api/v1", routes);

    // Health check
    this.app.get("/health", (_req, res) => {
      res
        .status(200)
        .json({ status: "UP", timestamp: new Date().toISOString() });
    });

    // 404 handler
    this.app.use((req, res) => {
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
