import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

import { GroupsSection } from './GroupsSection';

const mocks = vi.hoisted(() => ({
  useGroups: vi.fn(),
  useModules: vi.fn(),
}));

vi.mock('../../hooks/useGroups', () => ({
  useGroups: mocks.useGroups,
}));
vi.mock('../../hooks/useModules', () => ({ useModules: mocks.useModules }));

vi.mock('./CreateGroupDialog', () => ({
  CreateGroupDialog: () => null,
}));

vi.mock('./EditGroupDialog', () => ({
  EditGroupDialog: () => null,
}));

describe('GroupsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useGroups.mockReturnValue({ isPending: true });
    mocks.useModules.mockReturnValue({
      data: [
        { id: 'reclamos', name: 'Reclamos' },
        { id: 'eda', name: 'EDA' },
      ],
      isError: false,
      isPending: false,
    });
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

  test('informa el error del catálogo y deshabilita el filtro de módulos', () => {
    mocks.useModules.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
    });

    render(<GroupsSection isGeneralAdmin onNotice={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los módulos',
    );
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por módulo' }),
    ).toBeDisabled();
  });

  test('informa cuando el backend no devuelve módulos', () => {
    mocks.useModules.mockReturnValue({
      data: [],
      isError: false,
      isPending: false,
    });

    render(<GroupsSection isGeneralAdmin onNotice={vi.fn()} />);

    expect(
      screen.getByText('No hay módulos disponibles para administrar.'),
    ).toBeInTheDocument();
  });

  test('mantiene deshabilitado el filtro mientras carga los módulos', () => {
    mocks.useModules.mockReturnValue({
      data: undefined,
      isError: false,
      isPending: true,
    });

    render(<GroupsSection isGeneralAdmin onNotice={vi.fn()} />);

    expect(
      screen.getByRole('combobox', { name: 'Filtrar por módulo' }),
    ).toBeDisabled();
  });

});
