import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryProvider } from './src/app/providers/QueryProvider';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { AppNavigator } from './src/app/navigation/AppNavigator';

// Provider hiyerarşisi (en dıştan en içe):
// GestureHandlerRootView → gesture handling için root
// SafeAreaProvider       → safe area context (notch, home indicator)
// QueryProvider          → React Query client + AppState focusManager bridge
// AuthProvider           → web: keycloak-js stub | native: AuthProvider.native.tsx (Adım 16)
// AppNavigator           → stub | native: AppNavigator.native.tsx (Adım 14)
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
