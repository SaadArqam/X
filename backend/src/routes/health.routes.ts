import { Router, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      message: "OOP Express server running 🚀",
    });
  }),
);

export default router;
