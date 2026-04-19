import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

export class BlogService {
  static async create(title: string, content: string, authorId: number) {
    logger.info({ authorId, title }, "Creating new blog");
    return await prisma.blog.create({
      data: { title, content, authorId },
    });
  }

  static async getPublished(
    page: number = 1,
    limit: number = 10,
    search?: string,
    currentUserId?: number
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      published: true,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    if (blogs.length === 0) {
      return { blogs: [], pagination: { total, page, limit, totalPages: 0 } };
    }

    let userLikes = new Set<number>();
    let userBookmarks = new Set<number>();

    if (currentUserId) {
      const blogIds = blogs.map((b) => b.id);
      const [likes, bookmarks] = await Promise.all([
        prisma.like.findMany({
          where: { userId: currentUserId, blogId: { in: blogIds } },
          select: { blogId: true },
        }),
        prisma.bookmark.findMany({
          where: { userId: currentUserId, blogId: { in: blogIds } },
          select: { blogId: true },
        }),
      ]);
      userLikes = new Set(likes.map((l) => l.blogId));
      userBookmarks = new Set(bookmarks.map((b) => b.blogId));
    }

    const formattedBlogs = blogs.map((blog) => ({
      ...blog,
      likesCount: blog._count.likes,
      commentsCount: blog._count.comments,
      isLiked: userLikes.has(blog.id),
      isBookmarked: userBookmarks.has(blog.id),
      _count: undefined,
    }));

    return {
      blogs: formattedBlogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getMyBlogs(
    authorId: number,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      authorId,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    const formattedBlogs = blogs.map((blog) => ({
      ...blog,
      likesCount: blog._count.likes,
      commentsCount: blog._count.comments,
      _count: undefined,
    }));

    return {
      blogs: formattedBlogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  static async getById(blogId: number, currentUserId?: number) {
    const blog = await prisma.blog.findFirst({
      where: { id: blogId, deletedAt: null },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!blog) throw new ApiError(404, "Blog not found");

    let isLiked = false;
    let isBookmarked = false;

    if (currentUserId) {
      const [like, bookmark] = await Promise.all([
        prisma.like.findUnique({ where: { userId_blogId: { userId: currentUserId, blogId } } }),
        prisma.bookmark.findUnique({ where: { userId_blogId: { userId: currentUserId, blogId } } }),
      ]);
      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return {
      ...blog,
      likesCount: blog._count.likes,
      commentsCount: blog._count.comments,
      isLiked,
      isBookmarked,
      _count: undefined,
    };
  }

  static async update(
    blogId: number,
    authorId: number,
    role: string,
    data: { title?: string; content?: string; published?: boolean }
  ) {
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });

    if (!blog || blog.deletedAt) throw new ApiError(404, "Blog not found");
    if (role !== "ADMIN" && blog.authorId !== authorId) throw new ApiError(403, "Unauthorized");

    logger.info({ blogId, authorId }, "Updating blog");
    return await prisma.blog.update({
      where: { id: blogId },
      data,
    });
  }

  static async softDelete(blogId: number, authorId: number, role: string) {
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });

    if (!blog || blog.deletedAt) throw new ApiError(404, "Blog not found");
    if (role !== "ADMIN" && blog.authorId !== authorId) throw new ApiError(403, "Unauthorized");

    logger.info({ blogId, authorId }, "Soft deleting blog");
    await prisma.blog.update({
      where: { id: blogId },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
