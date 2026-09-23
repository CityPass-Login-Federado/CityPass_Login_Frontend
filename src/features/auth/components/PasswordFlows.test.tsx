import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAuthStore } from '../store/useAuthStore';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { PasswordResetPage } from './PasswordResetPage';

const forgotMutate = vi.fn();
const resetMutate = vi.fn();
const changeMutate = vi.fn();

const mutationState = {
  forgot: {
    mutate: forgotMutate,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  },
  reset: {
    mutate: resetMutate,
    isPending: false,
    isError: false,
    error: null,
  },
  change: {
    mutate: changeMutate,
    isPending: false,
    isError: false,
    error: null,
  },
};

vi.mock('../hooks/usePasswordMutations', () => ({
  useForgotPassword: () => mutationState.forgot,
  useResetPassword: () => mutationState.reset,
  useChangePassword: () => mutationState.change,
}));

const renderRoute = (initialEntry: string, element: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>,
  );

describe('password flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationState.forgot.isSuccess = false;
    mutationState.forgot.isError = false;
    mutationState.forgot.error = null;
    mutationState.reset.isError = false;
    mutationState.reset.error = null;
    mutationState.change.isError = false;
    mutationState.change.error = null;
    useAuthStore.setState({ session: null, isHydrated: true });
  });

  test('solicita el recupero usando uid y muestra la navegación de regreso', async () => {
    const user = userEvent.setup();
    renderRoute('/forgot-password', <ForgotPasswordPage />);

    await user.type(screen.getByLabelText('Usuario'), ' jperez ');
    await user.click(screen.getByRole('button', { name: 'Enviar email' }));

    await waitFor(() => {
      expect(forgotMutate).toHaveBeenCalledWith({ uid: 'jperez' });
    });
    expect(
      screen.getByRole('link', { name: 'Volver al inicio de sesión' }),
    ).toHaveAttribute('href', '/login');
  });

  test('muestra un mensaje neutral después de solicitar el mail', () => {
    mutationState.forgot.isSuccess = true;
    renderRoute('/forgot-password', <ForgotPasswordPage />);

    expect(screen.getByText(/si el usuario existe/i)).toBeInTheDocument();
  });

  test('un enlace con token usa el modo público y no pide la clave actual', async () => {
    const user = userEvent.setup();
    renderRoute(
      '/reset-password?token=token-del-mail',
      <PasswordResetPage />,
    );

    expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Nueva contraseña'), 'abcdefgh');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'abcdefgh');
    await user.click(
      screen.getByRole('button', { name: 'Restablecer contraseña' }),
    );

    await waitFor(() => {
      expect(resetMutate).toHaveBeenCalledWith({
        token: 'token-del-mail',
        newPassword: 'abcdefgh',
      });
    });
  });

  test('una sesión sin token usa el modo autenticado', async () => {
    const user = userEvent.setup();
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
    renderRoute('/reset-password', <PasswordResetPage />);

    await user.type(screen.getByLabelText('Contraseña actual'), 'actual123');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'abcdefgh');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'abcdefgh');
    await user.click(
      screen.getByRole('button', { name: 'Restablecer contraseña' }),
    );

    await waitFor(() => {
      expect(changeMutate).toHaveBeenCalledWith({
        currentPassword: 'actual123',
        newPassword: 'abcdefgh',
      });
    });
  });

  test('sin token ni sesión informa que el enlace no es válido', () => {
    renderRoute('/reset-password', <PasswordResetPage />);

    expect(
      screen.getByRole('heading', { name: 'Enlace no válido' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Solicitar un nuevo enlace' }),
    ).toHaveAttribute('href', '/forgot-password');
  });

  test('rechaza una contraseña corta y confirmaciones diferentes', async () => {
    const user = userEvent.setup();
    renderRoute('/reset-password?token=abc', <PasswordResetPage />);

    await user.type(screen.getByLabelText('Nueva contraseña'), 'corta');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'otra');
    await user.click(
      screen.getByRole('button', { name: 'Restablecer contraseña' }),
    );

    expect(
      await screen.findByText(/al menos 8 caracteres/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(resetMutate).not.toHaveBeenCalled();
  });
});
