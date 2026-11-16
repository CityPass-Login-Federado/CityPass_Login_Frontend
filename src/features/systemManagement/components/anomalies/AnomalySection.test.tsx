import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type PanelAnomalyEvent } from '../../types';
import { AnomalySection } from './AnomalySection';

interface MutationCallbacks {
  onSuccess: () => void;
  onError: (error: unknown) => void;
}

const mocks = vi.hoisted(() => ({
  useAnomalyEvents: vi.fn(),
  useApproveAnomalyEvent: vi.fn(),
  useModules: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock('../../hooks/useAnomalyEvents', () => ({
  useAnomalyEvents: mocks.useAnomalyEvents,
  useApproveAnomalyEvent: mocks.useApproveAnomalyEvent,
}));
vi.mock('../../hooks/useModules', () => ({
  useModules: mocks.useModules,
}));
vi.mock('../../hooks/useDebouncedValue', () => ({
  useDebouncedValue: <T,>(value: T) => value,
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

const anomalyData = {
  content: [event],
  totalElements: 21,
  totalPages: 2,
  currentPage: 0,
  size: 20,
};

describe('AnomalySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useModules.mockReturnValue({
      data: [
        { id: 'reclamos', name: 'Reclamos' },
        { id: 'eda', name: 'EDA' },
      ],
      isError: false,
      isPending: false,
    });
    mocks.useAnomalyEvents.mockReturnValue({
      data: anomalyData,
      isError: false,
      isPending: false,
      isPlaceholderData: false,
    });
    mocks.useApproveAnomalyEvent.mockReturnValue({
      mutate: mocks.mutate,
      isPending: false,
    });
  });

  test('consulta, filtra y pagina los eventos del administrador general', async () => {
    const user = userEvent.setup();
    render(<AnomalySection isGeneralAdmin onNotice={vi.fn()} />);

    expect(mocks.useAnomalyEvents).toHaveBeenLastCalledWith({
      page: 0,
      size: 20,
      status: 'BLOCKED',
      username: undefined,
      module: undefined,
    });
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por módulo' }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Usuario'), 'jperez');

    expect(mocks.useAnomalyEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ username: 'jperez', page: 0 }),
    );

    await user.click(screen.getByRole('button', { name: 'Página 2' }));

    expect(mocks.useAnomalyEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  test('confirma la aprobación y comunica el resultado exitoso', async () => {
    const user = userEvent.setup();
    const onNotice = vi.fn();
    mocks.mutate.mockImplementation(
      (_variables: { eventId: string }, callbacks: MutationCallbacks) =>
        callbacks.onSuccess(),
    );
    render(<AnomalySection isGeneralAdmin onNotice={onNotice} />);

    await user.click(
      screen.getByRole('button', { name: 'Aprobar evento de jperez' }),
    );
    expect(
      screen.getByRole('alertdialog', { name: '¿Aprobar este acceso?' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Aprobar acceso' }));

    expect(mocks.mutate).toHaveBeenCalledWith(
      { eventId: event.id },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(onNotice).toHaveBeenCalledWith(
      'success',
      expect.stringContaining('jperez'),
    );
  });

  test('mantiene la confirmación abierta y comunica el error de aprobación', async () => {
    const user = userEvent.setup();
    const onNotice = vi.fn();
    mocks.mutate.mockImplementation(
      (_variables: { eventId: string }, callbacks: MutationCallbacks) =>
        callbacks.onError(new Error('falló')),
    );
    render(<AnomalySection isGeneralAdmin onNotice={onNotice} />);

    await user.click(
      screen.getByRole('button', { name: 'Aprobar evento de jperez' }),
    );
    await user.click(screen.getByRole('button', { name: 'Aprobar acceso' }));

    expect(onNotice).toHaveBeenCalledWith(
      'error',
      'No se pudo aprobar el evento.',
    );
    expect(
      screen.getByRole('alertdialog', { name: '¿Aprobar este acceso?' }),
    ).toBeInTheDocument();
  });

  test('un delegado queda limitado al módulo de su token', () => {
    render(<AnomalySection isGeneralAdmin={false} onNotice={vi.fn()} />);

    expect(mocks.useModules).toHaveBeenCalledWith({ enabled: false });
    expect(
      screen.queryByRole('combobox', { name: 'Filtrar por módulo' }),
    ).not.toBeInTheDocument();
    expect(mocks.useAnomalyEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ module: undefined }),
    );
  });
});
