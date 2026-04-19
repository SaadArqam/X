import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
});

export const updateBlogSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).optional(),
  published: z.boolean().optional(),
});

export const blogIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const blogQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
});
