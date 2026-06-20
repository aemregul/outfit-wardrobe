export interface UserProfileResponse {
  id: string;
  keycloakUserId: string;
  email: string;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  bio?: string;
  gender?: string;
  stylePreferences?: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileRequest {
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  gender?: string;
  stylePreferences?: string[];
  isPrivate?: boolean;
}
