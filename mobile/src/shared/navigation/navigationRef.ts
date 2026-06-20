import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../../app/navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// NavigationContainer henüz mount olmadan resetToLogin çağrılırsa
// burada tutulur, onNavigationReady() geldiğinde çalıştırılır.
let pendingReset: (() => void) | null = null;

export function resetToLogin(): void {
  const doReset = () =>
    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });

  if (navigationRef.isReady()) {
    doReset();
  } else {
    pendingReset = doReset;
  }
}

// NavigationContainer'ın onReady callback'inde çağrılır
export function onNavigationReady(): void {
  if (pendingReset) {
    pendingReset();
    pendingReset = null;
  }
}
