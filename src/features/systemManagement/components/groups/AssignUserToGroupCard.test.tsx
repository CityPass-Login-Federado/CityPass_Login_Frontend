import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AssignUserToGroupCard } from './AssignUserToGroupCard';

const mocks = vi.hoisted(() => ({
  usePeople: vi.fn(),
  useGroups: vi.fn(),
  useModules: vi.fn(),
  useAssignUsersToGroups: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock('../../hooks/usePeople', () => ({ usePeople: mocks.usePeople }));
vi.mock('../../hooks/useGroups', () => ({
  useGroups: mocks.useGroups,
  useAssignUsersToGroups: mocks.useAssignUsersToGroups,
}));
vi.mock('../../hooks/useModules', () => ({ useModules: mocks.useModules }));

const peopleData = {
  content: [
    {
      employeeNumber: 'U1',
      uid: 'ana',
      givenName: 'Ana',
      sn: 'López',
      email: 'ana@citypass.local',
      disabled: false,
    },
    {
      employeeNumber: 'U2',
      uid: 'luis',
      givenName: 'Luis',
      sn: 'Pérez',
      email: 'luis@citypass.local',
      disabled: false,
    },
  ],
  totalElements: 2,
  totalPages: 1,
  currentPage: 0,
  size: 1000,
};

const groupsData = {
  content: [
    { name: 'soporte', members: [], reserved: false },
    { name: 'auditoria', members: ['ana'], reserved: false },
  ],
  totalElements: 2,
  totalPages: 1,
  currentPage: 0,
  size: 1000,
};

const readyQuery = (data: unknown) => ({
  data,
  isError: false,
  isPending: false,
  isPlaceholderData: false,
});

describe('AssignUserToGroupCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePeople.mockReturnValue(readyQuery(peopleData));
    mocks.useGroups.mockReturnValue(readyQuery(groupsData));
    mocks.useModules.mockReturnValue({
      data: [
        { id: 'reclamos', name: 'Reclamos' },
        { id: 'eda', name: 'EDA' },
      ],
      isError: false,
      isPending: false,
    });
    mocks.useAssignUsersToGroups.mockReturnValue({
      isPending: false,
      mutate: mocks.mutate,
    });
  });

  test('consulta las opciones del alcance del token', () => {
    render(
      <AssignUserToGroupCard isGeneralAdmin={false} onNotice={vi.fn()} />,
    );

    expect(mocks.usePeople).toHaveBeenCalledWith(
      {
        page: 0,
        size: 1000,
        module: undefined,
        isGeneralAdmin: false,
      },
      { enabled: true },
    );
    expect(mocks.useGroups).toHaveBeenCalledWith(
      {
        page: 0,
        size: 1000,
        module: undefined,
        isGeneralAdmin: false,
      },
      { enabled: true },
    );
    expect(
      screen.getByRole('button', { name: 'Asignar usuarios a grupos' }),
    ).toBeDisabled();
    expect(
      screen.queryByRole('combobox', { name: 'Seleccionar módulo' }),
    ).not.toBeInTheDocument();
  });

  test('envía múltiples usuarios y grupos y limpia la selección al completar', async () => {
    const user = userEvent.setup();
    const onNotice = vi.fn();
    mocks.mutate.mockImplementation((_request, options) => {
      options.onSuccess({
        status: 'SUCCESS',
        requested: 4,
        assigned: 3,
        skipped: 1,
        failed: 0,
        results: [],
        warnings: [],
      });
    });

    render(
      <AssignUserToGroupCard isGeneralAdmin={false} onNotice={onNotice} />,
    );

    await user.click(screen.getByRole('checkbox', { name: /Ana López/ }));
    await user.click(screen.getByRole('checkbox', { name: /Luis Pérez/ }));
    await user.click(screen.getByRole('checkbox', { name: /soporte/i }));
    await user.click(screen.getByRole('checkbox', { name: /auditoria/i }));
    await user.click(
      screen.getByRole('button', { name: 'Realizar 4 asignaciones' }),
    );

    expect(mocks.mutate).toHaveBeenCalledWith(
      {
        memberUids: ['ana', 'luis'],
        groupNames: ['soporte', 'auditoria'],
        module: undefined,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(onNotice).toHaveBeenCalledWith(
      'success',
      '3 asignadas, 1 ya existentes y 0 fallidas.',
    );
    expect(
      screen.getByText('3 asignadas, 1 ya existentes y 0 fallidas.'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole('checkbox', { name: /Ana López/ }),
      ).not.toBeChecked(),
    );
  });

  test('conserva la selección y muestra el detalle ante un resultado parcial', async () => {
    const user = userEvent.setup();
    const onNotice = vi.fn();
    mocks.mutate.mockImplementation((_request, options) => {
      options.onSuccess({
        status: 'PARTIAL',
        requested: 2,
        assigned: 1,
        skipped: 0,
        failed: 1,
        results: [
          {
            memberUid: 'ana',
            groupName: 'auditoria',
            status: 'FAILED',
            message: 'No se pudo actualizar el grupo',
          },
        ],
        warnings: [
          {
            memberUid: 'ana',
            totalGroups: 30,
            message: 'La persona acumula 30 grupos',
          },
        ],
      });
    });

    render(
      <AssignUserToGroupCard isGeneralAdmin={false} onNotice={onNotice} />,
    );

    await user.click(screen.getByRole('checkbox', { name: /Ana López/ }));
    await user.click(screen.getByRole('checkbox', { name: /soporte/i }));
    await user.click(screen.getByRole('checkbox', { name: /auditoria/i }));
    await user.click(
      screen.getByRole('button', { name: 'Realizar 2 asignaciones' }),
    );

    expect(
      screen.getByRole('checkbox', { name: /Ana López/ }),
    ).toBeChecked();
    expect(
      screen.getByText(/ana → auditoria: No se pudo actualizar el grupo/),
    ).toBeInTheDocument();
    expect(onNotice).toHaveBeenCalledWith(
      'warning',
      '1 asignadas, 0 ya existentes y 1 fallidas.',
    );
    expect(onNotice).toHaveBeenCalledWith(
      'warning',
      'ana: La persona acumula 30 grupos',
    );
  });

  test('mantiene deshabilitadas las opciones mientras muestra datos placeholder', () => {
    const placeholderQuery = {
      data: undefined,
      isError: false,
      isPending: false,
      isPlaceholderData: true,
    };
    mocks.usePeople.mockReturnValue(placeholderQuery);
    mocks.useGroups.mockReturnValue(placeholderQuery);

    render(
      <AssignUserToGroupCard isGeneralAdmin={false} onNotice={vi.fn()} />,
    );

    expect(screen.getByLabelText('Buscar usuarios…')).toBeDisabled();
    expect(screen.getByLabelText('Buscar grupos…')).toBeDisabled();
  });

  test('exige un módulo y lo propaga para el administrador global', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AssignUserToGroupCard isGeneralAdmin onNotice={vi.fn()} />,
    );

    expect(mocks.usePeople).toHaveBeenLastCalledWith(
      {
        page: 0,
        size: 1000,
        module: undefined,
        isGeneralAdmin: true,
      },
      { enabled: false },
    );
    expect(screen.getByLabelText('Buscar usuarios…')).toBeDisabled();

    const nativeModuleSelect = container.querySelector('select');
    expect(nativeModuleSelect).not.toBeNull();
    fireEvent.change(nativeModuleSelect!, { target: { value: 'reclamos' } });

    await waitFor(() =>
      expect(mocks.usePeople).toHaveBeenLastCalledWith(
        {
          page: 0,
          size: 1000,
          module: 'reclamos',
          isGeneralAdmin: true,
        },
        { enabled: true },
      ),
    );

    await user.click(screen.getByRole('checkbox', { name: /Ana López/ }));
    await user.click(screen.getByRole('checkbox', { name: /soporte/i }));
    await user.click(
      screen.getByRole('button', { name: 'Realizar 1 asignación' }),
    );

    expect(mocks.mutate).toHaveBeenCalledWith(
      {
        memberUids: ['ana'],
        groupNames: ['soporte'],
        module: 'reclamos',
      },
      expect.any(Object),
    );
  });
});
