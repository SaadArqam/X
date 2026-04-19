import { Request, Response } from "express";
import { BlogService } from "./blog.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

import logger from "../utils/logger";

export class BlogController {
  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, content } = req.body;
    const authorId = req.user!.userId;
    const blog = await BlogService.create(title, content, authorId);
    res.status(201).json(new ApiResponse(201, blog, "Blog created successfully"));
  });

  static getPublished = asyncHandler(async (req: AuthRequest, res: Response) => {
    const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const searchParam = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;

    const page = pageParam ? Number(pageParam) : 1;
    const limit = limitParam ? Number(limitParam) : 10;
    const search = typeof searchParam === "string" ? searchParam : undefined;

    const currentUserId = req.user?.userId;

    const { blogs, pagination } = await BlogService.getPublished(page, limit, search, currentUserId);
    res.status(200).json(new ApiResponse(200, blogs, "Blogs fetched successfully", pagination));
  });

  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.id);
    const currentUserId = req.user?.userId;
    const blog = await BlogService.getById(blogId, currentUserId);
    res.status(200).json(new ApiResponse(200, blog, "Blog fetched successfully"));
  });

  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.id);
    const { title, content, published } = req.body;
    const { userId, role } = req.user!;

    const blog = await BlogService.update(blogId, userId, role, { title, content, published });
    res.status(200).json(new ApiResponse(200, blog, "Blog updated successfully"));
  });

  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.id);
    const { userId, role } = req.user!;

    await BlogService.softDelete(blogId, userId, role);
    res.status(200).json(new ApiResponse(200, null, "Blog deleted successfully"));
  });

  static getMyBlogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    
    const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const searchParam = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;

    const page = pageParam ? Number(pageParam) : 1;
    const limit = limitParam ? Number(limitParam) : 10;
    const search = typeof searchParam === "string" ? searchParam : undefined;

    const { blogs, pagination } = await BlogService.getMyBlogs(userId, page, limit, search);
    res.status(200).json(new ApiResponse(200, blogs, "Your blogs fetched successfully", pagination));
  });
}
