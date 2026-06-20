import { axiosClient } from './axiosClient';
import type { ApiResponse, PageResponse } from '../types/api.types';
import type { ClothingItemRequest, ClothingItemResponse } from '../types/clothing.types';

export interface ClothingAnalysisResult {
  category?: string;
  subCategory?: string;
  colors?: string[];
  styles?: string[];
  seasons?: string[];
  material?: string;
  pattern?: string;
  occasions?: string[];
  confidenceScore?: number;
}

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

  analyze: (imageUrl: string) =>
    axiosClient.post<ApiResponse<ClothingAnalysisResult>>('/clothing/analyze', { imageUrl }),
};
