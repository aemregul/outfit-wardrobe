import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  // Auth screens
  AuthLoading: undefined;
  Onboarding: undefined;
  Login: undefined;
  ProfileSetup: undefined;
  // Main tab container
  Main: undefined;
  // Wardrobe tab screens
  WardrobeList: undefined;
  AddClothing: undefined;
  // Outfit tab screens
  OutfitList: undefined;
  GenerateOutfit: undefined;
  // Feed tab screens
  Feed: undefined;
  Explore: undefined;
  CreatePost: undefined;
  // WearLog tab screens
  WearLogList: undefined;
  WearLogDetail: { id: string };
  // Profile tab screens
  Profile: undefined;
  Settings: undefined;
  // Shared detail screens — RootStack'te, cross-tab navigate için
  ClothingDetail: { id: string };
  OutfitDetail: { id: string };
  WeatherDetail: undefined;
  PostDetail: { id: string };
  UserProfile: { id: string };
};

// useNavigation() hook'u her yerden doğru tiplerle kullanılabilsin
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
