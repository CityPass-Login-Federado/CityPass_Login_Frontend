import { create } from 'zustand';

import { type AuthSession } from '../types';
import { clearAuthTokens } from '../session/tokenVault';

interface AuthState {
  session: AuthSession | null;
  isHydrated: boolean;
  setSession: (session: AuthSession) => void;
  initializeSession: () => void;
  clearSession: () => void;
}

const clearLegacyStoredTokens = () => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('refresh_token');
  } catch {
    return;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isHydrated: false,
  setSession: (session) => {
    set({ session, isHydrated: true });
  },
  initializeSession: () => {
    clearAuthTokens();
    clearLegacyStoredTokens();
    set({ session: null, isHydrated: true });
  },
  clearSession: () => {
    clearAuthTokens();
    clearLegacyStoredTokens();
    set({ session: null, isHydrated: true });
  },
}));

export const selectIsGeneralAdmin = (state: AuthState) =>
  state.session?.adminScope === 'GENERAL';

export const selectCanAccessPanel = (state: AuthState) => {
  if (!state.session) return false;
  if (state.session.adminScope === 'GENERAL') return true;
  if (!state.session.module?.trim()) return false;

  return state.session.groups.some(
    (group) => group.trim().toLowerCase() === 'delegados',
  );
};
