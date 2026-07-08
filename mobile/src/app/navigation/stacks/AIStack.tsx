import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { AIHubScreen } from '../../../features/ai/screens/AIHubScreen';
import { AIChatScreen } from '../../../features/ai/screens/AIChatScreen';
import { VirtualTryOnScreen } from '../../../features/ai/screens/VirtualTryOnScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AIStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WearLogList" component={AIHubScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
    </Stack.Navigator>
  );
}
