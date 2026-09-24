import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ErrorInfo } from 'react';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { useAuthStore } from '../store/useAuthStore';
import { AuthenticatedRoute } from './AuthenticatedRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { UserHomePage } from '../pages/UserHomePage';

vi.mock('../forms/LoginForm', () => ({
  LoginForm: () => <div>LoginForm mock</div>,
}));

describe('auth routing and boundaries', () => {
  test('muestra pantalla de carga mientras se hidrata la sesión', () => {
    useAuthStore.setState({ session: null, isHydrated: false });

    render(
      <MemoryRouter initialEntries={['/panel']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/panel" element={<div>Panel</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Cargando sesión…')).toBeInTheDocument();
  });

  test('redirige al login si no hay sesión', () => {
    useAuthStore.setState({ session: null, isHydrated: true });

    render(
      <MemoryRouter initialEntries={['/panel']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/panel" element={<div>Panel</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  test('protege el inicio de usuario cuando no hay sesión', () => {
    useAuthStore.setState({ session: null, isHydrated: true });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route element={<AuthenticatedRoute />}>
            <Route path="/home" element={<div>User home</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  test('muestra un inicio exitoso al usuario común autenticado', () => {
    useAuthStore.setState({
      session: {
        userId: 'u1',
        username: 'juan',
        module: 'reclamos',
        groups: [],
        roles: [],
        adminScope: 'MODULE',
        expiresAt: Date.now() + 60_000,
      },
      isHydrated: true,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route element={<AuthenticatedRoute />}>
              <Route path="/home" element={<UserHomePage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Inicio de sesión exitoso' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Hola, juan/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cerrar sesión' }),
    ).toBeInTheDocument();
  });

  test('redirige a la página no autorizada cuando falta permiso', () => {
    useAuthStore.setState({
      session: {
        userId: 'u1',
        username: 'user',
        module: 'reclamos',
        groups: [],
        roles: [],
        adminScope: 'MODULE',
        expiresAt: Date.now() + 60_000,
      },
      isHydrated: true,
    });

    render(
      <MemoryRouter initialEntries={['/panel']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/panel" element={<div>Panel</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Unauthorized page')).toBeInTheDocument();
  });

  test('permite la navegación cuando la sesión es válida', () => {
    useAuthStore.setState({
      session: {
        userId: 'u1',
        username: 'user',
        module: 'reclamos',
        groups: ['delegados'],
        roles: [],
        adminScope: 'MODULE',
        expiresAt: Date.now() + 60_000,
      },
      isHydrated: true,
    });

    render(
      <MemoryRouter initialEntries={['/panel']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/panel" element={<div>Panel</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Panel')).toBeInTheDocument();
  });

  test('renderiza la página de login y la de acceso no autorizado', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('LoginForm mock')).toBeInTheDocument();
  });

  test('muestra el fallback cuando un hijo lanza un error', () => {
    const BrokenComponent = () => {
      throw new Error('boom');
    };

    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/No pudimos mostrar el panel/i)).toBeInTheDocument();
  });

  test('redirige a login con un catch-all', () => {
    render(
      <MemoryRouter initialEntries={['/random']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  test('componentDidCatch no lanza ni muta si se invoca manualmente', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const boundary = new AppErrorBoundary({ children: <div>child</div> });

    expect(() =>
      boundary.componentDidCatch(new Error('boom'), { componentStack: 'stack' } as ErrorInfo),
    ).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
