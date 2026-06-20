export type Visibility = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export interface PostResponse {
  id: string;
  userId: string;
  username?: string;
  displayName?: string;
  outfitId?: string;
  imageUrl: string;
  caption?: string;
  visibility: Visibility;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostRequest {
  imageUrl: string;
  caption?: string;
  outfitId?: string;
  visibility?: Visibility;
}

export interface CommentResponse {
  id: string;
  postId: string;
  userId: string;
  username?: string;
  displayName?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserProfileResponse {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isPrivate: boolean;
}

export interface CommentRequest {
  content: string;
}

export const VISIBILITY_OPTIONS: Visibility[] = ['PUBLIC', 'FOLLOWERS', 'PRIVATE'];

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  PUBLIC: 'Herkese Açık',
  FOLLOWERS: 'Takipçiler',
  PRIVATE: 'Özel',
};

export const VISIBILITY_ICONS: Record<Visibility, string> = {
  PUBLIC: '🌍',
  FOLLOWERS: '👥',
  PRIVATE: '🔒',
};
