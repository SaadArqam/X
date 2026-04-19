import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";
import logger from "../utils/logger";
import { env } from "../config/env";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const user = await AuthService.register(name, email, password);
    
    logger.info({ email: user.email }, "User registered successfully");
    res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(
      email,
      password,
      req.ip || "",
      req.get("User-Agent") || ""
    );

    logger.info({ email: user.email, ip: req.ip }, "User logged in successfully");

    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(new ApiResponse(200, { user, accessToken }, "Login successful"));
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const { accessToken, refreshToken } = await AuthService.refresh(incomingRefreshToken);

    logger.debug("Token refreshed successfully");

    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(new ApiResponse(200, { accessToken }, "Token refreshed"));
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    
    logger.info("User logged out");

    res
      .status(200)
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json(new ApiResponse(200, null, "Logout successful"));
  });

  static logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (userId) {
      await AuthService.logoutAll(userId);
      logger.info({ userId }, "User logged out from all devices");
    }
    
    res
      .status(200)
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json(new ApiResponse(200, null, "Logged out from all sessions"));
  });
}
