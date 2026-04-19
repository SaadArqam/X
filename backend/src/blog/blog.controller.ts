import { Request, Response } from "express";
import { BlogService } from "./blog.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export class BlogController {
  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, content, excerpt, coverImage, tags, status } = req.body as {
      title: string;
      content: string;
      excerpt?: string;
      coverImage?: string;
      tags?: string[];
      status?: 'draft' | 'published';
    };
    const authorId = req.user!.userId;
    const blog = await BlogService.create(title, content, authorId, {
      excerpt,
      coverImage,
      tags,
      published: status !== 'draft',
    });
    res.status(201).json(new ApiResponse(201, blog, "Blog created successfully"));
  });

  static getPublished = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const currentUserId = req.user?.userId;

    const { blogs, pagination } = await BlogService.getPublished(
      page,
      limit,
      search,
      currentUserId
    );
    res
      .status(200)
      .json(new ApiResponse(200, blogs, "Blogs fetched successfully", pagination));
  });

  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.id);
    const currentUserId = req.user?.userId;
    const blog = await BlogService.getById(blogId, currentUserId);
    res.status(200).json(new ApiResponse(200, blog, "Blog fetched successfully"));
  });

  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.id);
    const { title, content, published } = req.body as {
      title?: string;
      content?: string;
      published?: boolean;
    };
    const { userId, role } = req.user!;

    const blog = await BlogService.update(blogId, userId, role, {
      title,
      content,
      published,
    });
    res.status(200).json(new ApiResponse(200, blog, "Blog updated successfully"));
  });

  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.id);
    const { userId, role } = req.user!;

    await BlogService.softDelete(blogId, userId, role);
    res.status(204).send(); // 204 No Content for successful deletes
  });

  static getMyBlogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const { blogs, pagination } = await BlogService.getMyBlogs(
      userId,
      page,
      limit,
      search
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, blogs, "Your blogs fetched successfully", pagination)
      );
  });
}
