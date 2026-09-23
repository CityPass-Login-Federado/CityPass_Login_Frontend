import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { createElement, useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { authAxiosInstance, axiosInstance } from '@/lib/axios';
import * as loginApi from './api/login';
import * as logoutApi from './api/logout';
import * as passwordApi from './api/password';
import { useLogin } from './hooks/useLogin';
import { establishSession } from './session/sessionManager';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from './session/tokenVault';
import { useAuthStore } from './store/useAuthStore';
import { buildSessionFromToken, decodeJwtClaims, isGeneralAdminClaims } from './utils/jwt';

const encode = (value: object) =>
  window.btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const createToken = (payload: object) =>
  `${encode({ alg: 'none' })}.${encode({
    aud: ['citypass-admin-api'],
    token_use: 'human',
    ver: 1,
    ...payload,
  })}.`;

describe('auth runtime branches', () => {
  afterEach(() => {
    localStorage.clear();
    clearAuthTokens();
    vi.restoreAllMocks();
    useAuthStore.setState({ session: null, isHydrated: false });
  });

  test('decodeJwtClaims devuelve null para payloads inválidos o sin sub/exp', () => {
    expect(decodeJwtClaims('invalid')).toBeNull();
    expect(decodeJwtClaims(createToken({ sub: 'abc' }))).toBeNull();
  });

  test('buildSessionFromToken maneja claims generales y roles con prefijos', () => {
    const token = createToken({
      sub: 'U000123',
      exp: Math.floor(Date.now() / 1000) + 900,
      preferred_username: 'admin',
      groups: ['role_admin_general'],
      roles: ['Admin-General'],
      admin_scope: 'GENERAL',
    });

    expect(buildSessionFromToken(token)).toMatchObject({
      userId: 'U000123',
      username: 'admin',
      adminScope: 'GENERAL',
      groups: ['role_admin_general'],
    });
  });

  test('buildSessionFromToken devuelve null para tokens expirados y malformed', () => {
    const expired = createToken({ sub: 'U1', exp: Math.floor(Date.now() / 1000) - 5 });
    expect(buildSessionFromToken(expired)).toBeNull();
    expect(buildSessionFromToken('abc.def')).toBeNull();
  });

  test('la sesión y los tokens viven únicamente en memoria', () => {
    const token = createToken({
      sub: 'U555',
      exp: Math.floor(Date.now() / 1000) + 900,
      preferred_username: 'user1',
      groups: ['delegados'],
    });

    establishSession({
      access_token: token,
      refresh_token: 'refresh-memory',
      token_type: 'Bearer',
      expires_in: 900,
    });

    expect(useAuthStore.getState().session?.userId).toBe('U555');
    expect(getAccessToken()).toBe(token);
    expect(getRefreshToken()).toBe('refresh-memory');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();

    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState().session).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  test('initializeSession elimina tokens heredados y no restaura la sesión', () => {
    localStorage.setItem('access_token', 'bad-token');
    localStorage.setItem('refresh_token', 'bad-refresh');
    setAuthTokens('memory-access', 'memory-refresh');

    useAuthStore.getState().initializeSession();

    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().isHydrated).toBe(true);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  test('axios agrega Authorization solo para llamadas autenticadas', async () => {
    const token = 'abc123';
    setAuthTokens(token, 'refresh-123');

    const requestHandlers = axiosInstance.interceptors.request.handlers ?? [];
    const requestInterceptor = requestHandlers[0];
    expect(requestInterceptor).toBeDefined();

    const config = await requestInterceptor!.fulfilled({
      url: '/panel/people',
      headers: {},
    } as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBe('Bearer abc123');

    const loginConfig = await requestInterceptor!.fulfilled({
      url: '/auth/login',
      headers: {},
    } as InternalAxiosRequestConfig);

    expect(loginConfig.headers.Authorization).toBeUndefined();

    for (const url of [
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/refresh',
      '/auth/logout',
    ]) {
      const publicConfig = await requestInterceptor!.fulfilled({
        url,
        headers: {},
      } as InternalAxiosRequestConfig);
      expect(publicConfig.headers.Authorization).toBeUndefined();
    }
  });

  test('axios rechaza errores de request', async () => {
    const error = new Error('network');
    const responseHandlers = axiosInstance.interceptors.response.handlers ?? [];
    const responseInterceptor = responseHandlers[0];
    expect(responseInterceptor).toBeDefined();
    expect(responseInterceptor?.rejected).toBeTypeOf('function');

    const rejected = responseInterceptor?.rejected;
    if (!rejected) {
      throw new Error('Response interceptor rejected handler is missing');
    }

    await expect(rejected(error)).rejects.toBe(error);
  });

  test('axios comparte un único refresh preventivo entre requests concurrentes', async () => {
    const currentToken = createToken({
      sub: 'U1',
      exp: Math.floor(Date.now() / 1000) + 1,
      groups: ['delegados'],
      module: 'reclamos',
    });
    const rotatedToken = createToken({
      sub: 'U1',
      exp: Math.floor(Date.now() / 1000) + 900,
      groups: ['delegados'],
      module: 'reclamos',
    });

    establishSession({
      access_token: currentToken,
      refresh_token: 'refresh-current',
      token_type: 'Bearer',
      expires_in: 1,
    });
    const refreshSpy = vi.spyOn(authAxiosInstance, 'post').mockResolvedValue({
      data: {
        access_token: rotatedToken,
        refresh_token: 'refresh-rotated',
        token_type: 'Bearer',
        expires_in: 900,
      },
    } as Awaited<ReturnType<typeof authAxiosInstance.post>>);

    const requestInterceptor = axiosInstance.interceptors.request.handlers?.[0];
    expect(requestInterceptor).toBeDefined();

    const [first, second] = await Promise.all([
      requestInterceptor!.fulfilled({
        url: '/panel/people',
        headers: {},
      } as InternalAxiosRequestConfig),
      requestInterceptor!.fulfilled({
        url: '/panel/groups',
        headers: {},
      } as InternalAxiosRequestConfig),
    ]);

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'refresh-current',
    });
    expect(first.headers.Authorization).toBe(`Bearer ${rotatedToken}`);
    expect(second.headers.Authorization).toBe(`Bearer ${rotatedToken}`);
    expect(getRefreshToken()).toBe('refresh-rotated');
  });

  test('un 401 renueva la sesión y reintenta la petición una sola vez', async () => {
    const oldToken = createToken({
      sub: 'U1',
      exp: Math.floor(Date.now() / 1000) + 900,
    });
    const newToken = createToken({
      sub: 'U1',
      exp: Math.floor(Date.now() / 1000) + 900,
    });
    establishSession({
      access_token: oldToken,
      refresh_token: 'refresh-old',
      token_type: 'Bearer',
      expires_in: 900,
    });

    vi.spyOn(authAxiosInstance, 'post').mockResolvedValue({
      data: {
        access_token: newToken,
        refresh_token: 'refresh-new',
        token_type: 'Bearer',
        expires_in: 900,
      },
    } as Awaited<ReturnType<typeof authAxiosInstance.post>>);
    const retrySpy = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { ok: true },
    } as Awaited<ReturnType<typeof axiosInstance.request>>);

    const config = {
      url: '/panel/people',
      headers: { Authorization: `Bearer ${oldToken}` },
    } as InternalAxiosRequestConfig;
    const unauthorized = new AxiosError(
      'Unauthorized',
      'ERR_BAD_RESPONSE',
      config,
      undefined,
      {
        data: undefined,
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      },
    );
    const responseInterceptor = axiosInstance.interceptors.response.handlers?.[0];

    await expect(responseInterceptor!.rejected!(unauthorized)).resolves.toMatchObject({
      data: { ok: true },
    });
    expect(retrySpy).toHaveBeenCalledTimes(1);
    expect(retrySpy.mock.calls[0]?.[0]).toMatchObject({
      headers: { Authorization: `Bearer ${newToken}` },
    });
  });

  test('loginUser envía la petición de login y devuelve el payload', async () => {
    const postSpy = vi.spyOn(axiosInstance, 'post').mockResolvedValue({
      data: {
        access_token: 'token-1',
        refresh_token: 'refresh-1',
        token_type: 'Bearer',
        expires_in: 3600,
      },
    } as Awaited<ReturnType<typeof axiosInstance.post>>);

    await expect(
      loginApi.loginUser({ username: 'jperez', password: 'secret', clientId: 'client-1' }),
    ).resolves.toMatchObject({ access_token: 'token-1' });
    expect(postSpy).toHaveBeenCalledWith('/auth/login', {
      username: 'jperez',
      password: 'secret',
      clientId: 'client-1',
    });
  });

  test('logoutUser envía el refresh token para revocar la sesión', async () => {
    const postSpy = vi.spyOn(axiosInstance, 'post').mockResolvedValue({
      data: undefined,
    } as Awaited<ReturnType<typeof axiosInstance.post>>);

    await expect(
      logoutApi.logoutUser({ refreshToken: 'refresh-1' }),
    ).resolves.toBeUndefined();
    expect(postSpy).toHaveBeenCalledWith('/auth/logout', {
      refreshToken: 'refresh-1',
    });
  });

  test('las APIs de contraseña respetan el contrato del backend', async () => {
    const postSpy = vi.spyOn(axiosInstance, 'post').mockResolvedValue({
      data: undefined,
    } as Awaited<ReturnType<typeof axiosInstance.post>>);

    await passwordApi.requestPasswordReset({ uid: 'jperez' });
    await passwordApi.resetPassword({
      token: 'reset-token',
      newPassword: 'nueva123',
    });
    await passwordApi.changePassword({
      currentPassword: 'actual123',
      newPassword: 'nueva123',
    });

    expect(postSpy).toHaveBeenNthCalledWith(1, '/auth/forgot-password', {
      uid: 'jperez',
    });
    expect(postSpy).toHaveBeenNthCalledWith(2, '/auth/reset-password', {
      token: 'reset-token',
      newPassword: 'nueva123',
    });
    expect(postSpy).toHaveBeenNthCalledWith(3, '/me/change-password', {
      currentPassword: 'actual123',
      newPassword: 'nueva123',
    });
  });

  test('useLogin guarda la sesión y redirige al panel tras éxito', async () => {
    const token = createToken({
      sub: 'U777',
      exp: Math.floor(Date.now() / 1000) + 900,
      preferred_username: 'juan',
      groups: ['delegados'],
      module: 'reclamos',
    });

    vi.spyOn(loginApi, 'loginUser').mockResolvedValue({
      access_token: token,
      refresh_token: 'refresh-abc',
      token_type: 'Bearer',
      expires_in: 3600,
    });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const TestComponent = () => {
      const mutation = useLogin();

      useEffect(() => {
        mutation.mutate({ username: 'juan', password: 'secret', clientId: 'client-1' });
      }, [mutation]);

      return null;
    };

    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          MemoryRouter,
          null,
          createElement(TestComponent),
        ),
      ),
    );

    await waitFor(() => {
      expect(getAccessToken()).toBe(token);
      expect(getRefreshToken()).toBe('refresh-abc');
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(useAuthStore.getState().session?.userId).toBe('U777');
    });
  });

  test('isGeneralAdminClaims acepta admin_scope, grupos y roles sin normalizar', () => {
    expect(isGeneralAdminClaims({ sub: 'U1', exp: 999, groups: ['delegados'] })).toBe(false);
    expect(isGeneralAdminClaims({ sub: 'U1', exp: 999, groups: ['admin-global'] })).toBe(true);
    expect(isGeneralAdminClaims({ sub: 'U1', exp: 999, roles: ['administrador-general'] })).toBe(true);
    expect(isGeneralAdminClaims({ sub: 'U1', exp: 999, role: 'admin_general' })).toBe(true);
  });
});
