import { Request,Response } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"

import { createComment } from "./comment.service"
import { getCommentsByBlog } from "./comment.service"
import { updateComment } from "./comment.service"
import { deleteComment } from "./comment.service"


export const createCommentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const blogId = Number(req.params.blogId)

    if (!req.user) {
      throw new Error("Unauthorized")
    }

    const userId = req.user.userId

    const comment = await createComment(blogId, userId, req.body)

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

interface BlogParams {
  blogId: string
}

export const getCommentsController = async (
  req: Request<BlogParams>,
  res: Response
) => {
  try {
    const blogId = Number(req.params.blogId)

    const comments = await getCommentsByBlog(blogId)

    res.status(200).json({
      success: true,
      data: comments,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

export const updateCommentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const commentId = Number(req.params.commentId);
    const { userId, role } = req.user!;

    const updated = await updateComment(
      commentId,
      userId,
      role,
      req.body.content
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCommentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const commentId = Number(req.params.commentId);
    const { userId, role } = req.user!;

    await deleteComment(commentId, userId, role);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};