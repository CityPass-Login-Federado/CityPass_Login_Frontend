import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { type PanelPerson } from '../../types';
import { UsersTable } from './UsersTable';

const person: PanelPerson = {
  employeeNumber: 'U000001',
  uid: 'jperez',
  givenName: 'Juan',
  sn: 'Pérez',
  email: 'jperez@citypass.local',
  disabled: false,
  locked: false,
  lockoutUntil: null,
  module: 'reclamos',
};

const renderTable = (
  isGeneralAdmin: boolean,
  groupDataStatus: 'loading' | 'ready' | 'error' = 'ready',
) =>
  render(
    <UsersTable
      people={[person]}
      groupNamesByUser={new Map([['reclamos:jperez', ['soporte-n2']]])}
      groupDataStatus={groupDataStatus}
      isGeneralAdmin={isGeneralAdmin}
      onEdit={vi.fn()}
      onUnlock={vi.fn()}
      onChangeStatus={vi.fn()}
      isUnlockPending={false}
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

  test('no informa falsamente que el usuario está sin grupo si falla esa consulta', () => {
    renderTable(false, 'error');

    expect(screen.getByText('No disponible')).toBeInTheDocument();
    expect(screen.queryByText('Sin grupo')).not.toBeInTheDocument();
  });

  test('usa una papelera para la acción de deshabilitar', () => {
    renderTable(false);

    const disableButton = screen.getByRole('button', {
      name: 'Deshabilitar a Juan Pérez',
    });

    expect(disableButton.querySelector('.lucide-trash2')).toBeInTheDocument();
  });

  test('distingue los estados activo, deshabilitado y bloqueado temporalmente', () => {
    const lockedUntil = '2026-11-15T15:30:00Z';
    render(
      <UsersTable
        people={[
          person,
          {
            ...person,
            employeeNumber: 'U000002',
            uid: 'mlopez',
            givenName: 'María',
            disabled: true,
          },
          {
            ...person,
            employeeNumber: 'U000003',
            uid: 'agarcia',
            givenName: 'Ana',
            locked: true,
            lockoutUntil: lockedUntil,
          },
        ]}
        groupNamesByUser={new Map()}
        groupDataStatus="ready"
        isGeneralAdmin={false}
        onEdit={vi.fn()}
        onUnlock={vi.fn()}
        onChangeStatus={vi.fn()}
        isUnlockPending={false}
      />,
    );

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Deshabilitado')).toBeInTheDocument();
    expect(screen.getByText('Bloqueado temporalmente')).toBeInTheDocument();
    expect(screen.getByText(/Hasta/)).toContainElement(
      document.querySelector(`time[datetime="${lockedUntil}"]`),
    );
  });

  test('solo permite solicitar el desbloqueo temporal de una cuenta bloqueada', async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn();
    const lockedPerson = {
      ...person,
      employeeNumber: 'U000002',
      locked: true,
      lockoutUntil: '2026-11-15T15:30:00Z',
    };
    render(
      <UsersTable
        people={[person, lockedPerson]}
        groupNamesByUser={new Map()}
        groupDataStatus="ready"
        isGeneralAdmin={false}
        onEdit={vi.fn()}
        onUnlock={onUnlock}
        onChangeStatus={vi.fn()}
        isUnlockPending={false}
      />,
    );

    const unlockButton = screen.getByRole('button', {
      name: 'Desbloquear cuenta de Juan Pérez',
    });
    expect(
      screen.getAllByRole('button', { name: 'Desbloquear cuenta de Juan Pérez' }),
    ).toHaveLength(1);
    expect(unlockButton.querySelector('.lucide-lock-open')).toBeInTheDocument();

    await user.click(unlockButton);

    expect(onUnlock).toHaveBeenCalledWith(lockedPerson);
  });
});
