import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  createComment,
  getCommentsByBlog,
  updateComment,
  deleteComment,
} from "./comment.service";

/* ================= CREATE ================= */

export const createCommentController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.blogId);

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user.userId;

    const comment = await createComment(blogId, userId, req.body);

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  }
);

/* ================= GET ================= */

interface BlogParams {
  blogId: string;
}

export const getCommentsController = asyncHandler(
  async (req: Request<BlogParams>, res: Response) => {
    const blogId = Number(req.params.blogId);

    const comments = await getCommentsByBlog(blogId);

    res.status(200).json({
      success: true,
      data: comments,
    });
  }
);

/* ================= UPDATE ================= */

export const updateCommentController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const commentId = Number(req.params.commentId);
    const { userId, role } = req.user;

    const updated = await updateComment(
      commentId,
      userId,
      role as any, // If needed, change AuthRequest role to Prisma Role type
      req.body.content
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updated,
    });
  }
);

/* ================= DELETE ================= */

export const deleteCommentController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const commentId = Number(req.params.commentId);
    const { userId, role } = req.user;

    await deleteComment(commentId, userId, role as any);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  }
);
