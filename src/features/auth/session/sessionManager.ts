import { type LoginResponse } from '../types';
import { buildSessionFromToken } from '../utils/jwt';
import { useAuthStore } from '../store/useAuthStore';
import { setAuthTokens } from './tokenVault';

export const establishSession = (response: LoginResponse): string => {
  const session = buildSessionFromToken(response.access_token);

  if (!session) {
    throw new Error('El servidor devolvió un access token inválido o expirado');
  }

  setAuthTokens(response.access_token, response.refresh_token);
  useAuthStore.getState().setSession(session);

  return response.access_token;
};
