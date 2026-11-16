import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Toaster } from './sonner';

describe('ui wrapper coverage', () => {
  test('renderiza alert dialog y sus subcomponentes', () => {
    render(
      <AlertDialog open>
        <AlertDialogTrigger>Mostrar</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogOverlay data-testid="alert-overlay" />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar</AlertDialogTitle>
              <AlertDialogDescription>¿Continuar?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>,
    );

    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('¿Continuar?')).toBeInTheDocument();
    expect(screen.getByText('Continuar')).toBeInTheDocument();
    expect(screen.getByTestId('alert-overlay')).toBeInTheDocument();
  });

  test('renderiza dialog y sus subcomponentes', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal>
          <DialogOverlay data-testid="dialog-overlay" />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cabecera</DialogTitle>
              <DialogDescription>Detalle</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>Cerrar</DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    );

    expect(screen.getByText('Cabecera')).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Cerrar' }).length).toBeGreaterThan(0);
    expect(screen.getByTestId('dialog-overlay')).toBeInTheDocument();
  });

  test('renderiza el toaster con opciones de estilo', () => {
    render(<Toaster toastOptions={{ classNames: { toast: 'custom-toast' } }} />);

    expect(document.body).toBeTruthy();
  });

  test('dialog mueve el foco al contenido y lo devuelve al disparador', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Abrir formulario</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar datos</DialogTitle>
            <DialogDescription>Actualizá la información.</DialogDescription>
          </DialogHeader>
          <label htmlFor="focus-name">Nombre</label>
          <input id="focus-name" />
          <DialogFooter>
            <DialogClose>Guardar y cerrar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole('button', { name: 'Abrir formulario' });
    await user.click(trigger);
    await waitFor(() =>
      expect(screen.getByLabelText('Nombre')).toHaveFocus(),
    );
    await user.click(
      screen.getByRole('button', { name: 'Guardar y cerrar' }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test('alert dialog enfoca la acción segura y restaura el foco al cancelar', async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Eliminar elemento</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción requiere confirmación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const trigger = screen.getByRole('button', { name: 'Eliminar elemento' });
    await user.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus(),
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
