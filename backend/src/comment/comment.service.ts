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
