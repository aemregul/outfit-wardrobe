export type UploadFolder = 'clothing' | 'profiles' | 'posts';

export interface PresignedUploadResponse {
  presignedUrl: string;
  publicUrl: string;
  objectName: string;
}
