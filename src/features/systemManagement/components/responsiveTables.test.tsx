import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { type PanelGroup, type PanelPerson } from '../types';
import { GroupsTable } from './groups/GroupsTable';
import { UsersTable } from './users/UsersTable';

const person: PanelPerson = {
  employeeNumber: 'U000001',
  uid: 'jperez',
  givenName: 'Juan',
  sn: 'Pérez',
  email: 'jperez@citypass.local',
  disabled: false,
  locked: true,
  lockoutUntil: '2026-11-15T15:30:00Z',
};

const group: PanelGroup = {
  name: 'soporte-n2',
  members: ['jperez'],
  reserved: false,
};

describe('tablas responsivas', () => {
  test('mantiene datos y acciones accesibles en un viewport de 360 px', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 360,
    });
    window.dispatchEvent(new Event('resize'));

    const { container } = render(
      <>
        <UsersTable
          people={[person]}
          groupNamesByUser={new Map()}
          groupDataStatus="ready"
          isGeneralAdmin={false}
          onEdit={vi.fn()}
          onUnlock={vi.fn()}
          onChangeStatus={vi.fn()}
          isUnlockPending={false}
        />
        <GroupsTable
          groups={[group]}
          isGeneralAdmin={false}
          onEdit={vi.fn()}
        />
      </>,
    );

    for (const table of screen.getAllByRole('table')) {
      expect(table).toHaveClass('block', 'sm:table');
    }
    for (const row of container.querySelectorAll('tbody tr')) {
      expect(row).toHaveClass('block', 'sm:table-row');
    }
    expect(
      screen.getByRole('button', { name: 'Modificar a Juan Pérez' }),
    ).toHaveTextContent('Modificar');
    expect(
      screen.getByRole('button', { name: 'Desbloquear cuenta de Juan Pérez' }),
    ).toHaveTextContent('Desbloquear');
    expect(
      screen.getByRole('button', { name: 'Modificar soporte-n2' }),
    ).toHaveTextContent('Modificar');
  });
});
