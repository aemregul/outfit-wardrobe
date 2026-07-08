import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { ProfileScreen } from '../../../features/profile/screens/ProfileScreen';
import { SettingsScreen } from '../../../features/settings/screens/SettingsScreen';
import { EditProfileScreen } from '../../../features/profile/screens/EditProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}
