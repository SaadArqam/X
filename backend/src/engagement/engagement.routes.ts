import { Router } from "express";
import { EngagementController } from "./engagement.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { engagementSchema } from "./engagement.schema";

const router = Router();

router.post("/like/:blogId", authMiddleware, validate({ params: engagementSchema }), EngagementController.toggleLike);
router.post("/bookmark/:blogId", authMiddleware, validate({ params: engagementSchema }), EngagementController.toggleBookmark);
router.get("/bookmarks", authMiddleware, EngagementController.getBookmarks);
router.get("/like-count/:blogId", validate({ params: engagementSchema }), EngagementController.getLikeCount);

export default router;
