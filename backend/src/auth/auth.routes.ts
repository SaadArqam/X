import { Router } from "express";
import { registerController } from "./auth.controller";
import { loginCrontroller } from "./auth.controller";

const router = Router();

// POST /auth/register
router.post("/register", registerController);
router.post("/login", loginCrontroller);

export default router;
