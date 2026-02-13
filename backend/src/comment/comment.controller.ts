import { Response } from "express"
import { AuthRequest } from "../middlewares/auth.middleware"

import { createComment } from "./comment.service"

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

