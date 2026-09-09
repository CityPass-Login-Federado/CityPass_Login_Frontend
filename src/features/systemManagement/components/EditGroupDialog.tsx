import { useState } from 'react';
import { Trash2, Users } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useRemoveUserFromGroup } from '../hooks/useGroups';
import { type PanelGroup } from '../types';
import { getPanelErrorMessage } from '../utils/errors';

interface EditGroupDialogProps {
  open: boolean;
  group: PanelGroup | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const EditGroupDialog = ({
  open,
  group,
  onOpenChange,
  onSuccess,
  onError,
}: EditGroupDialogProps) => {
  const mutation = useRemoveUserFromGroup();
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const handleRemoveMember = () => {
    if (!group || !memberToRemove) return;

    mutation.mutate(
      { groupName: group.name, userId: memberToRemove },
      {
        onSuccess: () => {
          setMemberToRemove(null);
          onSuccess('Miembro removido correctamente.');
          onOpenChange(false);
        },
        onError: (error) => {
          setMemberToRemove(null);
          onError(
            getPanelErrorMessage(error, 'No se pudo remover el miembro.'),
          );
        },
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>Editar grupo: {group?.name}</DialogTitle>
              {group?.reserved && <Badge variant="secondary">Reservado</Badge>}
            </div>
            <DialogDescription>
              El nombre del grupo es inmutable. Puede revisar y quitar miembros;
              use la tarjeta de asignación para agregar nuevos.
            </DialogDescription>
          </DialogHeader>

          {group?.members.length ? (
            <ul className="divide-y rounded-lg border" aria-label="Miembros del grupo">
              {group.members.map((member) => (
                <li
                  key={member}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{member}</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setMemberToRemove(member)}
                    aria-label={`Quitar a ${member} del grupo`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Este grupo todavía no tiene miembros.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={memberToRemove !== null}
        onOpenChange={(isOpen) => !isOpen && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar miembro del grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove} dejará de pertenecer a {group?.name}. Esta acción
              puede afectar sus permisos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={mutation.isPending}
              onClick={handleRemoveMember}
            >
              {mutation.isPending ? 'Quitando…' : 'Quitar miembro'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
