import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AssignUserToGroupCard } from './AssignUserToGroupCard';

const mocks = vi.hoisted(() => ({
  usePeople: vi.fn(),
  useGroups: vi.fn(),
  useAssignUserToGroup: vi.fn(),
}));

vi.mock('../hooks/usePeople', () => ({ usePeople: mocks.usePeople }));
vi.mock('../hooks/useGroups', () => ({
  useGroups: mocks.useGroups,
  useAssignUserToGroup: mocks.useAssignUserToGroup,
}));

describe('AssignUserToGroupCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const queryResult = { data: undefined, isError: false, isPending: false };
    mocks.usePeople.mockReturnValue(queryResult);
    mocks.useGroups.mockReturnValue(queryResult);
    mocks.useAssignUserToGroup.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
  });

  test('consulta las opciones sin depender del alcance administrativo', () => {
    render(<AssignUserToGroupCard onNotice={vi.fn()} />);

    expect(mocks.usePeople).toHaveBeenCalledWith(
      { page: 0, size: 1000 },
    );
    expect(mocks.useGroups).toHaveBeenCalledWith(
      { page: 0, size: 1000 },
    );
    expect(
      screen.getByRole('button', { name: 'Asignar a Grupo' }),
    ).toBeDisabled();
    expect(
      screen.queryByRole('combobox', { name: 'Seleccionar módulo' }),
    ).not.toBeInTheDocument();
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

    render(<AssignUserToGroupCard onNotice={vi.fn()} />);

    expect(
      screen.getByRole('combobox', { name: 'Seleccionar usuario' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('combobox', { name: 'Seleccionar grupo' }),
    ).toBeDisabled();
  });
});
