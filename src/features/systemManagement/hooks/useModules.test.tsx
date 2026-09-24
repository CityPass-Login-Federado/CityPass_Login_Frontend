import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { fetchModules } from '../api/panelApi';
import { panelQueryKeys } from '../utils/queryKeys';
import { useModules } from './useModules';

vi.mock('../api/panelApi', () => ({
  fetchModules: vi.fn(),
}));

const createWrapper = (queryClient: QueryClient) =>
  function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

describe('useModules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('consulta, normaliza y cachea el catálogo del backend', async () => {
    vi.mocked(fetchModules).mockResolvedValue([
      'reclamos',
      ' EDA ',
      'reclamos',
    ]);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useModules(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchModules).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual([
      { id: 'reclamos', name: 'Reclamos' },
      { id: 'eda', name: 'EDA' },
    ]);
    expect(queryClient.getQueryData(panelQueryKeys.modules())).toEqual([
      'reclamos',
      ' EDA ',
      'reclamos',
    ]);
  });

  test('no consulta el backend cuando está deshabilitado', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useModules({ enabled: false }),
      { wrapper: createWrapper(queryClient) },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchModules).not.toHaveBeenCalled();
  });
});
