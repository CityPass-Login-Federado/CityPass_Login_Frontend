import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import type { InternalAxiosRequestConfig } from 'axios';
import { createElement, useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/lib/axios';
import * as loginApi from './api/login';
import { useLogin } from './hooks/useLogin';
import { useAuthStore } from './store/useAuthStore';
import { buildSessionFromToken, decodeJwtClaims, isGeneralAdminClaims } from './utils/jwt';

const encode = (value: object) =>
  window.btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const createToken = (payload: object) => `${encode({ alg: 'none' })}.${encode(payload)}.`;

describe('auth runtime branches', () => {
  afterEach(() => {
    localStorage.clear();
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

  test('useAuthStore persiste e hidrata la sesión correctamente', () => {
    const token = createToken({
      sub: 'U555',
      exp: Math.floor(Date.now() / 1000) + 900,
      preferred_username: 'user1',
      groups: ['delegados'],
    });

    useAuthStore.getState().setSessionFromToken(token);
    expect(useAuthStore.getState().session?.userId).toBe('U555');

    localStorage.setItem('access_token', token);
    useAuthStore.getState().hydrateSession();
    expect(useAuthStore.getState().session?.username).toBe('user1');

    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState().session).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  test('hydrateSession limpia tokens inválidos en localStorage', () => {
    localStorage.setItem('access_token', 'bad-token');
    localStorage.setItem('refresh_token', 'bad-refresh');

    useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState().session).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  test('axios agrega Authorization para llamadas autenticadas y mantiene login sin header', async () => {
    const token = 'abc123';
    localStorage.setItem('access_token', token);

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
      expect(localStorage.getItem('access_token')).toBe(token);
      expect(useAuthStore.getState().session?.userId).toBe('U777');
    });
  });

  test('isGeneralAdminClaims acepta admin_scope, grupos y roles sin normalizar', () => {
    expect(isGeneralAdminClaims({ sub: 'U1', exp: 999, groups: ['delegados'] })).toBe(false);
    expect(isGeneralAdminClaims({ sub: 'U1', exp: 999, roles: ['administrador-general'] })).toBe(true);
    expect(isGeneralAdminClaims({ sub: 'U1', exp: 999, role: 'admin_general' })).toBe(true);
  });
});
