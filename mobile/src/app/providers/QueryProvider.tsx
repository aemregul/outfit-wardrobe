import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 dakika
      refetchOnWindowFocus: true,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export function QueryProvider({ children }: Props) {
  // Uygulama foreground'a döndüğünde stale query'leri yenile (TB-9)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
