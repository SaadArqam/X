import { Request, Response } from "express";
import { CommentService } from "./comment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export class CommentController {
  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { blogId, content, parentId } = req.body as {
      blogId: number | string;
      content: string;
      parentId?: number;
    };
    const userId = req.user!.userId;

    try {
      const comment = await CommentService.create(Number(blogId), userId, content, parentId);
      res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || "Failed to add comment" });
    }
  });

  static getByBlog = asyncHandler(async (req: Request, res: Response) => {
    const blogId = Number(req.params.blogId);
    const comments = await CommentService.getCommentsByBlog(blogId);
    res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"));
  });

  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const commentId = Number(req.params.id);
    const { content } = req.body as { content: string };
    const { userId, role } = req.user!;

    const comment = await CommentService.update(commentId, userId, role, content);
    res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment updated successfully"));
  });

  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const commentId = Number(req.params.id);
    const { userId, role } = req.user!;

    await CommentService.softDelete(commentId, userId, role);
    res.status(204).send(); // 204 No Content for successful deletes
  });
}
