import { afterEach, describe, expect, test } from 'vitest';

import { type AuthSession } from '../types';
import { selectCanAccessPanel, useAuthStore } from './useAuthStore';

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
});
