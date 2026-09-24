import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';

import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useGroups } from '../../hooks/useGroups';
import { useModules } from '../../hooks/useModules';
import {
  type GroupReservationFilter,
  type NoticeHandler,
  type PanelGroup,
} from '../../types';
import { getPanelErrorMessage } from '../../utils/errors';
import { getReservedParam } from '../../utils/groups';
import { CreateGroupDialog } from './CreateGroupDialog';
import { EditGroupDialog } from './EditGroupDialog';
import { GroupFilters } from './GroupFilters';
import { GroupsTable } from './GroupsTable';
import { SectionEmpty, SectionError, SectionLoading } from '../shared/SectionState';
import { TablePagination } from '../shared/TablePagination';

interface GroupsSectionProps {
  isGeneralAdmin: boolean;
  onNotice: NoticeHandler;
}

const PAGE_SIZE = 8;

export const GroupsSection = ({
  isGeneralAdmin,
  onNotice,
}: GroupsSectionProps) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [reservation, setReservation] =
    useState<GroupReservationFilter>('all');
  const [module, setModule] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<PanelGroup | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const modulesQuery = useModules({ enabled: isGeneralAdmin });
  const modules = useMemo(() => modulesQuery.data ?? [], [modulesQuery.data]);
  const isModuleCatalogUnavailable =
    isGeneralAdmin &&
    (modulesQuery.isPending || modules.length === 0);
  const reserved = getReservedParam(reservation);
  const selectedModule =
    isGeneralAdmin && module !== 'all' ? module : undefined;
  const query = useGroups({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    reserved,
    module: selectedModule,
    isGeneralAdmin,
  });

  useEffect(() => {
    if (
      module !== 'all' &&
      !modulesQuery.isPending &&
      !modulesQuery.isError &&
      !modules.some((item) => item.id === module)
    ) {
      setModule('all');
      setPage(0);
    }
  }, [module, modules, modulesQuery.isError, modulesQuery.isPending]);

  const handleFilterChange = (callback: () => void) => {
    callback();
    setPage(0);
  };

  return (
    <section id="groups" aria-labelledby="groups-title">
      <Card className="h-full">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <h2 id="groups-title" className="sr-only">
            Listado de grupos
          </h2>
          <GroupFilters
            search={search}
            reservation={reservation}
            module={module}
            modules={modules}
            isModuleFilterDisabled={isModuleCatalogUnavailable}
            isGeneralAdmin={isGeneralAdmin}
            onSearchChange={(value) =>
              handleFilterChange(() => setSearch(value))
            }
            onReservationChange={(value) =>
              handleFilterChange(() => setReservation(value))
            }
            onModuleChange={(value) =>
              handleFilterChange(() => setModule(value))
            }
            onAddGroup={() => setIsCreateOpen(true)}
          />

          {isGeneralAdmin && modulesQuery.isError && modules.length === 0 && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              No se pudieron cargar los módulos. El filtro y la creación de
              grupos por módulo permanecerán deshabilitados.
            </p>
          )}

          {isGeneralAdmin &&
            !modulesQuery.isPending &&
            !modulesQuery.isError &&
            modules.length === 0 && (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                No hay módulos disponibles para administrar.
              </p>
            )}

          {query.isPending || query.isPlaceholderData ? (
            <SectionLoading />
          ) : query.isError ? (
            <SectionError
              message={getPanelErrorMessage(
                query.error,
                'No se pudo cargar el listado de grupos.',
              )}
            />
          ) : query.data.content.length === 0 ? (
            <SectionEmpty message="No hay grupos para la búsqueda realizada." />
          ) : (
            <>
              <GroupsTable
                groups={query.data.content}
                isGeneralAdmin={isGeneralAdmin}
                onEdit={setSelectedGroup}
              />
              <TablePagination
                currentPage={query.data.currentPage}
                totalPages={query.data.totalPages}
                totalElements={query.data.totalElements}
                pageSize={query.data.size}
                itemLabel="grupos"
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <CreateGroupDialog
        open={isCreateOpen}
        isGeneralAdmin={isGeneralAdmin}
        initialModule={selectedModule}
        modules={modules}
        isModulesLoading={modulesQuery.isPending}
        hasModulesError={modulesQuery.isError}
        onOpenChange={setIsCreateOpen}
        onSuccess={(message) => onNotice('success', message)}
        onError={(message) => onNotice('error', message)}
      />
      <EditGroupDialog
        open={selectedGroup !== null}
        group={selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
        onSuccess={(message) => onNotice('success', message)}
        onError={(message) => onNotice('error', message)}
      />
    </section>
  );
};
