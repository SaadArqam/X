export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'AUTHOR' | 'ADMIN';
  postsCount?: number;
  likesCount?: number;
  createdAt?: string;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  author: User;
  authorId: number;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  blogId: number;
  parentId?: number;
  replies?: Comment[];
  createdAt: string;
  deletedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}