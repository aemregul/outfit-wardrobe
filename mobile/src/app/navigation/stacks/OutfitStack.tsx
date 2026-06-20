import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { OutfitListScreen } from '../../../features/outfits/screens/OutfitListScreen';
import { GenerateOutfitScreen } from '../../../features/outfits/screens/GenerateOutfitScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function OutfitStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OutfitList" component={OutfitListScreen} />
      <Stack.Screen name="GenerateOutfit" component={GenerateOutfitScreen} />
    </Stack.Navigator>
  );
}
