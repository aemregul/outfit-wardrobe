import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { WardrobeListScreen } from '../../../features/wardrobe/screens/WardrobeListScreen';
import { AddClothingScreen } from '../../../features/wardrobe/screens/AddClothingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function WardrobeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WardrobeList" component={WardrobeListScreen} />
      <Stack.Screen name="AddClothing" component={AddClothingScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
