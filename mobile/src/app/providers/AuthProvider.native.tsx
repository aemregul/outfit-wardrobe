import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../features/auth/store/authStore';
import { configureTokenRefresh } from '../../shared/api/axiosClient';
import { usePushNotifications } from '../../shared/hooks/usePushNotifications';

const KEYCLOAK_URL =
  process.env.EXPO_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8081';
const KEYCLOAK_REALM =
  process.env.EXPO_PUBLIC_KEYCLOAK_REALM ?? 'outfit-combine';
const KEYCLOAK_CLIENT_ID =
  process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID_NATIVE ?? 'outfit-combine-mobile';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.accessToken',
  REFRESH_TOKEN: 'auth.refreshToken',
} as const;

interface AuthContextValue {
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  logout: async () => {},
});

export function useKeycloak() {
  return useContext(AuthContext);
}

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [isReady, setIsReady] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const clear = useAuthStore((s) => s.clear);

  usePushNotifications();

  useEffect(() => {
    configureTokenRefresh(async () => {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error('no-refresh-token');

      const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: KEYCLOAK_CLIENT_ID,
        refresh_token: refreshToken,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!response.ok) throw new Error('refresh-failed');

      const data = (await response.json()) as {
        access_token: string;
        refresh_token: string;
      };

      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      setToken(data.access_token);

      return { accessToken: data.access_token };
    });

    return () => {
      configureTokenRefresh(null);
    };
  }, []);

  useEffect(() => {
    async function init() {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) setToken(token);
      setIsReady(true);
    }
    init();
  }, []);

  async function logout() {
    clear();
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
}
