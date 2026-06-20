import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore';
import { resetToLogin } from '../navigation/navigationRef';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// AuthProvider.native.tsx bu fonksiyonu çağırarak token yenileme callback'ini kaydeder.
// Faz 3'te AuthProvider.native.tsx tamamlandığında wired up edilecek.
type RefresherFn = () => Promise<{ accessToken: string }>;
let _refresher: RefresherFn | null = null;

export function configureTokenRefresh(refresher: RefresherFn | null): void {
  _refresher = refresher;
}

// Request interceptor — Bearer token
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 mutex — tek seferde bir yenileme denemesi
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(token: string | null, error: unknown): void {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config as RetryConfig | undefined;

    if (error.response?.status !== 401 || !originalConfig || originalConfig._retry) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    // Zaten yenileme sürüyorsa kuyruğa al
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalConfig.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalConfig);
      });
    }

    isRefreshing = true;

    try {
      if (_refresher) {
        const { accessToken } = await _refresher();
        useAuthStore.getState().setToken(accessToken);
        drainQueue(accessToken, null);
        originalConfig.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalConfig);
      } else {
        // Refresher henüz yapılandırılmadı (Faz 3 öncesi) — direkt çıkış
        throw new Error('token-refresh-not-configured');
      }
    } catch (err) {
      drainQueue(null, err);
      useAuthStore.getState().clear();
      resetToLogin();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
