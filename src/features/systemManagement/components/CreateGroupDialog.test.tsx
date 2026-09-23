import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CreateGroupDialog } from './CreateGroupDialog';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock('../hooks/useGroups', () => ({
  useCreateGroup: () => ({ isPending: false, mutate: mocks.mutate }),
}));

describe('CreateGroupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('crea el grupo dentro del módulo del delegado', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    mocks.mutate.mockImplementation((_variables, options) => {
      options.onSuccess();
    });

    render(
      <CreateGroupDialog
        open
        isGeneralAdmin={false}
        initialModule="reclamos"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        onError={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Nombre del grupo'), 'soporte-n2');
    await user.click(screen.getByRole('button', { name: 'Crear grupo' }));

    await waitFor(() =>
      expect(mocks.mutate).toHaveBeenCalledWith(
        { data: { name: 'soporte-n2' }, module: 'reclamos' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      ),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalledWith('Grupo creado correctamente.');
  });

  test('exige un módulo para el administrador global', async () => {
    const user = userEvent.setup();

    render(
      <CreateGroupDialog
        open
        isGeneralAdmin
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Nombre del grupo'), 'auditoria');
    await user.click(screen.getByRole('button', { name: 'Crear grupo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Seleccione un módulo',
    );
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  test('muestra el selector global y comunica errores de creación', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    mocks.mutate.mockImplementation((_variables, options) => {
      options.onError(new Error('error de prueba'));
    });

    render(
      <CreateGroupDialog
        open
        isGeneralAdmin
        initialModule="estacionamiento"
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
        onError={onError}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'Seleccionar módulo del grupo' }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText('Nombre del grupo'), 'operadores');
    await user.click(screen.getByRole('button', { name: 'Crear grupo' }));

    await waitFor(() =>
      expect(mocks.mutate).toHaveBeenCalledWith(
        { data: { name: 'operadores' }, module: 'estacionamiento' },
        expect.any(Object),
      ),
    );
    expect(onError).toHaveBeenCalledWith('No se pudo crear el grupo.');
  });
});
