import {
  useMutation, useQuery, useQueryClient,
  useInfiniteQuery, InfiniteData,
} from '@tanstack/react-query';
import { socialApi, FeedParams, CommentListParams } from '../../../shared/api/socialApi';
import {
  CommentRequest, PostRequest,
  PostResponse, PublicUserProfileResponse,
} from '../../../shared/types/social.types';
import type { PageResponse } from '../../../shared/types/api.types';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';

type FeedCache = InfiniteData<PageResponse<PostResponse>>;

function patchPostInPages(
  old: FeedCache | undefined,
  postId: string,
  patch: (p: PostResponse) => PostResponse,
): FeedCache | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        content: page.data.content.map((p) => (p.id === postId ? patch(p) : p)),
      },
    })),
  };
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
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.FEED, 'infinite'] });
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.EXPLORE, 'infinite'] });
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.POST_ITEM, postId] });

      const prevFeed = qc.getQueryData<FeedCache>([QUERY_KEYS.FEED, 'infinite']);
      const prevExplore = qc.getQueryData<FeedCache>([QUERY_KEYS.EXPLORE, 'infinite']);
      const prevPost = qc.getQueryData<PostResponse>([QUERY_KEYS.POST_ITEM, postId]);

      const applyLike = (p: PostResponse) => ({
        ...p, likedByCurrentUser: true, likesCount: p.likesCount + 1,
      });

      qc.setQueryData([QUERY_KEYS.FEED, 'infinite'],
        (old: FeedCache | undefined) => patchPostInPages(old, postId, applyLike));
      qc.setQueryData([QUERY_KEYS.EXPLORE, 'infinite'],
        (old: FeedCache | undefined) => patchPostInPages(old, postId, applyLike));
      if (prevPost) {
        qc.setQueryData([QUERY_KEYS.POST_ITEM, postId], applyLike(prevPost));
      }

      return { prevFeed, prevExplore, prevPost };
    },
    onError: (_err, postId, ctx) => {
      if (ctx?.prevFeed) qc.setQueryData([QUERY_KEYS.FEED, 'infinite'], ctx.prevFeed);
      if (ctx?.prevExplore) qc.setQueryData([QUERY_KEYS.EXPLORE, 'infinite'], ctx.prevExplore);
      if (ctx?.prevPost) qc.setQueryData([QUERY_KEYS.POST_ITEM, postId], ctx.prevPost);
    },
    onSettled: (_data, _err, postId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED, 'infinite'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.EXPLORE, 'infinite'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POST_ITEM, postId] });
    },
  });
}

export function useUnlikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => socialApi.unlikePost(id),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.FEED, 'infinite'] });
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.EXPLORE, 'infinite'] });
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.POST_ITEM, postId] });

      const prevFeed = qc.getQueryData<FeedCache>([QUERY_KEYS.FEED, 'infinite']);
      const prevExplore = qc.getQueryData<FeedCache>([QUERY_KEYS.EXPLORE, 'infinite']);
      const prevPost = qc.getQueryData<PostResponse>([QUERY_KEYS.POST_ITEM, postId]);

      const applyUnlike = (p: PostResponse) => ({
        ...p, likedByCurrentUser: false, likesCount: Math.max(0, p.likesCount - 1),
      });

      qc.setQueryData([QUERY_KEYS.FEED, 'infinite'],
        (old: FeedCache | undefined) => patchPostInPages(old, postId, applyUnlike));
      qc.setQueryData([QUERY_KEYS.EXPLORE, 'infinite'],
        (old: FeedCache | undefined) => patchPostInPages(old, postId, applyUnlike));
      if (prevPost) {
        qc.setQueryData([QUERY_KEYS.POST_ITEM, postId], applyUnlike(prevPost));
      }

      return { prevFeed, prevExplore, prevPost };
    },
    onError: (_err, postId, ctx) => {
      if (ctx?.prevFeed) qc.setQueryData([QUERY_KEYS.FEED, 'infinite'], ctx.prevFeed);
      if (ctx?.prevExplore) qc.setQueryData([QUERY_KEYS.EXPLORE, 'infinite'], ctx.prevExplore);
      if (ctx?.prevPost) qc.setQueryData([QUERY_KEYS.POST_ITEM, postId], ctx.prevPost);
    },
    onSettled: (_data, _err, postId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED, 'infinite'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.EXPLORE, 'infinite'] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POST_ITEM, postId] });
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
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.PUBLIC_USER, userId] });

      const prevUser = qc.getQueryData<PublicUserProfileResponse>(
        [QUERY_KEYS.PUBLIC_USER, userId],
      );
      if (prevUser) {
        qc.setQueryData([QUERY_KEYS.PUBLIC_USER, userId], {
          ...prevUser,
          isFollowing: true,
          followerCount: prevUser.followerCount + 1,
        });
      }

      return { prevUser };
    },
    onError: (_err, userId, ctx) => {
      if (ctx?.prevUser) qc.setQueryData([QUERY_KEYS.PUBLIC_USER, userId], ctx.prevUser);
    },
    onSettled: (_data, _err, userId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLIC_USER, userId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    },
  });
}

export function useUnfollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => socialApi.unfollowUser(userId),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.PUBLIC_USER, userId] });

      const prevUser = qc.getQueryData<PublicUserProfileResponse>(
        [QUERY_KEYS.PUBLIC_USER, userId],
      );
      if (prevUser) {
        qc.setQueryData([QUERY_KEYS.PUBLIC_USER, userId], {
          ...prevUser,
          isFollowing: false,
          followerCount: Math.max(0, prevUser.followerCount - 1),
        });
      }

      return { prevUser };
    },
    onError: (_err, userId, ctx) => {
      if (ctx?.prevUser) qc.setQueryData([QUERY_KEYS.PUBLIC_USER, userId], ctx.prevUser);
    },
    onSettled: (_data, _err, userId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLIC_USER, userId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    },
  });
}
