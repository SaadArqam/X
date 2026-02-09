import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { blogCreate } from "./blog.controller";

const blogRoutes = Router();


blogRoutes.post("/", authMiddleware, blogCreate);

export default blogRoutes;
