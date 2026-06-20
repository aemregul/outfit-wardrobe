import { axiosClient } from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api.types';
import { ClothingItemRequest, ClothingItemResponse } from '../types/clothing.types';

export interface ClothingListParams {
  category?: string;
  isClean?: boolean;
  season?: string;
  style?: string;
  page?: number;
  size?: number;
}

export const wardrobeApi = {
  list: (params?: ClothingListParams) =>
    axiosClient.get<PageResponse<ClothingItemResponse>>('/clothing', { params }),

  getOne: (id: string) =>
    axiosClient.get<ApiResponse<ClothingItemResponse>>(`/clothing/${id}`),

  create: (data: ClothingItemRequest) =>
    axiosClient.post<ApiResponse<ClothingItemResponse>>('/clothing', data),

  update: (id: string, data: ClothingItemRequest) =>
    axiosClient.put<ApiResponse<ClothingItemResponse>>(`/clothing/${id}`, data),

  remove: (id: string) =>
    axiosClient.delete(`/clothing/${id}`),

  markClean: (id: string) =>
    axiosClient.post<ApiResponse<ClothingItemResponse>>(`/clothing/${id}/mark-clean`),

  markDirty: (id: string) =>
    axiosClient.post<ApiResponse<ClothingItemResponse>>(`/clothing/${id}/mark-dirty`),
};
