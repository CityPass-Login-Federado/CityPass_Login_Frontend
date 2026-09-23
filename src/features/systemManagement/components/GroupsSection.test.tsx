import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

import { GroupsSection } from './GroupsSection';

const mocks = vi.hoisted(() => ({
  useGroups: vi.fn(),
}));

vi.mock('../hooks/useGroups', () => ({
  useGroups: mocks.useGroups,
}));

vi.mock('./CreateGroupDialog', () => ({
  CreateGroupDialog: () => null,
}));

vi.mock('./EditGroupDialog', () => ({
  EditGroupDialog: () => null,
}));

vi.mock('./DeleteGroupAlertDialog', () => ({
  DeleteGroupAlertDialog: () => null,
}));

describe('GroupsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useGroups.mockReturnValue({ isPending: true });
  });

  test('usa el estilo primario para crear un grupo', () => {
    render(<GroupsSection isGeneralAdmin onNotice={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Agregar Grupo' }),
    ).toHaveClass('bg-primary', 'text-primary-foreground');
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por módulo' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Filtrar por estado' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por reserva' }),
    ).toBeInTheDocument();
  });

  test('oculta el filtro por módulo para un delegado', () => {
    render(<GroupsSection isGeneralAdmin={false} onNotice={vi.fn()} />);

    expect(
      screen.queryByRole('combobox', { name: 'Filtrar por módulo' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por reserva' }),
    ).toBeInTheDocument();
  });

});
