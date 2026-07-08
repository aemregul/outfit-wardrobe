import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { FeedScreen } from '../../../features/social/screens/FeedScreen';
import { ExploreScreen } from '../../../features/social/screens/ExploreScreen';
import { CreatePostScreen } from '../../../features/social/screens/CreatePostScreen';
import { CommentsScreen } from '../../../features/social/screens/CommentsScreen';
import { OutfitPreviewScreen } from '../../../features/social/screens/OutfitPreviewScreen';
import { WardrobeMatchScreen } from '../../../features/social/screens/WardrobeMatchScreen';
import { OutfitReadyScreen } from '../../../features/social/screens/OutfitReadyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function SocialStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="OutfitList" component={FeedScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="PostComments"
        component={CommentsScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="OutfitPreview"
        component={OutfitPreviewScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="WardrobeMatch"
        component={WardrobeMatchScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="OutfitReady"
        component={OutfitReadyScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
