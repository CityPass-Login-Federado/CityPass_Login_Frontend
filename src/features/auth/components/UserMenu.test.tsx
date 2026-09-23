import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { logoutUser } from '../api/logout';
import { useAuthStore } from '../store/useAuthStore';
import { UserMenu } from './UserMenu';

vi.mock('../api/logout', () => ({
  logoutUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
  },
}));

const setAuthenticatedSession = () => {
  useAuthStore.setState({
    session: {
      userId: 'U001',
      username: 'admin',
      groups: [],
      roles: [],
      adminScope: 'GENERAL',
      expiresAt: Date.now() + 60_000,
    },
    isHydrated: true,
  });
  localStorage.setItem('access_token', 'access-1');
  localStorage.setItem('refresh_token', 'refresh-1');
};

const renderUserMenu = (queryClient: QueryClient) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/panel']}>
        <Routes>
          <Route path="/panel" element={<UserMenu />} />
          <Route path="/reset-password" element={<p>Cambio de contraseña</p>} />
          <Route path="/login" element={<p>Pantalla de acceso</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthenticatedSession();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    useAuthStore.setState({ session: null, isHydrated: false });
  });

  test('muestra las opciones de contraseña y cierre de sesión', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderUserMenu(queryClient);

    await user.click(
      screen.getByRole('button', { name: 'Abrir menú de usuario' }),
    );

    expect(screen.getByRole('menu', { name: 'Opciones de usuario' })).toBeVisible();
    expect(
      screen.getByRole('menuitem', { name: 'Restablecer contraseña' }),
    ).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'Cerrar sesión' })).toBeVisible();
    expect(screen.getAllByText('Admin General')).toHaveLength(2);
  });

  test('navega al cambio de contraseña desde el menú', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderUserMenu(queryClient);

    await user.click(
      screen.getByRole('button', { name: 'Abrir menú de usuario' }),
    );
    await user.click(
      screen.getByRole('menuitem', { name: 'Restablecer contraseña' }),
    );

    expect(await screen.findByText('Cambio de contraseña')).toBeInTheDocument();
  });

  test('revoca el token, limpia la sesión y redirige al login', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['private-data'], { id: 1 });
    vi.mocked(logoutUser).mockResolvedValue();
    renderUserMenu(queryClient);

    await user.click(
      screen.getByRole('button', { name: 'Abrir menú de usuario' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    await screen.findByText('Pantalla de acceso');
    expect(logoutUser).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(useAuthStore.getState().session).toBeNull();
    expect(queryClient.getQueryData(['private-data'])).toBeUndefined();
  });

  test('cierra la sesión local aunque falle la revocación remota', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(logoutUser).mockRejectedValue(new Error('network'));
    renderUserMenu(queryClient);

    await user.click(
      screen.getByRole('button', { name: 'Abrir menú de usuario' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    await screen.findByText('Pantalla de acceso');
    await waitFor(() => expect(toast.warning).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(useAuthStore.getState().session).toBeNull();
  });
});
