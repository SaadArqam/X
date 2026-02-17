import express, { Application } from "express";
import cors from "cors";
import routes from '../routes'

import cookieParser from "cookie-parser";

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
    this.app.use(cookieParser())
  }

  private initializeRoutes(): void {
    this.app.use("/",routes)
  }

  public getApp(): Application {
    return this.app;
  }
}
