import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { PresignedUploadResponse, UploadFolder } from '../types/upload.types';

export const uploadApi = {
  presigned: (folder: UploadFolder, contentType: string) =>
    axiosClient.post<ApiResponse<PresignedUploadResponse>>('/upload/presigned', {
      folder,
      contentType,
    }),
};
