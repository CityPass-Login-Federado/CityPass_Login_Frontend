import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { useAssignUsersToGroups, useGroups } from '../hooks/useGroups';
import { usePeople } from '../hooks/usePeople';
import {
  assignmentFormSchema,
  type AssignmentFormValues,
} from '../schemas/systemManagementSchemas';
import {
  type BulkMembershipResponse,
  type NoticeHandler,
} from '../types';
import { getPanelErrorMessage } from '../utils/errors';
import { getGroupDisplayName } from '../utils/groups';
import {
  CheckboxMultiSelect,
  type CheckboxMultiSelectOption,
} from './CheckboxMultiSelect';

const MAX_BULK_MEMBERSHIPS = 1000;

interface AssignUserToGroupCardProps {
  onNotice: NoticeHandler;
}

export const AssignUserToGroupCard = ({
  onNotice,
}: AssignUserToGroupCardProps) => {
  const [lastResponse, setLastResponse] =
    useState<BulkMembershipResponse | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: { memberUids: [], groupNames: [] },
  });
  const memberUids = watch('memberUids');
  const groupNames = watch('groupNames');
  const peopleQuery = usePeople(
    { page: 0, size: 1000 },
  );
  const groupsQuery = useGroups(
    { page: 0, size: 1000 },
  );
  const mutation = useAssignUsersToGroups();

  const userOptions = useMemo<CheckboxMultiSelectOption[]>(
    () =>
      (peopleQuery.data?.content ?? []).map((person) => ({
        value: person.uid,
        label: `${person.givenName} ${person.sn}`,
        description: `${person.uid} · ${person.email}`,
      })),
    [peopleQuery.data?.content],
  );
  const groupOptions = useMemo<CheckboxMultiSelectOption[]>(
    () =>
      (groupsQuery.data?.content ?? []).map((group) => ({
        value: group.name,
        label: getGroupDisplayName(group),
        description: `${group.members.length} ${
          group.members.length === 1 ? 'miembro' : 'miembros'
        }`,
      })),
    [groupsQuery.data?.content],
  );

  const assignmentCount = memberUids.length * groupNames.length;
  const exceedsBulkLimit = assignmentCount > MAX_BULK_MEMBERSHIPS;
  const isLoading =
    peopleQuery.isPending ||
    peopleQuery.isPlaceholderData ||
    groupsQuery.isPending ||
    groupsQuery.isPlaceholderData;
  const hasLoadError = peopleQuery.isError || groupsQuery.isError;
  const selectionDisabled =
    isLoading || hasLoadError || mutation.isPending;

  const handleFormSubmit = (values: AssignmentFormValues) => {
    setLastResponse(null);
    mutation.mutate(
      {
        memberUids: values.memberUids,
        groupNames: values.groupNames,
      },
      {
        onSuccess: (response) => {
          setLastResponse(response);
          const summary = buildResponseSummary(response);
          const kind =
            response.status === 'SUCCESS'
              ? 'success'
              : response.status === 'PARTIAL'
                ? 'warning'
                : 'error';
          onNotice(kind, summary);

          if (response.warnings.length) {
            onNotice(
              'warning',
              response.warnings
                .map((warning) => `${warning.memberUid}: ${warning.message}`)
                .join(' '),
            );
          }

          if (response.status === 'SUCCESS') {
            reset({ memberUids: [], groupNames: [] });
          }
        },
        onError: (error) =>
          onNotice(
            'error',
            getPanelErrorMessage(
              error,
              'No se pudieron asignar los usuarios a los grupos.',
            ),
          ),
      },
    );
  };

  return (
    <section id="assignment" aria-labelledby="assignment-title">
      <Card className="h-full">
        <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
          <CardTitle id="assignment-title" className="text-base">
            Asignar usuarios a grupos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cada usuario seleccionado se agregará a todos los grupos elegidos.
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
          <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <Controller
              name="memberUids"
              control={control}
              render={({ field }) => (
                <CheckboxMultiSelect
                  label="Usuarios"
                  options={userOptions}
                  selectedValues={field.value}
                  onChange={field.onChange}
                  searchPlaceholder="Buscar usuarios…"
                  emptyMessage="No hay usuarios para mostrar."
                  disabled={selectionDisabled}
                  error={errors.memberUids?.message}
                />
              )}
            />

            <Controller
              name="groupNames"
              control={control}
              render={({ field }) => (
                <CheckboxMultiSelect
                  label="Grupos"
                  options={groupOptions}
                  selectedValues={field.value}
                  onChange={field.onChange}
                  searchPlaceholder="Buscar grupos…"
                  emptyMessage="No hay grupos para mostrar."
                  disabled={selectionDisabled}
                  error={errors.groupNames?.message}
                />
              )}
            />

            {hasLoadError && (
              <p role="alert" className="text-xs text-destructive">
                No se pudieron cargar las opciones de asignación.
              </p>
            )}

            <div
              className={cn(
                'rounded-md border px-3 py-2 text-sm',
                exceedsBulkLimit
                  ? 'border-destructive/50 bg-destructive/5 text-destructive'
                  : 'bg-muted/40 text-muted-foreground',
              )}
              role={exceedsBulkLimit ? 'alert' : 'status'}
            >
              {memberUids.length}{' '}
              {memberUids.length === 1 ? 'usuario' : 'usuarios'} ×{' '}
              {groupNames.length}{' '}
              {groupNames.length === 1 ? 'grupo' : 'grupos'} ={' '}
              <strong>{assignmentCount} asignaciones</strong>
              {exceedsBulkLimit && (
                <span className="block text-xs">
                  El máximo permitido por operación es {MAX_BULK_MEMBERSHIPS}.
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                assignmentCount === 0 ||
                exceedsBulkLimit ||
                isLoading ||
                hasLoadError ||
                mutation.isPending
              }
            >
              {mutation.isPending
                ? 'Asignando…'
                : assignmentCount > 0
                  ? `Realizar ${assignmentCount} ${
                      assignmentCount === 1 ? 'asignación' : 'asignaciones'
                    }`
                  : 'Asignar usuarios a grupos'}
            </Button>

            {lastResponse && <BulkAssignmentResult response={lastResponse} />}
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

const buildResponseSummary = (response: BulkMembershipResponse) =>
  `${response.assigned} asignadas, ${response.skipped} ya existentes y ${response.failed} fallidas.`;

const BulkAssignmentResult = ({
  response,
}: {
  response: BulkMembershipResponse;
}) => {
  const failures = response.results.filter(
    (result) => result.status === 'FAILED',
  );
  const isSuccess = response.status === 'SUCCESS';

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={cn(
        'space-y-2 rounded-md border px-3 py-2 text-sm',
        response.status === 'FAILED'
          ? 'border-destructive/50 bg-destructive/5'
          : response.status === 'PARTIAL'
            ? 'border-amber-300 bg-amber-50 text-amber-950'
            : 'border-emerald-300 bg-emerald-50 text-emerald-950',
      )}
    >
      <p className="font-medium">{buildResponseSummary(response)}</p>

      {failures.length > 0 && (
        <ul className="max-h-32 list-disc space-y-1 overflow-y-auto pl-5 text-xs">
          {failures.map((failure) => (
            <li key={`${failure.memberUid}-${failure.groupName}`}>
              {failure.memberUid} → {failure.groupName}: {failure.message}
            </li>
          ))}
        </ul>
      )}

      {response.warnings.length > 0 && (
        <ul className="space-y-1 text-xs">
          {response.warnings.map((warning) => (
            <li key={warning.memberUid}>
              {warning.memberUid}: {warning.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
