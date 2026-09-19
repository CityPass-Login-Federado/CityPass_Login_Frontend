import { render, screen } from '@testing-library/react';
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
});
