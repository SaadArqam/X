import { Router } from "express";
import { registerController } from "./auth.controller";

const router = Router();

// POST /auth/register
router.post("/register", registerController);

export default router;
