import { prisma } from "../config/prisma";

interface CreateCommentInput {
  content: string;
  parentId?: number;
}

export const createComment = async (
  blogId: number,
  userId: number,
  input: CreateCommentInput,
) => {
  try {
    const { content, parentId } = input;

    const blog = await prisma.blog.findUnique({
      where: {
        id: blogId,
      },
    });
    if (!blog) {
      throw new Error("Blog not found");
    }
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
      if (parentComment.blogId !== blogId) {
        throw new Error("Parent comment does not belong to this blog");
      }
    }
    const commnet = await prisma.comment.create({
      data: {
        content,
        blogId,
        authorId: userId,
        parentId: parentId ?? null,
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
    return commnet
  } catch (error: any) {
    console.error("Error creating comment:", error);
    throw new Error(error.message || "Failed to create comment");
  }
};

export const getCommentsByBlog = async (blogId: number) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    })

    if (!blog) {
      throw new Error("Blog not found")
    }

    const comments = await prisma.comment.findMany({
      where: { blogId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })


    const map = new Map<number, any>()
    const roots: any[] = []

    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] })
    })

    comments.forEach((comment) => {
      if (comment.parentId) {
        const parent = map.get(comment.parentId)
        parent?.replies.push(map.get(comment.id))
      } else {
        roots.push(map.get(comment.id))
      }
    })

    return roots
  } catch (error: any) {
    console.error("Error fetching comments:", error)
    throw new Error(error.message || "Failed to fetch comments")
  }
}

