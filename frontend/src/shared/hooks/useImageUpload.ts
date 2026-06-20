import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadApi } from '../api/uploadApi';
import type { UploadFolder } from '../types/upload.types';

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type SupportedMime = typeof SUPPORTED_MIME_TYPES[number];

function resolveContentType(mimeType?: string | null): SupportedMime {
  if (mimeType && SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMime)) {
    return mimeType as SupportedMime;
  }
  return 'image/jpeg';
}

export function useImageUpload(folder: UploadFolder) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function pickAndUpload(): Promise<string | null> {
    setUploadError(null);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    const contentType = resolveContentType(asset.mimeType);

    setIsUploading(true);
    try {
      // Request presigned URL from backend (uses axiosClient with Bearer token)
      const { data: apiResp } = await uploadApi.presigned(folder, contentType);
      const { presignedUrl, publicUrl } = apiResp.data;

      // Fetch the picked file as a Blob (works with blob:// and data: URIs on web)
      const fileResp = await fetch(asset.uri);
      const blob = await fileResp.blob();

      // PUT directly to MinIO — no Bearer header (auth is in presigned URL query params)
      const putResp = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });

      if (!putResp.ok) {
        throw new Error(`Yükleme başarısız: HTTP ${putResp.status}`);
      }

      return publicUrl;
    } catch (err: any) {
      setUploadError(err?.message ?? 'Yükleme sırasında bir hata oluştu.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { pickAndUpload, isUploading, uploadError };
}
