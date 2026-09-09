import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { type PanelPerson } from '../types';
import { UsersTable } from './UsersTable';

const person: PanelPerson = {
  employeeNumber: 'U000001',
  uid: 'jperez',
  givenName: 'Juan',
  sn: 'Pérez',
  email: 'jperez@citypass.local',
  disabled: false,
  module: 'reclamos',
};

const renderTable = (isGeneralAdmin: boolean) =>
  render(
    <UsersTable
      people={[person]}
      groupNamesByUser={new Map([['jperez', ['soporte-n2']]])}
      isGeneralAdmin={isGeneralAdmin}
      onEdit={vi.fn()}
      onChangeStatus={vi.fn()}
    />,
  );

describe('UsersTable', () => {
  test('no renderiza la columna Módulo para un administrador específico', () => {
    renderTable(false);

    expect(
      screen.queryByRole('columnheader', { name: 'Módulo' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Reclamos')).not.toBeInTheDocument();
  });

  test('renderiza la columna Módulo para un administrador general', () => {
    renderTable(true);

    expect(
      screen.getByRole('columnheader', { name: 'Módulo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Reclamos')).toBeInTheDocument();
  });
});
