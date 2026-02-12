import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export class BlogCrud {
  // CREATE
  static async create(title: string, content: string, authorId: number) {
    try {
      if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
      }
      const blog = await prisma.blog.create({
        data: {
          title,
          content,
          authorId,
          published: false,
        },
      });
      return blog;
    } catch (err: any) {
      if (err?.code && err?.meta) {
        console.error("Prisma error code:", err.code);
        console.error("Prisma error meta:", err.meta);
      }

      console.error("BlogCrud.create error:", err?.message ?? err);
      throw err;
    }
  }

  // READ
  static async get(authorId: number) {
    try {
      const blogs = await prisma.blog.findMany({
        where: {
          authorId: authorId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return blogs;
    } catch (err: any) {
      if (err?.code && err?.meta) {
        console.error("Prisma error code:", err.code);
        console.error("Prisma error meta:", err.meta);
      }

      console.error("BlogCrud.getMyBlogs error:", err?.message ?? err);
      throw err;
    }
  }

  // READ — PUBLIC BLOGS (WITH PAGINATION + SEARCH)
  static async getPublished(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      const blogs = await prisma.blog.findMany({
        where: {
          published: true,
          ...(search && {
            title: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const total = await prisma.blog.count({
        where: {
          published: true,
          ...(search && {
            title: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
      });

      return {
        data: blogs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err: any) {
      console.error("BlogCrud.getPublished error:", err?.message ?? err);
      throw err;
    }
  }

  // READ — SINGLE BLOG BY ID
  static async getById(blogId: number) {
    try {
      const blog = await prisma.blog.findFirst({
        where: {
          id: blogId,
          published: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!blog) {
        throw new ApiError(404, "Blog not found");
      }

      return blog;
    } catch (err: any) {
      if (err?.code && err?.meta) {
        console.error("Prisma error code:", err.code);
        console.error("Prisma error meta:", err.meta);
      }
      console.error("BlogCrud.getById error:", err?.message ?? err);
      throw err;
    }
  }

  // UPDATE
  static async update(
    blogId: number,
    authorId: number,
    title?: string,
    content?: string,
  ) {
    try {
      const blog = await prisma.blog.findFirst({
        where: {
          id: blogId,
          authorId: authorId,
        },
      });

      if (!blog) {
        throw new ApiError(404, "Blog not found or unauthorized");
      }
      const updatedBlog = await prisma.blog.update({
        where: { id: blogId },
        data: {
          title: title ?? blog.title,
          content: content ?? blog.content,
        },
      });

      return updatedBlog;
    } catch (err: any) {
      if (err?.code && err?.meta) {
        console.error("Prisma error code:", err.code);
        console.error("Prisma error meta:", err.meta);
      }
      console.error("BlogCrud.update error:", err?.message ?? err);
      throw err;
    }
  }

  // UPDATE — PUBLISH / UNPUBLISH
  static async togglePublish(
    blogId: number,
    authorId: number,
    publish: boolean,
  ) {
    try {
      const blog = await prisma.blog.findFirst({
        where: {
          id: blogId,
          authorId: authorId,
        },
      });

      if (!blog) {
        throw new ApiError(404, "Blog not found or unauthorized");
      }

      const updatedBlog = await prisma.blog.update({
        where: { id: blogId },
        data: {
          published: publish,
        },
      });

      return updatedBlog;
    } catch (err: any) {
      if (err?.code && err?.meta) {
        console.error("Prisma error code:", err.code);
        console.error("Prisma error meta:", err.meta);
      }
      console.error("BlogCrud.togglePublish error:", err?.message ?? err);
      throw err;
    }
  }

  // DELETE
  static async delete(blogId: number, authorId: number) {
    try {
      const blog = await prisma.blog.findFirst({
        where: {
          id: blogId,
          authorId: authorId,
        },
      });

      if (!blog) {
        throw new ApiError(404, "Blog not found or unauthorized");
      }

      await prisma.blog.delete({
        where: { id: blogId },
      });

      return { success: true };
    } catch (err: any) {
      if (err?.code && err?.meta) {
        console.error("Prisma error code:", err.code);
        console.error("Prisma error meta:", err.meta);
      }
      console.error("BlogCrud.delete error:", err?.message ?? err);
      throw err;
    }
  }
}
