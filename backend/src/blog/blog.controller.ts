import { Response } from "express";
import { BlogCrud } from "./blog.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { title } from "node:process";

export const blogCreate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { title, content } = req.body;

  const userId = req.user!.userId;

  const blog = await BlogCrud.create(title, content, userId);

  res.status(201).json({
    message: "Blog created successfully",
    blog,
  });
};

export const blogGet = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;

  const blogs = await BlogCrud.get(userId);

  res.status(200).json({
    blogs,
  });
};
