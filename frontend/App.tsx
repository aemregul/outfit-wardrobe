import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './src/app/providers/QueryProvider';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { AppNavigator } from './src/app/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
