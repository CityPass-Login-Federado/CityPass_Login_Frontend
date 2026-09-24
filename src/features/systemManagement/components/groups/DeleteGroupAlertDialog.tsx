import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useDeleteGroup } from '../../hooks/useGroups';
import { type PanelGroup } from '../../types';
import { getPanelErrorMessage } from '../../utils/errors';

interface DeleteGroupAlertDialogProps {
  group: PanelGroup | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const DeleteGroupAlertDialog = ({
  group,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteGroupAlertDialogProps) => {
  const mutation = useDeleteGroup();

  const handleDelete = () => {
    if (!group) return;

    mutation.mutate(
      { groupName: group.name, module: group.module },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess('Grupo eliminado correctamente.');
        },
        onError: (error) => {
          onOpenChange(false);
          onError(getPanelErrorMessage(error, 'No se pudo eliminar el grupo.'));
        },
      },
    );
  };

  return (
    <AlertDialog open={group !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar grupo?</AlertDialogTitle>
          <AlertDialogDescription>
            El grupo {group?.name}
            {group?.module ? ` del módulo ${group.module}` : ''} será eliminado.
            Esta acción puede afectar el acceso de sus usuarios y no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={mutation.isPending}
            onClick={handleDelete}
          >
            {mutation.isPending ? 'Eliminando…' : 'Eliminar grupo'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
