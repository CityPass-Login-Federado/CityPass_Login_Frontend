import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { type ApiError } from '../types';
import { LoginForm } from './LoginForm';

const mockMutate = vi.fn();
const mockUseLogin = vi.fn();

vi.mock('../hooks/useLogin', () => ({
  useLogin: () => mockUseLogin(),
}));

const createApiError = (
  status: number,
  message: string,
): AxiosError<ApiError> =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    data: {
      timestamp: '2026-11-13T12:00:00Z',
      status,
      error: 'Request failed',
      message,
    },
    status,
    statusText: 'Request failed',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  });

const createLoginState = (error: AxiosError<ApiError> | null = null) => ({
  mutate: mockMutate,
  isPending: false,
  isError: error !== null,
  error,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderLoginForm = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogin.mockReturnValue(createLoginState());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('renderiza el formulario correctamente', () => {
    renderLoginForm();
    expect(screen.getByRole('heading', { name: /ingrese a su cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
    expect(screen.queryByText(/recordarme/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /olvidaste tu contraseña/i }),
    ).toHaveAttribute('href', '/forgot-password');
  });

  test('muestra errores de validación si se envía vacío', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    
    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    await user.click(submitButton);

    expect(await screen.findByText(/el usuario es obligatorio/i)).toBeInTheDocument();
    expect(await screen.findByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('llama a la mutación con los datos correctos si el formulario es válido', async () => {
    const user = userEvent.setup();
    vi.stubEnv('VITE_CLIENT_ID', 'test-client');

    renderLoginForm();

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /ingresar/i });

    await user.type(usernameInput, 'jperez');
    await user.type(passwordInput, 'Password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        username: 'jperez',
        password: 'Password123',
        clientId: 'test-client',
      });
    });
  });

  test('muestra el error de credenciales para una respuesta 401', () => {
    mockUseLogin.mockReturnValue(
      createLoginState(createApiError(401, 'Mensaje inesperado del backend')),
    );

    renderLoginForm();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Usuario o contraseña inválidos',
    );
  });

  test.each([
    [403, 'Acceso bloqueado por actividad inusual'],
    [503, 'Servicio de validación temporalmente no disponible'],
  ])(
    'diferencia el error de seguridad HTTP %i del error de credenciales',
    (status, expectedMessage) => {
      mockUseLogin.mockReturnValue(
        createLoginState(
          createApiError(status, 'Usuario o contraseña inválidos'),
        ),
      );

      renderLoginForm();

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(expectedMessage);
      expect(alert).not.toHaveTextContent('Usuario o contraseña inválidos');
    },
  );

  test('muestra el mensaje general cuando el servidor no responde', () => {
    mockUseLogin.mockReturnValue(
      createLoginState(new AxiosError<ApiError>('Network Error')),
    );

    renderLoginForm();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Error al iniciar sesión. Intente nuevamente.',
    );
  });
});
