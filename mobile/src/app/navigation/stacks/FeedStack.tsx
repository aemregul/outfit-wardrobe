import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { HomeScreen } from '../../../features/home/screens/HomeScreen';
import { OutfitDetailScreen } from '../../../features/home/screens/OutfitDetailScreen';
import { ExploreScreen } from '../../../features/social/screens/ExploreScreen';
import { CreatePostScreen } from '../../../features/social/screens/CreatePostScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed" component={HomeScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    </Stack.Navigator>
  );
}
