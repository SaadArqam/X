import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

export class EngagementService {
  static async toggleLike(blogId: number, userId: number) {
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new ApiError(404, "Blog not found");

    const existingLike = await prisma.like.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      logger.debug({ blogId, userId }, "Blog unliked");
      return { liked: false };
    }

    await prisma.like.create({ data: { blogId, userId } });
    logger.debug({ blogId, userId }, "Blog liked");
    return { liked: true };
  }

  static async toggleBookmark(blogId: number, userId: number) {
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new ApiError(404, "Blog not found");

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
      logger.debug({ blogId, userId }, "Bookmark removed");
      return { bookmarked: false };
    }

    // Creating explicitly passing userId along with blogId mapping 
    await prisma.bookmark.create({
      data: {
        userId: userId,
        blogId: blogId,
      },
    });

    logger.debug({ blogId, userId }, "Blog bookmarked");
    return { bookmarked: true };
  }

  static async getLikeCount(blogId: number) {
    return await prisma.like.count({ where: { blogId } });
  }

  static async getUserBookmarks(userId: number) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        blog: {
          include: {
            author: { select: { id: true, name: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookmarks.map((b: any) => ({
      id: b.id,
      createdAt: b.createdAt,
      blog: {
        ...b.blog,
        likesCount: b.blog?._count?.likes || 0,
        commentsCount: b.blog?._count?.comments || 0,
        _count: undefined,
      },
    }));
  }
}
