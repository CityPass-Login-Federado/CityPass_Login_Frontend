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

import { useCreatePerson, useUpdatePerson } from '../../hooks/usePeople';
import {
  personFormSchema,
  type PersonFormValues,
} from '../../schemas/systemManagementSchemas';
import { type ModuleSummary, type PanelPerson } from '../../types';
import { getPanelErrorMessage } from '../../utils/errors';

interface PersonFormDialogProps {
  open: boolean;
  person: PanelPerson | null;
  isGeneralAdmin: boolean;
  initialModule?: string;
  modules: ModuleSummary[];
  isModulesLoading: boolean;
  hasModulesError: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const emptyValues: PersonFormValues = {
  module: '',
  givenName: '',
  sn: '',
  username: '',
  email: '',
  temporaryPassword: '',
};

export const PersonFormDialog = ({
  open,
  person,
  isGeneralAdmin,
  initialModule,
  modules,
  isModulesLoading,
  hasModulesError,
  onOpenChange,
  onSuccess,
  onError,
}: PersonFormDialogProps) => {
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();
  const isEditing = person !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isModuleSelectionUnavailable =
    isGeneralAdmin &&
    !isEditing &&
    (isModulesLoading || modules.length === 0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      person
        ? {
            module: person.module ?? initialModule ?? '',
            givenName: person.givenName,
            sn: person.sn,
            username: person.uid,
            email: person.email,
            temporaryPassword: '',
          }
        : { ...emptyValues, module: initialModule ?? '' },
    );
  }, [initialModule, open, person, reset]);

  const handleFormSubmit = (values: PersonFormValues) => {
    if (isGeneralAdmin && !values.module) {
      setError('module', { message: 'Seleccione un módulo' });
      return;
    }

    if (!isEditing && values.temporaryPassword.length < 8) {
      setError('temporaryPassword', {
        message: 'La contraseña temporal es obligatoria y debe tener 8 caracteres',
      });
      return;
    }

    if (person) {
      updateMutation.mutate(
        {
          uid: person.uid,
          module: person.module || values.module || undefined,
          data: {
            givenName: values.givenName,
            sn: values.sn,
            email: values.email,
            newUsername:
              values.username === person.uid ? undefined : values.username,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess('Usuario actualizado correctamente.');
          },
          onError: (error) =>
            onError(
              getPanelErrorMessage(error, 'No se pudo actualizar el usuario.'),
            ),
        },
      );
      return;
    }

    createMutation.mutate(
      {
        module: values.module || undefined,
        data: {
          givenName: values.givenName,
          sn: values.sn,
          username: values.username,
          email: values.email,
          temporaryPassword: values.temporaryPassword,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess('Usuario creado correctamente.');
        },
        onError: (error) =>
          onError(getPanelErrorMessage(error, 'No se pudo crear el usuario.')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modificar usuario' : 'Agregar usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualice los datos habilitados para esta identidad.'
              : 'Complete los datos para crear una identidad en su módulo.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id="person-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          {isGeneralAdmin && (
            <div className="sm:col-span-2">
              <FormField
                id="personModule"
                label="Módulo"
                error={errors.module?.message}
              >
                <Controller
                  name="module"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        isPending || isEditing || isModuleSelectionUnavailable
                      }
                    >
                      <SelectTrigger
                        id="personModule"
                        aria-label="Seleccionar módulo del usuario"
                        aria-invalid={!!errors.module}
                      >
                        <SelectValue
                          placeholder={
                            isModulesLoading
                              ? 'Cargando módulos…'
                              : 'Seleccione un módulo'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {hasModulesError && modules.length === 0 && (
                  <p role="alert" className="mt-2 text-xs text-destructive">
                    No se pudieron cargar los módulos.
                  </p>
                )}
              </FormField>
            </div>
          )}

          <FormField
            id="givenName"
            label="Nombre"
            error={errors.givenName?.message}
          >
            <Input
              id="givenName"
              autoComplete="given-name"
              disabled={isPending}
              aria-invalid={!!errors.givenName}
              {...register('givenName')}
            />
          </FormField>

          <FormField id="sn" label="Apellido" error={errors.sn?.message}>
            <Input
              id="sn"
              autoComplete="family-name"
              disabled={isPending}
              aria-invalid={!!errors.sn}
              {...register('sn')}
            />
          </FormField>

          <FormField
            id="personUsername"
            label="Usuario"
            error={errors.username?.message}
          >
            <Input
              id="personUsername"
              autoComplete="username"
              disabled={isPending}
              aria-invalid={!!errors.username}
              {...register('username')}
            />
          </FormField>

          <FormField
            id="personEmail"
            label="Email"
            error={errors.email?.message}
          >
            <Input
              id="personEmail"
              type="email"
              autoComplete="email"
              disabled={isPending}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </FormField>

          {!isEditing && (
            <div className="sm:col-span-2">
              <FormField
                id="temporaryPassword"
                label="Contraseña temporal"
                error={errors.temporaryPassword?.message}
              >
                <Input
                  id="temporaryPassword"
                  type="password"
                  autoComplete="new-password"
                  disabled={isPending}
                  aria-invalid={!!errors.temporaryPassword}
                  {...register('temporaryPassword')}
                />
              </FormField>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="person-form"
            disabled={isPending || isModuleSelectionUnavailable}
          >
            {isPending
              ? 'Guardando…'
              : isEditing
                ? 'Guardar cambios'
                : 'Crear usuario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FormField = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && (
      <p className="text-xs text-destructive" role="alert">
        {error}
      </p>
    )}
  </div>
);
