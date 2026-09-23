import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as passwordApi from '../api/password';
import { useAuthStore } from '../store/useAuthStore';
import {
  useChangePassword,
  useResetPassword,
} from './usePasswordMutations';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

const MutationTrigger = ({ mode }: { mode: 'recovery' | 'change' }) => {
  const resetMutation = useResetPassword();
  const changeMutation = useChangePassword();

  return (
    <button
      type="button"
      onClick={() => {
        if (mode === 'recovery') {
          resetMutation.mutate({
            token: 'token-del-mail',
            newPassword: 'abcdefgh',
          });
        } else {
          changeMutation.mutate({
            currentPassword: 'actual123',
            newPassword: 'abcdefgh',
          });
        }
      }}
    >
      Ejecutar cambio
    </button>
  );
};

const renderMutation = (mode: 'recovery' | 'change') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(['private-data'], { id: 1 });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/reset-password']}>
        <Routes>
          <Route
            path="/reset-password"
            element={<MutationTrigger mode={mode} />}
          />
          <Route path="/login" element={<p>Pantalla de acceso</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return queryClient;
};

describe('password mutation success', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'access-token');
    localStorage.setItem('refresh_token', 'refresh-token');
    useAuthStore.setState({
      session: {
        userId: 'U1',
        username: 'admin',
        groups: [],
        roles: [],
        adminScope: 'GENERAL',
        expiresAt: Date.now() + 60_000,
      },
      isHydrated: true,
    });
  });

  afterEach(() => {
    localStorage.clear();
    useAuthStore.setState({ session: null, isHydrated: false });
    vi.restoreAllMocks();
  });

  test.each([
    ['recovery', 'resetPassword'],
    ['change', 'changePassword'],
  ] as const)(
    'el modo %s limpia la sesión y vuelve al login',
    async (mode, apiMethod) => {
      vi.spyOn(passwordApi, apiMethod).mockResolvedValue();
      const queryClient = renderMutation(mode);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Ejecutar cambio' }));

      expect(await screen.findByText('Pantalla de acceso')).toBeInTheDocument();
      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
        expect(useAuthStore.getState().session).toBeNull();
        expect(queryClient.getQueryData(['private-data'])).toBeUndefined();
        expect(toast.success).toHaveBeenCalledWith(
          'Contraseña actualizada. Iniciá sesión nuevamente.',
        );
      });
    },
  );
});
