import { Response } from "express";
import { EngagementService } from "./engagement.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export class EngagementController {
  static toggleLike = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.blogId);
    const userId = req.user!.userId;
    const result = await EngagementService.toggleLike(blogId, userId);
    res.status(200).json(new ApiResponse(200, result, result.liked ? "Blog liked" : "Blog unliked"));
  });

  static toggleBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.blogId);
    const userId = req.user!.userId;
    const result = await EngagementService.toggleBookmark(blogId, userId);
    res.status(200).json(new ApiResponse(200, result, result.bookmarked ? "Blog bookmarked" : "Bookmark removed"));
  });

  static getBookmarks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const bookmarks = await EngagementService.getUserBookmarks(userId);
    res.status(200).json(new ApiResponse(200, bookmarks, "Bookmarks fetched successfully"));
  });

  static getLikeCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.blogId);
    const count = await EngagementService.getLikeCount(blogId);
    res.status(200).json(new ApiResponse(200, { count }, "Like count fetched"));
  });
}
