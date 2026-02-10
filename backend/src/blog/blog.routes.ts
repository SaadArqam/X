import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { blogCreate,blogGet,blogDelete,blogUpdate,blogTogglePublish,blogGetPublished,blogGetById } from "./blog.controller";

const blogRoutes = Router();


blogRoutes.post("/", authMiddleware, blogCreate);
blogRoutes.get("/me", authMiddleware, blogGet);
blogRoutes.patch("/:id", authMiddleware, blogUpdate);
blogRoutes.delete("/:id", authMiddleware, blogDelete);

blogRoutes.get("/:id", blogGetById);
blogRoutes.get("/", blogGetPublished);

blogRoutes.patch("/:id/publish", authMiddleware, blogTogglePublish);


export default blogRoutes;
