import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { WardrobeListScreen } from '../../features/wardrobe/screens/WardrobeListScreen';
import { AddClothingScreen } from '../../features/wardrobe/screens/AddClothingScreen';
import { ClothingDetailScreen } from '../../features/wardrobe/screens/ClothingDetailScreen';
import { OutfitListScreen } from '../../features/outfits/screens/OutfitListScreen';
import { OutfitDetailScreen } from '../../features/outfits/screens/OutfitDetailScreen';
import { GenerateOutfitScreen } from '../../features/outfits/screens/GenerateOutfitScreen';
import { WearLogListScreen } from '../../features/wearlogs/screens/WearLogListScreen';
import { WearLogDetailScreen } from '../../features/wearlogs/screens/WearLogDetailScreen';
import { FeedScreen } from '../../features/social/screens/FeedScreen';
import { CreatePostScreen } from '../../features/social/screens/CreatePostScreen';
import { PostDetailScreen } from '../../features/social/screens/PostDetailScreen';
import { UserProfilePublicScreen } from '../../features/social/screens/UserProfilePublicScreen';
import { ExploreScreen } from '../../features/social/screens/ExploreScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';

export type RootStackParamList = {
  Dashboard: undefined;
  WardrobeList: undefined;
  AddClothing: undefined;
  ClothingDetail: { id: string };
  OutfitList: undefined;
  OutfitDetail: { id: string };
  GenerateOutfit: undefined;
  WearLogList: undefined;
  WearLogDetail: { id: string };
  Feed: undefined;
  Explore: undefined;
  CreatePost: undefined;
  PostDetail: { id: string };
  UserProfile: { id: string };
  Profile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="WardrobeList" component={WardrobeListScreen} />
        <Stack.Screen name="AddClothing" component={AddClothingScreen} />
        <Stack.Screen name="ClothingDetail" component={ClothingDetailScreen} />
        <Stack.Screen name="OutfitList" component={OutfitListScreen} />
        <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
        <Stack.Screen name="GenerateOutfit" component={GenerateOutfitScreen} />
        <Stack.Screen name="WearLogList" component={WearLogListScreen} />
        <Stack.Screen name="WearLogDetail" component={WearLogDetailScreen} />
        <Stack.Screen name="Feed" component={FeedScreen} />
        <Stack.Screen name="Explore" component={ExploreScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="UserProfile" component={UserProfilePublicScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
