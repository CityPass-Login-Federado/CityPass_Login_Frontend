import { create } from 'zustand';

import { type AuthSession } from '../types';
import { buildSessionFromToken } from '../utils/jwt';

interface AuthState {
  session: AuthSession | null;
  isHydrated: boolean;
  setSessionFromToken: (accessToken: string) => void;
  hydrateSession: () => void;
  clearSession: () => void;
}

const clearStoredTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isHydrated: false,
  setSessionFromToken: (accessToken) => {
    set({ session: buildSessionFromToken(accessToken), isHydrated: true });
  },
  hydrateSession: () => {
    const accessToken = localStorage.getItem('access_token');
    const session = accessToken ? buildSessionFromToken(accessToken) : null;
    if (accessToken && !session) clearStoredTokens();
    set({ session, isHydrated: true });
  },
  clearSession: () => {
    clearStoredTokens();
    set({ session: null, isHydrated: true });
  },
}));

export const selectIsGeneralAdmin = (state: AuthState) =>
  state.session?.adminScope === 'GENERAL';

export const selectCanAccessPanel = (state: AuthState) => {
  if (!state.session) return false;
  if (state.session.adminScope === 'GENERAL') return true;

  return state.session.groups.some(
    (group) => group.trim().toLowerCase() === 'delegados',
  );
};
