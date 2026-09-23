import axios, { type InternalAxiosRequestConfig } from 'axios';

import { establishSession } from '@/features/auth/session/sessionManager';
import {
  getAccessToken,
  getRefreshToken,
} from '@/features/auth/session/tokenVault';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { type LoginResponse } from '@/features/auth/types';
import { queryClient } from '@/lib/queryClient';

const httpClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
};

export const axiosInstance = axios.create(httpClientConfig);

export const authAxiosInstance = axios.create(httpClientConfig);

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

const REFRESH_LEEWAY_MS = 30_000;
let refreshPromise: Promise<string> | null = null;

const isPublicAuthRequest = (url?: string): boolean =>
  Boolean(url?.startsWith('/auth/'));

const invalidateLocalSession = (): void => {
  queryClient.clear();
  useAuthStore.getState().clearSession();
};

const shouldInvalidateAfterRefreshFailure = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return true;

  const status = error.response?.status;
  return status === 400 || status === 401 || status === 403;
};

const performRefresh = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    invalidateLocalSession();
    throw new Error('No hay un refresh token disponible en memoria');
  }

  try {
    const response = await authAxiosInstance.post<LoginResponse>(
      '/auth/refresh',
      { refreshToken },
    );

    return establishSession(response.data);
  } catch (error) {
    if (shouldInvalidateAfterRefreshFailure(error)) {
      invalidateLocalSession();
    }
    throw error;
  }
};

const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const shouldRefreshBeforeRequest = (): boolean => {
  const session = useAuthStore.getState().session;
  return Boolean(
    session &&
      getRefreshToken() &&
      session.expiresAt - Date.now() <= REFRESH_LEEWAY_MS,
  );
};

axiosInstance.interceptors.request.use(
  async (config) => {
    if (isPublicAuthRequest(config.url)) return config;

    let accessToken = getAccessToken();
    if (shouldRefreshBeforeRequest()) {
      accessToken = await refreshAccessToken();
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as
      | RetryableRequestConfig
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      isPublicAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._authRetry) {
      invalidateLocalSession();
      return Promise.reject(error);
    }

    originalRequest._authRetry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance.request(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
