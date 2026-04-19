import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";
import logger from "../utils/logger";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const, // 'strict' breaks cross-origin localhost; switch to 'strict' in prod with same domain
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { name, username, email, password } = req.body;

    // Create user
    await AuthService.register(name, username, email, password);

    // Immediately issue tokens (mirrors login flow — avoids a second round-trip)
    const { user, accessToken, refreshToken } = await AuthService.login(
      email,
      password,
      req.ip || "",
      req.get("User-Agent") || ""
    );

    logger.info({ email: user.email }, "User registered successfully");
    res
      .status(201)
      .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
      .json(new ApiResponse(201, { user, accessToken }, "User registered successfully"));
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
      .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
      .json(new ApiResponse(200, { user, accessToken }, "Login successful"));
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    const { accessToken, refreshToken } =
      await AuthService.refresh(incomingRefreshToken);

    logger.debug("Token refreshed successfully");

    res
      .status(200)
      .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
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
        path: "/api/v1/auth",
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
        path: "/api/v1/auth",
      })
      .json(new ApiResponse(200, null, "Logged out from all sessions"));
  });

  static me = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await AuthService.me(userId);
    res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
  });
}
