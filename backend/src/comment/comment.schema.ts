import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.number().optional(),
});

export const blogIdParamSchema = z.object({
  blogId: z.string().regex(/^\d+$/).transform(Number),
});

export const commentIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});
