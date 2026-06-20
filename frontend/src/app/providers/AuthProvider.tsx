// Native platform stub — keycloak-js DOM bağımlılığı yüzünden native'de kullanılamaz.
// Mobile implementasyonu Faz 3'te AuthProvider.native.tsx olarak eklenecek.
// Web'de Metro bu dosya yerine AuthProvider.web.tsx'i seçer.
import React from 'react';
import { View, Text } from 'react-native';
import Keycloak from 'keycloak-js';

interface KeycloakContextValue {
  keycloak: Keycloak | null;
  logout: () => void;
}

export { KeycloakContextValue };

export function useKeycloak(): KeycloakContextValue {
  throw new Error('useKeycloak: native platformda AuthProvider.native.tsx henüz implemente edilmedi.');
}

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Native auth henüz hazır değil. Faz 3'te gelecek.</Text>
    </View>
  );
}
