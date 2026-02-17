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

export const updateComment = async (
  commentId: number,
  userId: number,
  role: string,
  content: string
) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Ownership check
    if (role !== "ADMIN" && comment.authorId !== userId) {
      throw new Error("Unauthorized to update this comment");
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    return updated;
  } catch (error: any) {
    console.error("Error updating comment:", error);
    throw new Error(error.message || "Failed to update comment");
  }
};

export const deleteComment = async (
  commentId: number,
  userId: number,
  role: string
) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (role !== "ADMIN" && comment.authorId !== userId) {
      throw new Error("Unauthorized to delete this comment");
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return true;
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    throw new Error(error.message || "Failed to delete comment");
  }
};


