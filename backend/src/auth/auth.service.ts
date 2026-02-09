import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError";

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string
  ) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
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
    } catch (err: any) {
      // Log detailed Prisma error information to help debugging
      if (err.code && err.meta) {
        console.error("Prisma error code:", err.code);
        console.error("Prisma error meta:", err.meta);
      }
      console.error("AuthService.register error:", err?.message ?? err);
      throw err;
    }
  }
}
