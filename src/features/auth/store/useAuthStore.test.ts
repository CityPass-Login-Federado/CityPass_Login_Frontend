import { afterEach, describe, expect, test } from 'vitest';

import { type AuthSession } from '../types';
import { selectCanAccessPanel, useAuthStore } from './useAuthStore';

const encode = (value: object) =>
  window
    .btoa(JSON.stringify(value))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const createToken = (payload: object) =>
  `${encode({ alg: 'none' })}.${encode(payload)}.`;

const moduleAdminSession: AuthSession = {
  userId: 'U000001',
  username: 'jperez',
  module: 'reclamos',
  groups: ['delegados'],
  roles: [],
  adminScope: 'MODULE',
  expiresAt: Date.now() + 60_000,
};

const canAccessPanel = (session: AuthSession | null) => {
  useAuthStore.setState({ session, isHydrated: true });
  return selectCanAccessPanel(useAuthStore.getState());
};

describe('selectCanAccessPanel', () => {
  afterEach(() => {
    useAuthStore.setState({ session: null, isHydrated: false });
    localStorage.clear();
  });

  test('permite a un administrador de módulo delegado con módulo definido', () => {
    expect(canAccessPanel(moduleAdminSession)).toBe(true);
  });

  test('rechaza a un delegado de módulo si el token no declara module', () => {
    expect(canAccessPanel({ ...moduleAdminSession, module: undefined })).toBe(false);
  });

  test('rechaza un claim module vacío o compuesto solo por espacios', () => {
    expect(canAccessPanel({ ...moduleAdminSession, module: '   ' })).toBe(false);
  });

  test('permite a un administrador general sin exigir un módulo', () => {
    expect(
      canAccessPanel({
        ...moduleAdminSession,
        module: undefined,
        groups: [],
        adminScope: 'GENERAL',
      }),
    ).toBe(true);
  });

  test('habilita el panel con el contrato real de admin-global', () => {
    const token = createToken({
      sub: 'U000007',
      exp: Math.floor(Date.now() / 1000) + 900,
      preferred_username: 'admin-global',
      module: 'analitica',
      groups: ['admin-global'],
      aud: ['citypass-admin-api'],
      token_use: 'human',
      ver: 1,
    });

    useAuthStore.getState().setSessionFromToken(token);

    expect(useAuthStore.getState().session).toMatchObject({
      username: 'admin-global',
      adminScope: 'GENERAL',
    });
    expect(selectCanAccessPanel(useAuthStore.getState())).toBe(true);
  });
});
