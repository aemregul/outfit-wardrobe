import { axiosClient } from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api.types';
import {
  CommentRequest, CommentResponse, PostRequest, PostResponse,
  PublicUserProfileResponse,
} from '../types/social.types';

export interface FeedParams {
  page?: number;
  size?: number;
}

export interface CommentListParams {
  page?: number;
  size?: number;
}

export const socialApi = {
  getFeed: (params?: FeedParams) =>
    axiosClient.get<PageResponse<PostResponse>>('/feed', { params }),

  getExplore: (params?: FeedParams) =>
    axiosClient.get<PageResponse<PostResponse>>('/posts/explore', { params }),

  getPost: (id: string) =>
    axiosClient.get<ApiResponse<PostResponse>>(`/posts/${id}`),

  createPost: (data: PostRequest) =>
    axiosClient.post<ApiResponse<PostResponse>>('/posts', data),

  deletePost: (id: string) =>
    axiosClient.delete(`/posts/${id}`),

  likePost: (id: string) =>
    axiosClient.post<ApiResponse<PostResponse>>(`/posts/${id}/like`),

  unlikePost: (id: string) =>
    axiosClient.delete<ApiResponse<PostResponse>>(`/posts/${id}/like`),

  getComments: (postId: string, params?: CommentListParams) =>
    axiosClient.get<PageResponse<CommentResponse>>(`/posts/${postId}/comments`, { params }),

  addComment: (postId: string, data: CommentRequest) =>
    axiosClient.post<ApiResponse<CommentResponse>>(`/posts/${postId}/comments`, data),

  deleteComment: (commentId: string) =>
    axiosClient.delete<ApiResponse<unknown>>(`/comments/${commentId}`),

  getUser: (userId: string) =>
    axiosClient.get<ApiResponse<PublicUserProfileResponse>>(`/users/${userId}`),

  followUser: (userId: string) =>
    axiosClient.post<void>(`/users/${userId}/follow`),

  unfollowUser: (userId: string) =>
    axiosClient.delete<void>(`/users/${userId}/follow`),
};
