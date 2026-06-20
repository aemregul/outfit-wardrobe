import { axiosClient } from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api.types';
import {
  AIGenerateRequest,
  OutfitRequest,
  OutfitResponse,
  WearLogRequest,
  WearLogResponse,
} from '../types/outfit.types';

export interface OutfitListParams {
  isFavorite?: boolean;
  aiGenerated?: boolean;
  occasion?: string;
  season?: string;
  style?: string;
  page?: number;
  size?: number;
}

export const outfitApi = {
  list: (params?: OutfitListParams) =>
    axiosClient.get<PageResponse<OutfitResponse>>('/outfits', { params }),

  getOne: (id: string) =>
    axiosClient.get<ApiResponse<OutfitResponse>>(`/outfits/${id}`),

  create: (data: OutfitRequest) =>
    axiosClient.post<ApiResponse<OutfitResponse>>('/outfits', data),

  update: (id: string, data: OutfitRequest) =>
    axiosClient.put<ApiResponse<OutfitResponse>>(`/outfits/${id}`, data),

  remove: (id: string) =>
    axiosClient.delete(`/outfits/${id}`),

  generate: (data?: AIGenerateRequest) =>
    axiosClient.post<ApiResponse<OutfitResponse>>('/outfits/generate', data ?? {}),

  addFavorite: (id: string) =>
    axiosClient.post<ApiResponse<OutfitResponse>>(`/outfits/${id}/favorite`),

  removeFavorite: (id: string) =>
    axiosClient.delete<ApiResponse<OutfitResponse>>(`/outfits/${id}/favorite`),

  markWorn: (outfitId: string, data?: WearLogRequest) =>
    axiosClient.post<ApiResponse<WearLogResponse>>(`/outfits/${outfitId}/wear`, data ?? {}),
};
