import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

const MAX_LIMIT = 50;

export class BlogService {
  static async create(
    title: string,
    content: string,
    authorId: number,
    options?: {
      excerpt?: string;
      coverImage?: string;
      tags?: string[];
      published?: boolean;
    }
  ) {
    logger.info({ authorId, title }, "Creating new blog");
    return await prisma.blog.create({
      data: {
        title,
        content,
        authorId,
        excerpt: options?.excerpt,
        coverImage: options?.coverImage || null,
        tags: options?.tags ?? [],
        published: options?.published ?? true,
      },
      include: {
        author: { select: { id: true, name: true, username: true } },
      },
    });
  }

  static async getPublished(
    page: number = 1,
    limit: number = 10,
    search?: string,
    currentUserId?: number
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      published: true,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
        include: {
          author: { select: { id: true, name: true, username: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    let userLikes = new Set<number>();
    let userBookmarks = new Set<number>();

    if (currentUserId) {
      const blogIds = blogs.map((b: any) => b.id);
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
      userLikes = new Set(likes.map((l: any) => l.blogId));
      userBookmarks = new Set(bookmarks.map((b: any) => b.blogId));
    }

    const totalPages = Math.ceil(total / safeLimit);

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
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
    };
  }

  static async getMyBlogs(
    authorId: number,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      authorId,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
        include: {
          author: { select: { id: true, name: true, username: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    let userLikes = new Set<number>();
    let userBookmarks = new Set<number>();

    const blogIds = blogs.map((b: any) => b.id);
    if (blogIds.length > 0) {
      const [likes, bookmarks] = await Promise.all([
        prisma.like.findMany({
          where: { userId: authorId, blogId: { in: blogIds } },
          select: { blogId: true },
        }),
        prisma.bookmark.findMany({
          where: { userId: authorId, blogId: { in: blogIds } },
          select: { blogId: true },
        }),
      ]);
      userLikes = new Set(likes.map((l: any) => l.blogId));
      userBookmarks = new Set(bookmarks.map((b: any) => b.blogId));
    }

    const totalPages = Math.ceil(total / safeLimit);

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
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
    };
  }

  static async getById(blogId: number, currentUserId?: number) {
    const blog = await prisma.blog.findFirst({
      where: { id: blogId, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!blog) throw new ApiError(404, "Blog not found");

    let isLiked = false;
    let isBookmarked = false;

    if (currentUserId) {
      const [like, bookmark] = await Promise.all([
        prisma.like.findUnique({
          where: { userId_blogId: { userId: currentUserId, blogId } },
        }),
        prisma.bookmark.findUnique({
          where: { userId_blogId: { userId: currentUserId, blogId } },
        }),
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
    if (role !== "ADMIN" && blog.authorId !== authorId)
      throw new ApiError(403, "Forbidden: you do not own this blog");

    logger.info({ blogId, authorId }, "Updating blog");
    return await prisma.blog.update({
      where: { id: blogId },
      data,
      include: {
        author: { select: { id: true, name: true, username: true } },
      },
    });
  }

  static async softDelete(blogId: number, authorId: number, role: string) {
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });

    if (!blog || blog.deletedAt) throw new ApiError(404, "Blog not found");
    if (role !== "ADMIN" && blog.authorId !== authorId)
      throw new ApiError(403, "Forbidden: you do not own this blog");

    logger.info({ blogId, authorId }, "Soft deleting blog");
    await prisma.blog.update({
      where: { id: blogId },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
