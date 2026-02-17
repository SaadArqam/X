import { Router } from "express"
import {
  createCommentController,
  getCommentsController,
  updateCommentController,
  deleteCommentController
} from "./comment.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

const commentRoutes = Router({ mergeParams: true })


commentRoutes.post("/", authMiddleware, createCommentController)


commentRoutes.get("/", getCommentsController)

commentRoutes.patch("/:commentId", authMiddleware, updateCommentController);

commentRoutes.delete("/:commentId", authMiddleware, deleteCommentController);

export default commentRoutes
