import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
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
import {
  type GroupSelectOption,
  type NoticeHandler,
  type UserSelectOption,
} from '../types';
import { getPanelErrorMessage } from '../utils/errors';
import { getGroupDisplayName } from '../utils/groups';

interface AssignUserToGroupCardProps {
  onNotice: NoticeHandler;
}

export const AssignUserToGroupCard = ({
  onNotice,
}: AssignUserToGroupCardProps) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: { userId: '', groupName: '' },
  });
  const userId = watch('userId');
  const groupName = watch('groupName');
  const peopleQuery = usePeople({ page: 0, size: 1000 });
  const groupsQuery = useGroups({ page: 0, size: 1000 });
  const mutation = useAssignUserToGroup();

  const userOptions = useMemo<UserSelectOption[]>(
    () =>
      (peopleQuery.data?.content ?? []).map((person) => ({
        value: person.uid,
        label: `${person.givenName} ${person.sn} (${person.uid})`,
        email: person.email,
      })),
    [peopleQuery.data?.content],
  );
  const groupOptions = useMemo<GroupSelectOption[]>(
    () =>
      (groupsQuery.data?.content ?? []).map((group) => ({
        value: group.name,
        label: getGroupDisplayName(group),
      })),
    [groupsQuery.data?.content],
  );

  const handleFormSubmit = (values: AssignmentFormValues) => {
    mutation.mutate(
      {
        userId: values.userId,
        groupName: values.groupName,
      },
      {
        onSuccess: (response) => {
          onNotice('success', 'Usuario asignado correctamente.');
          if (response.warnings.length) {
            onNotice('warning', response.warnings.join(' '));
          }
          reset({ userId: '', groupName: '' });
        },
        onError: (error) =>
          onNotice(
            'error',
            getPanelErrorMessage(error, 'No se pudo asignar el usuario.'),
          ),
      },
    );
  };

  const isLoading =
    peopleQuery.isPending ||
    peopleQuery.isPlaceholderData ||
    groupsQuery.isPending ||
    groupsQuery.isPlaceholderData;
  const hasLoadError = peopleQuery.isError || groupsQuery.isError;

  return (
    <section id="assignment" aria-labelledby="assignment-title">
      <Card className="h-full">
        <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
          <CardTitle id="assignment-title" className="text-base">
            Asignar Usuario a Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
          <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
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
                    disabled={isLoading || hasLoadError || mutation.isPending}
                  >
                    <SelectTrigger aria-label="Seleccionar usuario">
                      <SelectValue
                        placeholder={isLoading ? 'Cargando…' : 'Buscar usuario…'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {userOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                    disabled={isLoading || hasLoadError || mutation.isPending}
                  >
                    <SelectTrigger aria-label="Seleccionar grupo">
                      <SelectValue
                        placeholder={isLoading ? 'Cargando…' : 'Elegir un grupo…'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {groupOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              disabled={
                !userId ||
                !groupName ||
                isLoading ||
                hasLoadError ||
                mutation.isPending
              }
            >
              {mutation.isPending ? 'Asignando…' : 'Asignar a Grupo'}
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
