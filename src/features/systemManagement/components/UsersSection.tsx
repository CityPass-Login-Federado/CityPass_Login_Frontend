import { useMemo, useState } from 'react';

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
import { Card, CardContent } from '@/components/ui/card';

import { useGroups } from '../hooks/useGroups';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePeople, useSetPersonStatus } from '../hooks/usePeople';
import {
  type NoticeHandler,
  type PanelPerson,
  type PersonStatusFilter,
} from '../types';
import { getPanelErrorMessage } from '../utils/errors';
import { PersonFormDialog } from './PersonFormDialog';
import { SectionEmpty, SectionError, SectionLoading } from './SectionState';
import { TablePagination } from './TablePagination';
import { UserFilters } from './UserFilters';
import { UsersTable } from './UsersTable';

interface UsersSectionProps {
  isGeneralAdmin: boolean;
  onNotice: NoticeHandler;
}

const PAGE_SIZE = 8;

export const UsersSection = ({
  isGeneralAdmin,
  onNotice,
}: UsersSectionProps) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [status, setStatus] = useState<PersonStatusFilter>('all');
  const [module, setModule] = useState('all');
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PanelPerson | null>(null);
  const [statusPerson, setStatusPerson] = useState<PanelPerson | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const selectedModule = isGeneralAdmin && module !== 'all' ? module : undefined;
  const disabled =
    status === 'all' ? undefined : status === 'inactive';

  const peopleQuery = usePeople({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    group: group === 'all' ? undefined : group,
    disabled,
    module: selectedModule,
  });
  const groupsQuery = useGroups({
    page: 0,
    size: 1000,
    module: selectedModule,
  });
  const statusMutation = useSetPersonStatus();
  const groupDataStatus = groupsQuery.isError
    ? 'error'
    : groupsQuery.isPending || groupsQuery.isPlaceholderData
      ? 'loading'
        : 'ready';

  const groupNamesByUser = useMemo(() => {
    const membership = new Map<string, string[]>();
    for (const item of groupsQuery.data?.content ?? []) {
      for (const member of item.members) {
        membership.set(member, [...(membership.get(member) ?? []), item.name]);
      }
    }
    return membership;
  }, [groupsQuery.data?.content]);

  const handleFilterChange = (callback: () => void) => {
    callback();
    setPage(0);
  };

  const handleAddPerson = () => {
    setSelectedPerson(null);
    setIsPersonDialogOpen(true);
  };

  const handleEditPerson = (person: PanelPerson) => {
    setSelectedPerson(person);
    setIsPersonDialogOpen(true);
  };

  const handleStatusChange = () => {
    if (!statusPerson) return;
    const shouldDisable = !statusPerson.disabled;
    statusMutation.mutate(
      { uid: statusPerson.uid, disabled: shouldDisable },
      {
        onSuccess: () => {
          onNotice(
            'success',
            shouldDisable
              ? 'Usuario deshabilitado y sesiones revocadas.'
              : 'Usuario rehabilitado correctamente.',
          );
          setStatusPerson(null);
        },
        onError: (error) => {
          onNotice(
            'error',
            getPanelErrorMessage(error, 'No se pudo cambiar el estado.'),
          );
          setStatusPerson(null);
        },
      },
    );
  };

  return (
    <section id="users" aria-labelledby="users-title">
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <h2 id="users-title" className="sr-only">
            Listado de usuarios
          </h2>
          <UserFilters
            search={search}
            group={group}
            status={status}
            module={module}
            groups={groupsQuery.data?.content ?? []}
            isGroupFilterDisabled={groupDataStatus !== 'ready'}
            isGeneralAdmin={isGeneralAdmin}
            onSearchChange={(value) =>
              handleFilterChange(() => setSearch(value))
            }
            onGroupChange={(value) =>
              handleFilterChange(() => setGroup(value))
            }
            onStatusChange={(value) =>
              handleFilterChange(() => setStatus(value))
            }
            onModuleChange={(value) =>
              handleFilterChange(() => {
                setModule(value);
                setGroup('all');
              })
            }
            onAddUser={handleAddPerson}
          />

          {groupsQuery.isError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              No se pudieron cargar los grupos. El filtro y la columna de grupos
              permanecerán deshabilitados hasta recuperar esos datos.
            </p>
          )}

          {peopleQuery.isPending || peopleQuery.isPlaceholderData ? (
            <SectionLoading />
          ) : peopleQuery.isError ? (
            <SectionError
              message={getPanelErrorMessage(
                peopleQuery.error,
                'No se pudo cargar el listado de usuarios.',
              )}
            />
          ) : peopleQuery.data.content.length === 0 ? (
            <SectionEmpty message="No hay usuarios para los filtros seleccionados." />
          ) : (
            <>
              <UsersTable
                people={peopleQuery.data.content}
                groupNamesByUser={groupNamesByUser}
                groupDataStatus={groupDataStatus}
                isGeneralAdmin={isGeneralAdmin}
                onEdit={handleEditPerson}
                onChangeStatus={setStatusPerson}
              />
              <TablePagination
                currentPage={peopleQuery.data.currentPage}
                totalPages={peopleQuery.data.totalPages}
                totalElements={peopleQuery.data.totalElements}
                pageSize={peopleQuery.data.size}
                itemLabel="usuarios"
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <PersonFormDialog
        open={isPersonDialogOpen}
        person={selectedPerson}
        onOpenChange={setIsPersonDialogOpen}
        onSuccess={(message) => onNotice('success', message)}
        onError={(message) => onNotice('error', message)}
      />

      <AlertDialog
        open={statusPerson !== null}
        onOpenChange={(open) => !open && setStatusPerson(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusPerson?.disabled
                ? '¿Rehabilitar usuario?'
                : '¿Deshabilitar usuario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusPerson?.disabled
                ? `${statusPerson.uid} recuperará el acceso con sus grupos intactos.`
                : `${statusPerson?.uid} perderá el acceso y se revocarán sus sesiones activas. Su identidad no será eliminada.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                statusPerson?.disabled
                  ? undefined
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              }
              disabled={statusMutation.isPending}
              onClick={handleStatusChange}
            >
              {statusMutation.isPending
                ? 'Procesando…'
                : statusPerson?.disabled
                  ? 'Rehabilitar'
                  : 'Deshabilitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
