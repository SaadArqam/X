import { Response } from "express";
import { EngagementService } from "./engagement.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middlewares/auth.middleware";

export class EngagementController {
  static toggleLike = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { blogId } = req.body;
    const userId = req.user!.userId;
    try {
      const result = await EngagementService.toggleLike(Number(blogId), userId);
      res.status(200).json(new ApiResponse(200, result, result.liked ? "Blog liked" : "Blog unliked"));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || "Failed to toggle like" });
    }
  });

  static toggleBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { blogId } = req.body;
    const userId = req.user!.userId;
    
    console.log("BOOKMARK CREATE:", blogId, userId);
    
    try {
      const result = await EngagementService.toggleBookmark(Number(blogId), userId);
      res.status(200).json(new ApiResponse(200, result, result.bookmarked ? "Blog bookmarked" : "Bookmark removed"));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || "Failed to toggle bookmark" });
    }
  });

  static getBookmarks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const bookmarks = await EngagementService.getUserBookmarks(userId);
    
    console.log("BOOKMARK FETCH:", bookmarks.length ? `${bookmarks.length} bookmarks found.` : "Empty []");
    
    res.status(200).json(new ApiResponse(200, bookmarks, "Bookmarks fetched successfully"));
  });

  static getLikeCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blogId = Number(req.params.blogId);
    const count = await EngagementService.getLikeCount(blogId);
    res.status(200).json(new ApiResponse(200, { count }, "Like count fetched"));
  });
}
