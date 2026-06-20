export type ClothingCategory =
  | 'TOP' | 'BOTTOM' | 'OUTERWEAR' | 'SHOES' | 'BAG'
  | 'ACCESSORY' | 'JEWELRY' | 'DRESS' | 'SUIT'
  | 'SPORTSWEAR' | 'SPECIAL_OCCASION' | 'UNDERWEAR' | 'OTHER';

export type ClothingStyle =
  | 'CASUAL' | 'FORMAL' | 'BUSINESS' | 'SPORT' | 'STREETWEAR'
  | 'CHIC' | 'MINIMAL' | 'VINTAGE' | 'ELEGANT' | 'PARTY' | 'TRAVEL' | 'HOME';

export type ClothingSeason = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' | 'ALL_SEASON';

export interface ClothingItemResponse {
  id: string;
  userId: string;
  name: string;
  imageUrl?: string;
  category: ClothingCategory;
  subCategory?: string;
  colors?: string[];
  brand?: string;
  size?: string;
  seasons?: ClothingSeason[];
  styles?: ClothingStyle[];
  material?: string;
  pattern?: string;
  productUrl?: string;
  isClean: boolean;
  wearCount: number;
  lastWornAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClothingItemRequest {
  name: string;
  category: ClothingCategory;
  subCategory?: string;
  imageUrl?: string;
  colors?: string[];
  brand?: string;
  size?: string;
  seasons?: ClothingSeason[];
  styles?: ClothingStyle[];
  material?: string;
  pattern?: string;
  productUrl?: string;
  notes?: string;
}

export const CLOTHING_CATEGORIES: ClothingCategory[] = [
  'TOP', 'BOTTOM', 'OUTERWEAR', 'SHOES', 'BAG',
  'ACCESSORY', 'JEWELRY', 'DRESS', 'SUIT',
  'SPORTSWEAR', 'SPECIAL_OCCASION', 'UNDERWEAR', 'OTHER',
];

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  TOP: 'Üst Giyim', BOTTOM: 'Alt Giyim', OUTERWEAR: 'Dış Giyim',
  SHOES: 'Ayakkabı', BAG: 'Çanta', ACCESSORY: 'Aksesuar',
  JEWELRY: 'Takı', DRESS: 'Elbise', SUIT: 'Takım Elbise',
  SPORTSWEAR: 'Spor Giyim', SPECIAL_OCCASION: 'Özel Gün',
  UNDERWEAR: 'İç Giyim', OTHER: 'Diğer',
};

export const CLOTHING_SEASONS: ClothingSeason[] = [
  'SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON',
];

export const CLOTHING_SEASON_LABELS: Record<ClothingSeason, string> = {
  SPRING: 'İlkbahar',
  SUMMER: 'Yaz',
  AUTUMN: 'Sonbahar',
  WINTER: 'Kış',
  ALL_SEASON: 'Tüm Mevsimler',
};

export const CLOTHING_STYLES: ClothingStyle[] = [
  'CASUAL', 'FORMAL', 'BUSINESS', 'SPORT', 'STREETWEAR',
  'CHIC', 'MINIMAL', 'VINTAGE', 'ELEGANT', 'PARTY', 'TRAVEL', 'HOME',
];

export const CLOTHING_STYLE_LABELS: Record<ClothingStyle, string> = {
  CASUAL: 'Günlük',
  FORMAL: 'Resmi',
  BUSINESS: 'İş',
  SPORT: 'Spor',
  STREETWEAR: 'Sokak',
  CHIC: 'Şık',
  MINIMAL: 'Minimal',
  VINTAGE: 'Vintage',
  ELEGANT: 'Zarif',
  PARTY: 'Parti',
  TRAVEL: 'Seyahat',
  HOME: 'Ev',
};
