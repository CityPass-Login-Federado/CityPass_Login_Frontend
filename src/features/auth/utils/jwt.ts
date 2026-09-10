import { type AuthSession, type JwtClaims } from '../types';

const GENERAL_ADMIN_ROLES = new Set([
  'admin-general',
  'admin_general',
  'administrador-general',
  'administradores-generales',
  'role_admin_general',
]);

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = window.atob(normalized + padding);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const decodeJwtClaims = (token: string): JwtClaims | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const claims = JSON.parse(decodeBase64Url(payload)) as unknown;
    if (
      typeof claims !== 'object' ||
      claims === null ||
      !('sub' in claims) ||
      !('exp' in claims) ||
      typeof claims.sub !== 'string' ||
      typeof claims.exp !== 'number'
    ) {
      return null;
    }

    return claims as JwtClaims;
  } catch {
    return null;
  }
};

const normalizeRole = (role: string) => role.trim().toLowerCase();

export const isGeneralAdminClaims = (claims: JwtClaims): boolean => {
  const declaredScope = claims.admin_scope?.trim().toUpperCase();
  if (declaredScope === 'GENERAL') return true;

  const roles = [
    ...(claims.groups ?? []),
    ...(claims.roles ?? []),
    ...(claims.role ? [claims.role] : []),
  ].map(normalizeRole);

  return roles.some((role) => GENERAL_ADMIN_ROLES.has(role));
};

export const buildSessionFromToken = (token: string): AuthSession | null => {
  const claims = decodeJwtClaims(token);
  if (!claims || claims.exp * 1000 <= Date.now()) return null;

  return {
    userId: claims.sub,
    username: claims.preferred_username ?? claims.sub,
    module: claims.module?.toLowerCase(),
    groups: claims.groups ?? [],
    roles: claims.roles ?? (claims.role ? [claims.role] : []),
    adminScope: isGeneralAdminClaims(claims) ? 'GENERAL' : 'MODULE',
    expiresAt: claims.exp * 1000,
  };
};
