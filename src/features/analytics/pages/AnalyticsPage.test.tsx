import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { fetchAnalyticsHtml } from '../api/analyticsApi';
import { AnalyticsPage } from './AnalyticsPage';

vi.mock('../api/analyticsApi', () => ({
  fetchAnalyticsHtml: vi.fn(),
}));

vi.mock(
  '@/features/systemManagement/components/layout/ManagementPageLayout',
  () => ({
    ManagementPageLayout: ({
      title,
      children,
    }: {
      title: string;
      children: ReactNode;
    }) => (
      <main>
        <h1>{title}</h1>
        {children}
      </main>
    ),
  }),
);

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AnalyticsPage />
    </QueryClientProvider>,
  );
};

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('muestra el HTML en un iframe aislado', async () => {
    const html = '<!doctype html><html><body><h1>Identidad</h1></body></html>';
    vi.mocked(fetchAnalyticsHtml).mockResolvedValue(html);

    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando tablero de Analítica',
    );
    const iframe = await screen.findByTitle(
      'Tablero de Analítica de Identidad',
    );
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    expect(iframe).not.toHaveAttribute('sandbox', expect.stringContaining('allow-same-origin'));
    expect(iframe).toHaveAttribute('srcdoc', html);
    expect(fetchAnalyticsHtml).toHaveBeenCalledTimes(1);
  });

  test('explica una indisponibilidad temporal y permite reintentar', async () => {
    const unavailableError = Object.assign(new Error('Unavailable'), {
      isAxiosError: true,
      response: { status: 503 },
    });
    vi.mocked(fetchAnalyticsHtml)
      .mockRejectedValueOnce(unavailableError)
      .mockResolvedValueOnce('<html><body>Recuperado</body></html>');

    renderPage();

    expect(
      await screen.findByText(
        'El servicio de Analítica no está disponible temporalmente.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(
      await screen.findByTitle('Tablero de Analítica de Identidad'),
    ).toHaveAttribute('srcdoc', '<html><body>Recuperado</body></html>');
    expect(fetchAnalyticsHtml).toHaveBeenCalledTimes(2);
  });

  test('explica el rechazo del token sin indicar que la sesión venció', async () => {
    const unauthorizedError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    });
    vi.mocked(fetchAnalyticsHtml).mockRejectedValue(unauthorizedError);

    renderPage();

    expect(
      await screen.findByText(/Analítica no pudo validar el token/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tu sesión sigue activa/)).toBeInTheDocument();
  });

  test('explica cuando el backend rechaza una respuesta que no es HTML válido', async () => {
    const invalidResponseError = Object.assign(new Error('Bad Gateway'), {
      isAxiosError: true,
      response: { status: 502 },
    });
    vi.mocked(fetchAnalyticsHtml).mockRejectedValue(invalidResponseError);

    renderPage();

    expect(
      await screen.findByText(/Analítica devolvió contenido inválido/),
    ).toBeInTheDocument();
  });

  test('explica cuando la carga supera el timeout del frontend', async () => {
    const timeoutError = Object.assign(new Error('Timeout'), {
      isAxiosError: true,
      code: 'ECONNABORTED',
    });
    vi.mocked(fetchAnalyticsHtml).mockRejectedValue(timeoutError);

    renderPage();

    expect(
      await screen.findByText(/El tablero tardó demasiado en responder/),
    ).toBeInTheDocument();
  });
});
