import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { WearLogListScreen } from '../../../features/wearlogs/screens/WearLogListScreen';
import { WearLogDetailScreen } from '../../../features/wearlogs/screens/WearLogDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function WearLogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WearLogList" component={WearLogListScreen} />
      <Stack.Screen name="WearLogDetail" component={WearLogDetailScreen} />
    </Stack.Navigator>
  );
}
