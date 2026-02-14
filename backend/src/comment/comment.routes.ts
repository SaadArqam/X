import { Router } from "express"
import {
  createCommentController,
  getCommentsController,
} from "./comment.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

const commentRoutes = Router({ mergeParams: true })


commentRoutes.post("/", authMiddleware, createCommentController)


commentRoutes.get("/", getCommentsController)

export default commentRoutes
