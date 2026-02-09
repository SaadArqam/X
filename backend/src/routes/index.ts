import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../auth/auth.routes";
import blogRoutes from "../blog/blog.routes"

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);

export default router;
