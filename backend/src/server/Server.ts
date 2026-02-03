import express, { Application } from "express";
import cors from "cors";

export class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private initializeRoutes(): void {
    this.app.get("/health", (_req, res) => {
      res.status(200).json({
        status: "ok",
        message: "OOP Express server running 🚀",
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
