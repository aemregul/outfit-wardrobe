import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { socialApi, FeedParams, CommentListParams } from '../../../shared/api/socialApi';
import { CommentRequest, PostRequest } from '../../../shared/types/social.types';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';

export function useFeed(params?: FeedParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.FEED, params],
    queryFn: () => socialApi.getFeed(params).then((r) => r.data.data),
  });
}

export function useInfiniteFeed() {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.FEED, 'infinite'],
    queryFn: ({ pageParam }) =>
      socialApi.getFeed({ page: pageParam as number, size: 20 }).then(r => r.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.last ? undefined : lastPage.data.number + 1,
  });
}

export function useExplore(params?: FeedParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPLORE, params],
    queryFn: () => socialApi.getExplore(params).then((r) => r.data.data),
  });
}

export function useInfiniteExplore() {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.EXPLORE, 'infinite'],
    queryFn: ({ pageParam }) =>
      socialApi.getExplore({ page: pageParam as number, size: 20 }).then(r => r.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.last ? undefined : lastPage.data.number + 1,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.POST_ITEM, id],
    queryFn: () => socialApi.getPost(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PostRequest) => socialApi.createPost(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => socialApi.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    },
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => socialApi.likePost(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POST_ITEM, id] });
    },
  });
}

export function useUnlikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => socialApi.unlikePost(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POST_ITEM, id] });
    },
  });
}

export function useComments(postId: string, params?: CommentListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMENTS, postId, params],
    queryFn: () => socialApi.getComments(postId, params).then((r) => r.data.data),
    enabled: !!postId,
  });
}

export function useAddComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CommentRequest) => socialApi.addComment(postId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS, postId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POST_ITEM, postId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    },
  });
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => socialApi.deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS, postId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POST_ITEM, postId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    },
  });
}

export function usePublicUser(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PUBLIC_USER, id],
    queryFn: () => socialApi.getUser(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useFollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => socialApi.followUser(userId),
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLIC_USER, userId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    },
  });
}

export function useUnfollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => socialApi.unfollowUser(userId),
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLIC_USER, userId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    },
  });
}
