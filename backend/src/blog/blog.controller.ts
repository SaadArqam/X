import { Response } from "express";
import { BlogCrud } from "./blog.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const blogCreate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { title, content } = req.body;

  const userId = req.user!.userId;

  const blog = await BlogCrud.create(title, content, userId);

  res.status(201).json({
    message: "Blog created successfully",
    blog,
  });
};


