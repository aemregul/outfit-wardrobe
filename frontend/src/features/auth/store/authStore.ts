import { create } from 'zustand';

interface AuthUser {
  keycloakId: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setToken: (token) => set({ token, isAuthenticated: true }),

  setUser: (user) => set({ user }),

  clear: () => set({ token: null, user: null, isAuthenticated: false }),
}));
