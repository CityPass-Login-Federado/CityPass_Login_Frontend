import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type PanelPerson } from '../types';
import { UsersSection } from './UsersSection';

const mocks = vi.hoisted(() => ({
  usePeople: vi.fn(),
  useGroups: vi.fn(),
  useSetPersonStatus: vi.fn(),
}));

vi.mock('../hooks/usePeople', () => ({
  usePeople: mocks.usePeople,
  useSetPersonStatus: mocks.useSetPersonStatus,
}));

vi.mock('../hooks/useGroups', () => ({ useGroups: mocks.useGroups }));

vi.mock('./UserFilters', () => ({ UserFilters: () => null }));
vi.mock('./PersonFormDialog', () => ({ PersonFormDialog: () => null }));
vi.mock('./TablePagination', () => ({ TablePagination: () => null }));
vi.mock('./UsersTable', () => ({
  UsersTable: ({ people }: { people: PanelPerson[] }) => (
    <div>{people.map((person) => person.uid).join(', ')}</div>
  ),
}));

const stalePerson: PanelPerson = {
  employeeNumber: 'U000001',
  uid: 'usuario-modulo-anterior',
  givenName: 'Usuario',
  sn: 'Anterior',
  email: 'anterior@citypass.local',
  disabled: false,
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
    mocks.useSetPersonStatus.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
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
});
