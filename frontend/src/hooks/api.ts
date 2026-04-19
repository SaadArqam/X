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
    mutationFn: async (id: number) => {
      const res = await api.post<ApiResponse<Blog>>(`/blogs/${id}/like`);
      return res.data.data;
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: ['blog', String(id)] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

export const useBookmarkBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post<ApiResponse<Blog>>(`/blogs/${id}/bookmark`);
      return res.data.data;
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: ['blog', String(id)] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

export const useComments = (blogId: string) => {
  return useQuery({
    queryKey: ['comments', blogId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Comment[]>>(
        `/blogs/${blogId}/comments`
      );
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
      parentId?: string;
    }) => {
      const res = await api.post<ApiResponse<Comment>>(
        `/blogs/${blogId}/comments`,
        { content, parentId }
      );
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

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/profile`);
      return res.data.data;
    },
    enabled: !!userId,
  });
};