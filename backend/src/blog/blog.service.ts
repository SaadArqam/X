import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export class BlogCrud {
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
}
