import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { LoginForm } from './LoginForm';

const mockMutate = vi.fn();
vi.mock('../hooks/useLogin', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderLoginForm = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>
  );
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza el formulario correctamente', () => {
    renderLoginForm();
    expect(screen.getByRole('heading', { name: /ingrese a su cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
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
    import.meta.env.VITE_CLIENT_ID = 'test-client';

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
});
