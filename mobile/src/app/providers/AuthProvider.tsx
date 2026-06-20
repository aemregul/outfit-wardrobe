import React from 'react';

// TypeScript stub — Metro bu dosya yerine AuthProvider.native.tsx'i seçer (Adım 16).
// Native implementasyon: expo-auth-session PKCE + SecureStore persistence.
export function useKeycloak() {
  return { logout: () => {} };
}

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  // Adım 16'da AuthProvider.native.tsx ile değiştirilecek
  return <>{children}</>;
}
