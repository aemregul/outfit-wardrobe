import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { UserProfileRequest, UserProfileResponse } from '../types/user.types';

export const userApi = {
  getMe: () =>
    axiosClient.get<ApiResponse<UserProfileResponse>>('/me'),
  updateMe: (data: UserProfileRequest) =>
    axiosClient.put<ApiResponse<UserProfileResponse>>('/me', data),
};
