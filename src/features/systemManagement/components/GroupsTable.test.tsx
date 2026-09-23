import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import { type PanelGroup } from '../types';
import { GroupsTable } from './GroupsTable';

const group: PanelGroup = {
  name: 'soporte-n2',
  members: ['jperez'],
  reserved: false,
  module: 'reclamos',
};

describe('GroupsTable', () => {
  test('presenta las columnas y acciones requeridas por la vista', () => {
    render(
      <GroupsTable
        groups={[group]}
        isGeneralAdmin={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Nombre' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Cantidad de Usuarios' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Reservado' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'Número de Grupo' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'Estado' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Modificar soporte-n2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Eliminar soporte-n2' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'Módulo' }),
    ).not.toBeInTheDocument();
  });

  test('identifica los grupos reservados', () => {
    render(
      <GroupsTable
        groups={[{ ...group, reserved: true }]}
        isGeneralAdmin={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const groupRow = screen.getAllByRole('row')[1];

    expect(within(groupRow).getByText('Reservado')).toBeInTheDocument();
  });

  test('muestra el módulo para el administrador global', () => {
    render(
      <GroupsTable
        groups={[group]}
        isGeneralAdmin
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Módulo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Reclamos')).toBeInTheDocument();
  });
});
