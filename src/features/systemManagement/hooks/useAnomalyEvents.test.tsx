import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  approveAnomalyEvent,
  fetchAnomalyEvents,
} from '../api/panelApi';
import { type PanelAnomalyEvent } from '../types';
import { panelQueryKeys } from '../utils/queryKeys';
import {
  useAnomalyEvents,
  useApproveAnomalyEvent,
} from './useAnomalyEvents';

vi.mock('../api/panelApi', () => ({
  approveAnomalyEvent: vi.fn(),
  fetchAnomalyEvents: vi.fn(),
}));

const event: PanelAnomalyEvent = {
  id: '9423464d-dc24-4bdf-b23a-c45c6bb64826',
  userSub: 'U000042',
  username: 'jperez',
  module: 'reclamos',
  clientId: 'citypass-admin-web',
  ipAddress: '203.0.113.10',
  userAgent: 'Mozilla/5.0',
  riskScore: 0.93,
  reasons: ['IP nueva'],
  status: 'BLOCKED',
  blockedAt: '2026-11-15T12:30:00Z',
  approvedAt: null,
  approvalExpiresAt: null,
  approvedBySub: null,
  approvedByUid: null,
  consumedAt: null,
};

const params = {
  page: 0,
  size: 20,
  status: 'BLOCKED' as const,
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

const createWrapper = (queryClient: QueryClient) =>
  function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

describe('useAnomalyEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('consulta y cachea la página de eventos', async () => {
    const response = {
      content: [event],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 20,
    };
    vi.mocked(fetchAnomalyEvents).mockResolvedValue(response);
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useAnomalyEvents(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAnomalyEvents).toHaveBeenCalledWith(params);
    expect(
      queryClient.getQueryData(panelQueryKeys.anomalyEventsList(params)),
    ).toEqual(response);
    queryClient.clear();
  });

  test('no consulta el backend cuando el hook está deshabilitado', () => {
    const queryClient = createQueryClient();

    const { result } = renderHook(
      () => useAnomalyEvents(params, { enabled: false }),
      { wrapper: createWrapper(queryClient) },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchAnomalyEvents).not.toHaveBeenCalled();
    queryClient.clear();
  });

  test('aprobar invalida los eventos, las personas y la auditoría', async () => {
    const approvedEvent = {
      ...event,
      status: 'APPROVED' as const,
      approvedAt: '2026-11-15T12:35:00Z',
      approvalExpiresAt: '2026-11-15T12:50:00Z',
    };
    vi.mocked(approveAnomalyEvent).mockResolvedValue(approvedEvent);
    const queryClient = createQueryClient();
    const anomalyKey = panelQueryKeys.anomalyEventsList(params);
    const auditKey = panelQueryKeys.auditList({ page: 0, size: 20 });
    const peopleKey = panelQueryKeys.peopleList({ page: 0, size: 20 });
    queryClient.setQueryData(anomalyKey, { content: [event] });
    queryClient.setQueryData(auditKey, { content: [] });
    queryClient.setQueryData(peopleKey, { content: [] });
    const { result } = renderHook(() => useApproveAnomalyEvent(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ eventId: event.id });
    });

    expect(approveAnomalyEvent).toHaveBeenCalledWith({ eventId: event.id });
    expect(queryClient.getQueryState(anomalyKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(peopleKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(auditKey)?.isInvalidated).toBe(true);
    queryClient.clear();
  });
});
