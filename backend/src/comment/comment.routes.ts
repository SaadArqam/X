import { Router } from "express";
import { CommentController } from "./comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createCommentSchema, commentIdSchema, updateCommentSchema, blogIdParamSchema } from "./comment.schema";

const router = Router();

router.get("/blog/:blogId", validate({ params: blogIdParamSchema }), CommentController.getByBlog);
router.post("/blog/:blogId", authMiddleware, validate({ params: blogIdParamSchema, body: createCommentSchema }), CommentController.create);
router.put("/:id", authMiddleware, validate({ params: commentIdSchema, body: updateCommentSchema }), CommentController.update);
router.delete("/:id", authMiddleware, validate({ params: commentIdSchema }), CommentController.delete);

export default router;
