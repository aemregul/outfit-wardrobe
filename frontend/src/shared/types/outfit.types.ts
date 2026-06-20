import { ClothingItemResponse } from './clothing.types';

export interface OutfitResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  clothingItems: ClothingItemResponse[];
  occasion?: string[];
  seasons?: string[];
  styles?: string[];
  aiGenerated: boolean;
  aiReason?: string;
  aiScore?: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OutfitRequest {
  name: string;
  description?: string;
  clothingItemIds: string[];
  occasion?: string[];
  seasons?: string[];
  styles?: string[];
}

export interface AIGenerateRequest {
  occasion?: string;
  season?: string;
}

export interface WearLogRequest {
  wornAt?: string;
  occasion?: string;
  location?: string;
  rating?: number;
  note?: string;
  wouldWearAgain?: boolean;
}

export interface WearLogResponse {
  id: string;
  userId: string;
  outfitId: string;
  wornAt: string;
  location?: string;
  occasion?: string;
  rating?: number;
  photoUrl?: string;
  note?: string;
  wouldWearAgain?: boolean;
  createdAt: string;
}

export const OUTFIT_SEASONS = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON'] as const;
export const OUTFIT_OCCASIONS = ['Günlük', 'İş', 'Akşam Yemeği', 'Düğün', 'Spor', 'Seyahat', 'Özel Gün'] as const;

export const SEASON_LABELS: Record<string, string> = {
  SPRING: 'İlkbahar',
  SUMMER: 'Yaz',
  AUTUMN: 'Sonbahar',
  WINTER: 'Kış',
  ALL_SEASON: 'Tüm Mevsimler',
};
