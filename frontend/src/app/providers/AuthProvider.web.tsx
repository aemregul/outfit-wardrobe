import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Keycloak from 'keycloak-js';
import { ActivityIndicator, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../features/auth/store/authStore';
import { userApi } from '../../shared/api/userApi';
import { QUERY_KEYS } from '../../shared/constants/queryKeys';

const KEYCLOAK_URL =
  process.env.EXPO_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8081';
const KEYCLOAK_REALM =
  process.env.EXPO_PUBLIC_KEYCLOAK_REALM ?? 'outfit-combine';
const KEYCLOAK_CLIENT_ID =
  process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'outfit-combine-web';

interface KeycloakContextValue {
  keycloak: Keycloak | null;
  logout: () => void;
}

const KeycloakContext = createContext<KeycloakContextValue>({
  keycloak: null,
  logout: () => {},
});

export function useKeycloak() {
  return useContext(KeycloakContext);
}

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const keycloakRef = useRef<Keycloak | null>(null);
  const [ready, setReady] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    const kc = new Keycloak({
      url: KEYCLOAK_URL,
      realm: KEYCLOAK_REALM,
      clientId: KEYCLOAK_CLIENT_ID,
    });
    keycloakRef.current = kc;

    kc.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256',
    })
      .then((authenticated) => {
        if (authenticated && kc.token) {
          applyToken(kc);
        } else {
          clear();
        }
      })
      .catch(() => clear())
      .finally(() => setReady(true));

    // Refresh token 30 s before expiry
    kc.onTokenExpired = () => {
      kc.updateToken(30)
        .then(() => { if (kc.token) applyToken(kc); })
        .catch(() => { clear(); kc.login(); });
    };
  }, []);

  // Fetch backend profile when authenticated — creates user_profiles row on first login
  useEffect(() => {
    if (isAuthenticated) {
      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.ME],
        queryFn: () => userApi.getMe().then((r) => r.data.data),
      });
    } else {
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.ME] });
    }
  }, [isAuthenticated, queryClient]);

  function applyToken(kc: Keycloak) {
    setToken(kc.token!);
    const parsed = kc.tokenParsed as Record<string, string> | undefined;
    if (parsed) {
      setUser({
        keycloakId: kc.subject ?? '',
        username: parsed['preferred_username'],
        email: parsed['email'],
        firstName: parsed['given_name'],
        lastName: parsed['family_name'],
      });
    }
  }

  function logout() {
    clear();
    keycloakRef.current?.logout({ redirectUri: window.location.origin });
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <KeycloakContext.Provider value={{ keycloak: keycloakRef.current, logout }}>
      {children}
    </KeycloakContext.Provider>
  );
}
