import { render, screen } from '@testing-library/react';
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
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Número de Grupo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Cantidad de Usuarios' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
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
});
