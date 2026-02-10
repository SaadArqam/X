// import { Response } from "express";
import { BlogCrud } from "./blog.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { title } from "node:process";
import { Request, Response } from "express";

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

export const blogGetPublished = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const blogs = await BlogCrud.getPublished();

  res.status(200).json({
    blogs,
  });
};

export const blogGetById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const blogId = Number(req.params.id);

  const blog = await BlogCrud.getById(blogId);

  res.status(200).json({
    blog,
  });
};

export const blogTogglePublish = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const blogId = Number(req.params.id);
  const { publish } = req.body;
  const userId = req.user!.userId;

  if (typeof publish !== "boolean") {
    res.status(400).json({
      message: "`publish` must be boolean",
    });
    return;
  }

  const blog = await BlogCrud.togglePublish(blogId, userId, publish);

  res.status(200).json({
    message: publish ? "Blog published" : "Blog unpublished",
    blog,
  });
};

export const blogUpdate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const blogId = Number(req.params.id);
  const { title, content } = req.body;
  const userId = req.user!.userId;

  const updatedBlog = await BlogCrud.update(blogId, userId, title, content);

  res.status(200).json({
    message: "Blog updated successfully",
    blog: updatedBlog,
  });
};

export const blogDelete = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const blogId = Number(req.params.id);
  const userId = req.user!.userId;

  await BlogCrud.delete(blogId, userId);

  res.status(200).json({
    message: "Blog deleted successfully",
  });
};
