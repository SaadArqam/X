import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { generateRefreshToken, hashToken } from "../utils/token";
import { Role } from "@prisma/client";

const REFRESH_TOKEN_EXPIRES_DAYS = 7;

export class AuthService {
  /*  REGISTER  */

  static async register(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  /*  LOGIN  */

  static async login(email: string, password: string) {
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Access token (15m)
    const accessToken = signToken({
      userId: user.id,
      role: user.role as Role,
    });

    // Refresh token (random)
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /*  REFRESH  */

  static async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(400, "Refresh token required");
    }

    const tokenHash = hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (storedToken.revoked) {
      throw new ApiError(401, "Token revoked");
    }

    if (storedToken.expiresAt < new Date()) {
      throw new ApiError(401, "Refresh token expired");
    }

    // Rotate (delete old)
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRefreshToken);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: storedToken.userId,
        expiresAt: newExpiresAt,
      },
    });

    const newAccessToken = signToken({
      userId: storedToken.user.id,
      role: storedToken.user.role,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /*  LOGOUT  */

  static async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(400, "Refresh token required");
    }

    const tokenHash = hashToken(refreshToken);

    await prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });

    return true;
  }
}
