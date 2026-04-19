import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers and underscores'),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});
