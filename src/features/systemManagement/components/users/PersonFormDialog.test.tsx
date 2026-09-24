import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type PanelPerson } from '../../types';
import { PersonFormDialog } from './PersonFormDialog';

const mocks = vi.hoisted(() => ({
  createMutate: vi.fn(),
  updateMutate: vi.fn(),
}));

vi.mock('../../hooks/usePeople', () => ({
  useCreatePerson: () => ({ isPending: false, mutate: mocks.createMutate }),
  useUpdatePerson: () => ({ isPending: false, mutate: mocks.updateMutate }),
}));

const person: PanelPerson = {
  employeeNumber: 'U000001',
  uid: 'jperez',
  givenName: 'Juan',
  sn: 'Pérez',
  email: 'jperez@citypass.local',
  disabled: false,
  module: 'reclamos',
};
const modules = [
  { id: 'reclamos', name: 'Reclamos' },
  { id: 'eda', name: 'EDA' },
];

describe('PersonFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('crea un usuario dentro del módulo del delegado y cierra el diálogo', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    mocks.createMutate.mockImplementation((_variables, options) => {
      options.onSuccess();
    });

    render(
      <PersonFormDialog
        open
        person={null}
        isGeneralAdmin={false}
        initialModule="reclamos"
        modules={modules}
        isModulesLoading={false}
        hasModulesError={false}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        onError={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.type(screen.getByLabelText('Apellido'), 'López');
    await user.type(screen.getByLabelText('Usuario'), 'alopez');
    await user.type(screen.getByLabelText('Email'), 'alopez@citypass.local');
    await user.type(screen.getByLabelText('Contraseña temporal'), 'changeit123');
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));

    await waitFor(() =>
      expect(mocks.createMutate).toHaveBeenCalledWith(
        {
          module: 'reclamos',
          data: {
            givenName: 'Ana',
            sn: 'López',
            username: 'alopez',
            email: 'alopez@citypass.local',
            temporaryPassword: 'changeit123',
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      ),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalledWith('Usuario creado correctamente.');
  });

  test('exige seleccionar un módulo al crear como administrador global', async () => {
    const user = userEvent.setup();

    render(
      <PersonFormDialog
        open
        person={null}
        isGeneralAdmin
        modules={modules}
        isModulesLoading={false}
        hasModulesError={false}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.type(screen.getByLabelText('Apellido'), 'López');
    await user.type(screen.getByLabelText('Usuario'), 'alopez');
    await user.type(screen.getByLabelText('Email'), 'alopez@citypass.local');
    await user.type(screen.getByLabelText('Contraseña temporal'), 'changeit123');
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Seleccione un módulo',
    );
    expect(mocks.createMutate).not.toHaveBeenCalled();
  });

  test('actualiza el usuario y comunica los errores de la operación', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    mocks.updateMutate.mockImplementation((_variables, options) => {
      options.onError(new Error('error de prueba'));
    });

    render(
      <PersonFormDialog
        open
        person={person}
        isGeneralAdmin
        modules={modules}
        isModulesLoading={false}
        hasModulesError={false}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
        onError={onError}
      />,
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Nombre')).toHaveValue('Juan'),
    );
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'juan@citypass.local');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(mocks.updateMutate).toHaveBeenCalledWith(
        {
          uid: 'jperez',
          module: 'reclamos',
          data: {
            givenName: 'Juan',
            sn: 'Pérez',
            email: 'juan@citypass.local',
            newUsername: undefined,
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      ),
    );
    expect(screen.queryByLabelText('Contraseña temporal')).not.toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('No se pudo actualizar el usuario.');
  });
});
