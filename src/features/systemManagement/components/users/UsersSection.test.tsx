import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type PanelPerson } from '../../types';
import { UsersSection } from './UsersSection';

const mocks = vi.hoisted(() => ({
  usePeople: vi.fn(),
  useGroups: vi.fn(),
  useModules: vi.fn(),
  useSetPersonStatus: vi.fn(),
  useUnlockPerson: vi.fn(),
  unlockMutate: vi.fn(),
}));

vi.mock('../../hooks/usePeople', () => ({
  usePeople: mocks.usePeople,
  useSetPersonStatus: mocks.useSetPersonStatus,
  useUnlockPerson: mocks.useUnlockPerson,
}));

vi.mock('../../hooks/useGroups', () => ({ useGroups: mocks.useGroups }));
vi.mock('../../hooks/useModules', () => ({ useModules: mocks.useModules }));

vi.mock('./UserFilters', () => ({
  UserFilters: ({
    module,
    group,
    isModuleFilterDisabled,
    onModuleChange,
  }: {
    module: string;
    group: string;
    isModuleFilterDisabled: boolean;
    onModuleChange: (value: string) => void;
  }) => (
    <div>
      <span data-testid="selected-user-module">{module}</span>
      <span data-testid="selected-user-group">{group}</span>
      <span data-testid="user-module-disabled">
        {String(isModuleFilterDisabled)}
      </span>
      <button type="button" onClick={() => onModuleChange('eda')}>
        Seleccionar EDA
      </button>
    </div>
  ),
}));
vi.mock('./PersonFormDialog', () => ({ PersonFormDialog: () => null }));
vi.mock('../shared/TablePagination', () => ({ TablePagination: () => null }));
vi.mock('./UsersTable', () => ({
  UsersTable: ({
    people,
    onUnlock,
  }: {
    people: PanelPerson[];
    onUnlock: (person: PanelPerson) => void;
  }) => (
    <div>
      {people.map((person) => (
        <div key={person.employeeNumber}>
          <span>{person.uid}</span>
          <button type="button" onClick={() => onUnlock(person)}>
            Solicitar desbloqueo de {person.uid}
          </button>
        </div>
      ))}
    </div>
  ),
}));

const stalePerson: PanelPerson = {
  employeeNumber: 'U000001',
  uid: 'usuario-modulo-anterior',
  givenName: 'Usuario',
  sn: 'Anterior',
  email: 'anterior@citypass.local',
  disabled: false,
  locked: true,
  lockoutUntil: '2026-11-15T15:30:00Z',
  module: 'reclamos',
};

describe('UsersSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useGroups.mockReturnValue({
      data: { content: [] },
      isError: false,
      isPending: false,
      isPlaceholderData: false,
    });
    mocks.useModules.mockReturnValue({
      data: [
        { id: 'reclamos', name: 'Reclamos' },
        { id: 'eda', name: 'EDA' },
      ],
      isError: false,
      isPending: false,
    });
    mocks.useSetPersonStatus.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
    mocks.useUnlockPerson.mockReturnValue({
      isPending: false,
      mutate: mocks.unlockMutate,
    });
    mocks.usePeople.mockReturnValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 8,
      },
      isError: false,
      isPending: false,
      isPlaceholderData: false,
    });
  });

  test('no deja visibles ni accionables personas placeholder de otra consulta', () => {
    mocks.usePeople.mockReturnValue({
      data: { content: [stalePerson] },
      isError: false,
      isPending: false,
      isPlaceholderData: true,
    });

    render(<UsersSection isGeneralAdmin onNotice={vi.fn()} />);

    expect(screen.getByLabelText('Cargando')).toBeInTheDocument();
    expect(screen.queryByText(stalePerson.uid)).not.toBeInTheDocument();
  });

  test('informa el error del catálogo y deshabilita el filtro de módulos', () => {
    mocks.useModules.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
    });

    render(<UsersSection isGeneralAdmin onNotice={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los módulos',
    );
    expect(screen.getByTestId('user-module-disabled')).toHaveTextContent(
      'true',
    );
  });

  test('informa cuando el backend no devuelve módulos', () => {
    mocks.useModules.mockReturnValue({
      data: [],
      isError: false,
      isPending: false,
    });

    render(<UsersSection isGeneralAdmin onNotice={vi.fn()} />);

    expect(
      screen.getByText('No hay módulos disponibles para administrar.'),
    ).toBeInTheDocument();
  });

  test('descarta el módulo y el grupo cuando dejan de existir en el catálogo', async () => {
    let modules = [
      { id: 'reclamos', name: 'Reclamos' },
      { id: 'eda', name: 'EDA' },
    ];
    mocks.useModules.mockImplementation(() => ({
      data: modules,
      isError: false,
      isPending: false,
    }));
    const { rerender } = render(
      <UsersSection isGeneralAdmin onNotice={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar EDA' }));
    await waitFor(() =>
      expect(screen.getByTestId('selected-user-module')).toHaveTextContent(
        'eda',
      ),
    );

    modules = [{ id: 'reclamos', name: 'Reclamos' }];
    rerender(<UsersSection isGeneralAdmin onNotice={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('selected-user-module')).toHaveTextContent(
        'all',
      );
      expect(screen.getByTestId('selected-user-group')).toHaveTextContent(
        'all',
      );
      expect(mocks.usePeople).toHaveBeenLastCalledWith(
        expect.objectContaining({ module: undefined }),
      );
    });
  });

  test('confirma y ejecuta el desbloqueo temporal con el módulo de la persona', () => {
    const onNotice = vi.fn();
    mocks.usePeople.mockReturnValue({
      data: {
        content: [stalePerson],
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        size: 8,
      },
      isError: false,
      isPending: false,
      isPlaceholderData: false,
    });
    mocks.unlockMutate.mockImplementation((_variables, options) =>
      options.onSuccess(),
    );

    render(<UsersSection isGeneralAdmin onNotice={onNotice} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: `Solicitar desbloqueo de ${stalePerson.uid}`,
      }),
    );
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'no rehabilita una cuenta deshabilitada',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Desbloquear cuenta' }),
    );

    expect(mocks.unlockMutate).toHaveBeenCalledWith(
      { uid: stalePerson.uid, module: stalePerson.module },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(onNotice).toHaveBeenCalledWith(
      'success',
      'Bloqueo temporal e intentos fallidos eliminados.',
    );
  });
});
