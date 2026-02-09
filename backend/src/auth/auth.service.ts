import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";

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

      if (err.code && err.meta) {
        console.error("Prisma error code:", err.code);
        console.error("Prisma error meta:", err.meta);
      }
      console.error("AuthService.register error:", err?.message ?? err);
      throw err;
    }
  }

  static async login(email: string, password: string) {
    try {

      if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
      }


      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }


      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
      }


      const token = signToken({
        userId: user.id,
        role: user.role,
      });


      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (err: any) {
      if (err?.code) {
        console.error("Prisma error code:", err.code);
      }

      console.error("AuthService.login error:", err?.message ?? err);
      throw err;
    }
  }
}
