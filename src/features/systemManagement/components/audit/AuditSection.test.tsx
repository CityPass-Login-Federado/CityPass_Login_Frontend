import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { toLocalDayBoundaryIso } from '../../utils/audit';
import { AuditSection } from './AuditSection';

const mocks = vi.hoisted(() => ({
  useAuditEntries: vi.fn(),
  useModules: vi.fn(),
}));

vi.mock('../../hooks/useAudit', () => ({
  useAuditEntries: mocks.useAuditEntries,
}));
vi.mock('../../hooks/useModules', () => ({
  useModules: mocks.useModules,
}));
vi.mock('../../hooks/useDebouncedValue', () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

const auditData = {
  content: [
    {
      id: '9423464d-dc24-4bdf-b23a-c45c6bb64826',
      actorSub: 'U000042',
      actorUid: 'jperez',
      module: 'reclamos',
      action: 'PERSON_CREATED',
      target: 'uid=ana,ou=people,ou=reclamos',
      detail: null,
      occurredAt: '2026-11-14T12:30:00Z',
    },
  ],
  totalElements: 11,
  totalPages: 2,
  currentPage: 0,
  size: 10,
};

describe('AuditSection', () => {
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
    mocks.useAuditEntries.mockReturnValue({
      data: auditData,
      isError: false,
      isPending: false,
      isPlaceholderData: false,
    });
  });

  test('consulta y pagina el historial del administrador general', async () => {
    const user = userEvent.setup();
    render(<AuditSection isGeneralAdmin />);

    expect(mocks.useAuditEntries).toHaveBeenLastCalledWith(
      {
        page: 0,
        size: 10,
        actor: undefined,
        action: undefined,
        from: undefined,
        to: undefined,
        module: undefined,
      },
      { enabled: true },
    );
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por módulo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Usuario creado')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Página 2' }));

    expect(mocks.useAuditEntries).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
      { enabled: true },
    );
  });

  test('envía actor y extremos inclusivos del rango seleccionado', async () => {
    const user = userEvent.setup();
    render(<AuditSection isGeneralAdmin />);

    await user.type(screen.getByLabelText('Administrador'), 'jperez');
    fireEvent.change(screen.getByLabelText('Desde'), {
      target: { value: '2026-11-01' },
    });
    fireEvent.change(screen.getByLabelText('Hasta'), {
      target: { value: '2026-11-14' },
    });

    expect(mocks.useAuditEntries).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actor: 'jperez',
        from: toLocalDayBoundaryIso('2026-11-01', 'start'),
        to: toLocalDayBoundaryIso('2026-11-14', 'end'),
      }),
      { enabled: true },
    );
  });

  test('bloquea la consulta ante un rango de fechas inválido', () => {
    render(<AuditSection isGeneralAdmin />);

    fireEvent.change(screen.getByLabelText('Desde'), {
      target: { value: '2026-11-15' },
    });
    fireEvent.change(screen.getByLabelText('Hasta'), {
      target: { value: '2026-11-14' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'La fecha desde no puede ser posterior',
    );
    expect(mocks.useAuditEntries).toHaveBeenLastCalledWith(
      expect.any(Object),
      { enabled: false },
    );
  });

  test('un delegado no puede elegir módulo desde la interfaz', () => {
    render(<AuditSection isGeneralAdmin={false} />);

    expect(mocks.useModules).toHaveBeenCalledWith({ enabled: false });
    expect(
      screen.queryByRole('combobox', { name: 'Filtrar por módulo' }),
    ).not.toBeInTheDocument();
    expect(mocks.useAuditEntries).toHaveBeenLastCalledWith(
      expect.objectContaining({ module: undefined }),
      { enabled: true },
    );
  });
});
