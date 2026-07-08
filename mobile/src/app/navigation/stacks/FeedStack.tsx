import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { HomeScreen } from '../../../features/home/screens/HomeScreen';
import { OutfitDetailScreen } from '../../../features/home/screens/OutfitDetailScreen';
import { WeatherDetailScreen } from '../../../features/home/screens/WeatherDetailScreen';
import { WeeklyPlannerScreen } from '../../../features/home/screens/WeeklyPlannerScreen';
import { PlannerScreen } from '../../../features/home/screens/PlannerScreen';
import { ExploreScreen } from '../../../features/social/screens/ExploreScreen';
import { CreatePostScreen } from '../../../features/social/screens/CreatePostScreen';
import { AIChatScreen } from '../../../features/ai/screens/AIChatScreen';
import { VirtualTryOnScreen } from '../../../features/ai/screens/VirtualTryOnScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Feed" component={HomeScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
      <Stack.Screen name="WeatherDetail" component={WeatherDetailScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen
        name="Planner"
        component={PlannerScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="WeeklyPlanner"
        component={WeeklyPlannerScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
