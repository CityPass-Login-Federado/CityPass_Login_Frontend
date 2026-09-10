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

  test('no consulta opciones globales antes de que un admin general elija módulo', () => {
    render(<AssignUserToGroupCard isGeneralAdmin onNotice={vi.fn()} />);

    expect(mocks.usePeople).toHaveBeenCalledWith(
      { module: undefined, page: 0, size: 1000 },
      { enabled: false },
    );
    expect(mocks.useGroups).toHaveBeenCalledWith(
      { module: undefined, page: 0, size: 1000 },
      { enabled: false },
    );
    expect(
      screen.getByRole('button', { name: 'Asignar a grupo' }),
    ).toBeDisabled();
  });

  test('carga opciones inmediatamente para un admin de módulo', () => {
    render(
      <AssignUserToGroupCard isGeneralAdmin={false} onNotice={vi.fn()} />,
    );

    expect(mocks.usePeople).toHaveBeenCalledWith(
      { module: undefined, page: 0, size: 1000 },
      { enabled: true },
    );
    expect(mocks.useGroups).toHaveBeenCalledWith(
      { module: undefined, page: 0, size: 1000 },
      { enabled: true },
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

    expect(
      screen.getByRole('combobox', { name: 'Seleccionar usuario' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('combobox', { name: 'Seleccionar grupo' }),
    ).toBeDisabled();
  });
});
