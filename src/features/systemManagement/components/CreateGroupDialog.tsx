import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useCreateGroup } from '../hooks/useGroups';
import {
  groupFormSchema,
  type GroupFormValues,
} from '../schemas/systemManagementSchemas';
import { getPanelErrorMessage } from '../utils/errors';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const CreateGroupDialog = ({
  open,
  onOpenChange,
  onSuccess,
  onError,
}: CreateGroupDialogProps) => {
  const mutation = useCreateGroup();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) reset({ name: '' });
  }, [open, reset]);

  const handleFormSubmit = (values: GroupFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess('Grupo creado correctamente.');
      },
      onError: (error) =>
        onError(getPanelErrorMessage(error, 'No se pudo crear el grupo.')),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo grupo</DialogTitle>
          <DialogDescription>
            El nombre puede contener minúsculas, números y guiones.
          </DialogDescription>
        </DialogHeader>
        <form
          id="group-form"
          className="space-y-2"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <Label htmlFor="groupName">Nombre del grupo</Label>
          <Input
            id="groupName"
            placeholder="soporte-n2"
            disabled={mutation.isPending}
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors.name && (
            <p role="alert" className="text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="group-form" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando…' : 'Crear grupo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
