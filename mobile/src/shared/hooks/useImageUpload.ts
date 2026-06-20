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

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setUploadError('Galeri izni gereklidir.');
      return null;
    }

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
      const { data: apiResp } = await uploadApi.presigned(folder, contentType);
      const { presignedUrl, publicUrl } = apiResp.data;

      const fileResp = await fetch(asset.uri);
      const blob = await fileResp.blob();

      const putResp = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });

      if (!putResp.ok) {
        throw new Error(`Yükleme başarısız: HTTP ${putResp.status}`);
      }

      return publicUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Yükleme sırasında bir hata oluştu.';
      setUploadError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function takeAndUpload(): Promise<string | null> {
    setUploadError(null);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setUploadError('Kamera izni gereklidir.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    const contentType = resolveContentType(asset.mimeType);

    setIsUploading(true);
    try {
      const { data: apiResp } = await uploadApi.presigned(folder, contentType);
      const { presignedUrl, publicUrl } = apiResp.data;

      const fileResp = await fetch(asset.uri);
      const blob = await fileResp.blob();

      const putResp = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });

      if (!putResp.ok) {
        throw new Error(`Yükleme başarısız: HTTP ${putResp.status}`);
      }

      return publicUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Yükleme sırasında bir hata oluştu.';
      setUploadError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { pickAndUpload, takeAndUpload, isUploading, uploadError };
}
