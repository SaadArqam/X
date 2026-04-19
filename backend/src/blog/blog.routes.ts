import { Router } from "express";
import { BlogController } from "./blog.controller";
import { authMiddleware, optionalAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createBlogSchema, updateBlogSchema, blogIdSchema, blogQuerySchema } from "./blog.schema";

const router = Router();

router.get("/", optionalAuth, validate({ query: blogQuerySchema }), BlogController.getPublished);
router.get("/my-blogs", authMiddleware, validate({ query: blogQuerySchema }), BlogController.getMyBlogs);
router.get("/:id", optionalAuth, validate({ params: blogIdSchema }), BlogController.getById);

router.post("/", authMiddleware, validate({ body: createBlogSchema }), BlogController.create);
router.put("/:id", authMiddleware, validate({ params: blogIdSchema, body: updateBlogSchema }), BlogController.update);
router.delete("/:id", authMiddleware, validate({ params: blogIdSchema }), BlogController.delete);

export default router;
