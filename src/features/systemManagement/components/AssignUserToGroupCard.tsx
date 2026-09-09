import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAssignUserToGroup, useGroups } from '../hooks/useGroups';
import { usePeople } from '../hooks/usePeople';
import {
  assignmentFormSchema,
  type AssignmentFormValues,
} from '../schemas/systemManagementSchemas';
import { type NoticeHandler } from '../types';
import { getPanelErrorMessage } from '../utils/errors';
import { CITYPASS_MODULES } from '../utils/modules';

interface AssignUserToGroupCardProps {
  isGeneralAdmin: boolean;
  onNotice: NoticeHandler;
}

export const AssignUserToGroupCard = ({
  isGeneralAdmin,
  onNotice,
}: AssignUserToGroupCardProps) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: { moduleId: '', userId: '', groupName: '' },
  });
  const moduleId = watch('moduleId');
  const selectedModule = isGeneralAdmin && moduleId ? moduleId : undefined;
  const peopleQuery = usePeople({ page: 0, size: 1000, module: selectedModule });
  const groupsQuery = useGroups({ page: 0, size: 1000, module: selectedModule });
  const mutation = useAssignUserToGroup();

  const handleFormSubmit = (values: AssignmentFormValues) => {
    if (isGeneralAdmin && !values.moduleId) {
      onNotice('error', 'Seleccione un módulo antes de asignar.');
      return;
    }

    mutation.mutate(
      {
        userId: values.userId,
        groupName: values.groupName,
        moduleId: values.moduleId || undefined,
      },
      {
        onSuccess: (response) => {
          const warning = response.warnings.length
            ? ` ${response.warnings.join(' ')}`
            : '';
          onNotice('success', `Usuario asignado correctamente.${warning}`);
          reset({ moduleId: values.moduleId, userId: '', groupName: '' });
        },
        onError: (error) =>
          onNotice(
            'error',
            getPanelErrorMessage(error, 'No se pudo asignar el usuario.'),
          ),
      },
    );
  };

  const isLoading = peopleQuery.isPending || groupsQuery.isPending;
  const hasLoadError = peopleQuery.isError || groupsQuery.isError;

  return (
    <section id="assignment" aria-labelledby="assignment-title">
      <Card className="h-full">
        <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
          <CardTitle id="assignment-title" className="text-base">
            Asignar usuario a grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
          <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
            {isGeneralAdmin && (
              <SelectField
                label="Seleccionar módulo"
                error={errors.moduleId?.message}
              >
                <Controller
                  name="moduleId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue('userId', '');
                        setValue('groupName', '');
                      }}
                      disabled={mutation.isPending}
                    >
                      <SelectTrigger aria-label="Seleccionar módulo">
                        <SelectValue placeholder="Elegir un módulo…" />
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
              </SelectField>
            )}

            <SelectField
              label="Seleccionar usuario"
              error={errors.userId?.message}
            >
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      isLoading ||
                      mutation.isPending ||
                      (isGeneralAdmin && !moduleId)
                    }
                  >
                    <SelectTrigger aria-label="Seleccionar usuario">
                      <SelectValue
                        placeholder={isLoading ? 'Cargando…' : 'Buscar usuario…'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(peopleQuery.data?.content ?? []).map((person) => (
                        <SelectItem key={person.employeeNumber} value={person.uid}>
                          {person.givenName} {person.sn} ({person.uid})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </SelectField>

            <SelectField
              label="Seleccionar grupo"
              error={errors.groupName?.message}
            >
              <Controller
                name="groupName"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      isLoading ||
                      mutation.isPending ||
                      (isGeneralAdmin && !moduleId)
                    }
                  >
                    <SelectTrigger aria-label="Seleccionar grupo">
                      <SelectValue
                        placeholder={isLoading ? 'Cargando…' : 'Elegir un grupo…'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(groupsQuery.data?.content ?? []).map((group) => (
                        <SelectItem key={group.name} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </SelectField>

            {hasLoadError && (
              <p role="alert" className="text-xs text-destructive">
                No se pudieron cargar las opciones de asignación.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || hasLoadError || mutation.isPending}
            >
              {mutation.isPending ? 'Asignando…' : 'Asignar a grupo'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

const SelectField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
    {error && (
      <p role="alert" className="text-xs text-destructive">
        {error}
      </p>
    )}
  </div>
);
