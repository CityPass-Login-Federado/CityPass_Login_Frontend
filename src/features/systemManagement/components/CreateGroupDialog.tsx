import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateGroup } from '../hooks/useGroups';
import {
  groupFormSchema,
  type GroupFormValues,
} from '../schemas/systemManagementSchemas';
import { getPanelErrorMessage } from '../utils/errors';
import { CITYPASS_MODULES } from '../utils/modules';

interface CreateGroupDialogProps {
  open: boolean;
  isGeneralAdmin: boolean;
  initialModule?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const CreateGroupDialog = ({
  open,
  isGeneralAdmin,
  initialModule,
  onOpenChange,
  onSuccess,
  onError,
}: CreateGroupDialogProps) => {
  const mutation = useCreateGroup();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: { name: '', module: '' },
  });

  useEffect(() => {
    if (open) reset({ name: '', module: initialModule ?? '' });
  }, [initialModule, open, reset]);

  const handleFormSubmit = (values: GroupFormValues) => {
    if (isGeneralAdmin && !values.module) {
      setError('module', { message: 'Seleccione un módulo' });
      return;
    }

    mutation.mutate(
      { data: { name: values.name }, module: values.module || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess('Grupo creado correctamente.');
        },
        onError: (error) =>
          onError(getPanelErrorMessage(error, 'No se pudo crear el grupo.')),
      },
    );
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
          {isGeneralAdmin && (
            <div className="space-y-2 pb-2">
              <Label htmlFor="groupModule">Módulo</Label>
              <Controller
                name="module"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger
                      id="groupModule"
                      aria-label="Seleccionar módulo del grupo"
                      aria-invalid={!!errors.module}
                    >
                      <SelectValue placeholder="Seleccione un módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITYPASS_MODULES.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.module && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.module.message}
                </p>
              )}
            </div>
          )}

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
