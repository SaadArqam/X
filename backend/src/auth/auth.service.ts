import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError";
import { generateAccessToken } from "../utils/jwt";
import { generateRefreshToken, hashToken } from "../utils/token";
import logger from "../utils/logger";
import { env } from "../config/env";

const REFRESH_TOKEN_EXPIRES_DAYS = 7;

export class AuthService {
  static async register(name: string, username: string, email: string, password: string) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      if (existingUser.email === email) throw new ApiError(409, "Email already registered");
      throw new ApiError(409, "Username already taken");
    }

    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async login(
    email: string,
    password: string,
    ip: string,
    userAgent: string
  ) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn({ email, ip }, "Failed login attempt: User not found");
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn({ email, ip }, "Failed login attempt: Incorrect password");
      throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
        ip,
        userAgent,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    const tokenHash = hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt < new Date()
    ) {
      if (storedToken) {
        logger.warn(
          { userId: storedToken.userId },
          "Potential refresh token reuse attack detected"
        );
        // Delete all tokens for user on suspected reuse (token theft protection)
        await prisma.refreshToken.deleteMany({
          where: { userId: storedToken.userId },
        });
      }
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Rotate: delete old, issue new
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
        ip: storedToken.ip,
        userAgent: storedToken.userAgent,
      },
    });

    const newAccessToken = generateAccessToken({
      userId: storedToken.user.id,
      role: storedToken.user.role,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });
  }

  static async logoutAll(userId: number) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
