import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { blogCreate,blogGet } from "./blog.controller";

const blogRoutes = Router();


blogRoutes.post("/", authMiddleware, blogCreate);
blogRoutes.get("/me", authMiddleware, blogGet);

export default blogRoutes;
