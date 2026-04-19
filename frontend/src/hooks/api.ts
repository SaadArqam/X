import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import api from '@/lib/api';
import { Blog, Comment, User, ApiResponse } from '@/types';

export const useBlogs = (search?: string, tag?: string) => {
  return useInfiniteQuery({
    queryKey: ['blogs', { search, tag }],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get('/blogs', {
        params: { page: pageParam, limit: 10, search, tag },
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasNext) return lastPage.meta.page + 1;
      return undefined;
    },
  });
};

export const useBlog = (id: string) => {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Blog>>(`/blogs/${id}`);
      return res.data.data;
    },
    enabled: !!id && id !== 'create',
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Blog>) => {
      const res = await api.post<ApiResponse<Blog>>('/blogs', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

export const useUpdateBlog = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Blog>) => {
      const res = await api.put<ApiResponse<Blog>>(`/blogs/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/blogs/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.removeQueries({ queryKey: ['blog', id] });
    },
  });
};

export const useLikeBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isLiked }: { id: number; isLiked: boolean }) => {
      const url = `/engagement/like`;
      console.log("REQUEST:", url);
      
      const res = await api.post<ApiResponse<{ liked: boolean }>>(url, { blogId: id });
      
      console.log("RESPONSE:", res.data);
      return res.data.data;
    },
    onMutate: async ({ id, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['blog', String(id)] });
      await queryClient.cancelQueries({ queryKey: ['blogs'] });

      const prevBlog = queryClient.getQueryData(['blog', String(id)]);
      const prevBlogs = queryClient.getQueryData(['blogs']);

      if (prevBlog) {
        queryClient.setQueryData(['blog', String(id)], (old: any) => ({
          ...old,
          isLiked: !isLiked,
          likesCount: isLiked ? Math.max(0, old.likesCount - 1) : old.likesCount + 1,
        }));
      }

      queryClient.setQueriesData({ queryKey: ['blogs'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((b: any) =>
              b.id === id ? { ...b, isLiked: !isLiked, likesCount: isLiked ? Math.max(0, b.likesCount - 1) : b.likesCount + 1 } : b
            ),
          })),
        };
      });

      return { prevBlog, prevBlogs, id };
    },
    onError: (err, variables, context) => {
      if (context?.prevBlog) {
        queryClient.setQueryData(['blog', String(context.id)], context.prevBlog);
      }
      if (context?.prevBlogs) {
        queryClient.setQueryData(['blogs'], context.prevBlogs);
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', String(id)] });
    },
  });
};

export const useBookmarkBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isBookmarked }: { id: number; isBookmarked: boolean }) => {
      const url = `/engagement/bookmark`;
      console.log("REQUEST:", url);
      
      const res = await api.post<ApiResponse<{ bookmarked: boolean }>>(url, { blogId: id });
      
      console.log("RESPONSE:", res.data);
      return res.data.data;
    },
    onMutate: async ({ id, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey: ['blog', String(id)] });
      await queryClient.cancelQueries({ queryKey: ['blogs'] });

      const prevBlog = queryClient.getQueryData(['blog', String(id)]);
      const prevBlogs = queryClient.getQueryData(['blogs']);

      if (prevBlog) {
        queryClient.setQueryData(['blog', String(id)], (old: any) => ({
          ...old,
          isBookmarked: !isBookmarked,
        }));
      }

      queryClient.setQueriesData({ queryKey: ['blogs'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((b: any) =>
              b.id === id ? { ...b, isBookmarked: !isBookmarked } : b
            ),
          })),
        };
      });

      return { prevBlog, prevBlogs, id };
    },
    onError: (err, variables, context) => {
      if (context?.prevBlog) {
        queryClient.setQueryData(['blog', String(context.id)], context.prevBlog);
      }
      if (context?.prevBlogs) {
        queryClient.setQueryData(['blogs'], context.prevBlogs);
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', String(id)] });
    },
  });
};

export const useComments = (blogId: string) => {
  return useQuery({
    queryKey: ['comments', blogId],
    queryFn: async () => {
      const url = `/comments/blog/${blogId}`;
      console.log("REQUEST:", url);
      const res = await api.get<ApiResponse<Comment[]>>(url);
      console.log("RESPONSE:", res.data);
      return res.data.data;
    },
    enabled: !!blogId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      blogId,
      content,
      parentId,
    }: {
      blogId: string;
      content: string;
      parentId?: number | null;
    }) => {
      const url = `/comments`;
      const payload = {
        blogId: Number(blogId),
        content: content.trim(),
        parentId: parentId || null
      };
      
      console.log("REQUEST:", url);
      console.log("COMMENT PAYLOAD:", payload);
      
      const res = await api.post<ApiResponse<Comment>>(url, payload);
      console.log("RESPONSE:", res.data);
      
      return res.data.data;
    },
    onSuccess: (_, { blogId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
      queryClient.invalidateQueries({ queryKey: ['blog', blogId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, blogId }: { id: string; blogId: string }) => {
      await api.delete(`/comments/${id}`);
      return blogId;
    },
    onSuccess: (blogId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const url = '/auth/me';
      console.log("REQUEST:", url);
      const res = await api.get(url);
      console.log("RESPONSE:", res.data);
      return res.data.data;
    },
  });
};

export const useUserBlogs = (userId: string) => {
  return useQuery({
    queryKey: ['blogs', userId],
    queryFn: async () => {
      // Assuming 'me' logic for profile page since backend enforces my-blogs
      const url = '/blogs/my-blogs';
      console.log("REQUEST:", url);
      const res = await api.get(url);
      console.log("RESPONSE:", res.data);
      return res.data.data;
    },
    enabled: !!userId,
  });
};

export const useUserBookmarks = (userId: string) => {
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: async () => {
      const url = '/engagement/bookmarks';
      console.log("REQUEST:", url);
      const res = await api.get(url);
      console.log("RESPONSE:", res.data);
      return res.data.data;
    },
    enabled: !!userId,
  });
};