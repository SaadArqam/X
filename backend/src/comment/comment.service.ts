import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { Role } from "@prisma/client";

interface CreateCommentInput {
  content: string;
  parentId?: number;
}

/* ================= CREATE ================= */

export const createComment = async (
  blogId: number,
  userId: number,
  input: CreateCommentInput
) => {
  const { content, parentId } = input;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
    });

    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }

    if (parentComment.blogId !== blogId) {
      throw new ApiError(
        400,
        "Parent comment does not belong to this blog"
      );
    }
  }

  return prisma.comment.create({
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
};

/* ================= GET NESTED ================= */

export const getCommentsByBlog = async (blogId: number) => {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) {
    throw new ApiError(404, "Blog not found");
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
    orderBy: { createdAt: "asc" },
  });

  const map = new Map<number, any>();
  const roots: any[] = [];

  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach((comment) => {
    if (comment.parentId) {
      map.get(comment.parentId)?.replies.push(map.get(comment.id));
    } else {
      roots.push(map.get(comment.id));
    }
  });

  return roots;
};

/* ================= UPDATE ================= */

export const updateComment = async (
  commentId: number,
  userId: number,
  role: Role,
  content: string
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (role !== "ADMIN" && comment.authorId !== userId) {
    throw new ApiError(403, "Unauthorized to update this comment");
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });
};

/* ================= DELETE ================= */

export const deleteComment = async (
  commentId: number,
  userId: number,
  role: Role
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (role !== "ADMIN" && comment.authorId !== userId) {
    throw new ApiError(403, "Unauthorized to delete this comment");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return true;
};
