import { axiosClient } from './axiosClient';
import type { ApiResponse, PageResponse } from '../types/api.types';
import type { WearLogResponse } from '../types/outfit.types';

export interface WearLogListParams {
  outfitId?: string;
  minRating?: number;
  wouldWearAgain?: boolean;
  page?: number;
  size?: number;
}

export const wearLogApi = {
  list: (params?: WearLogListParams) =>
    axiosClient.get<PageResponse<WearLogResponse>>('/wear-logs', { params }),

  getOne: (id: string) =>
    axiosClient.get<ApiResponse<WearLogResponse>>(`/wear-logs/${id}`),

  remove: (id: string) =>
    axiosClient.delete(`/wear-logs/${id}`),
};
