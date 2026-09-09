import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useGroups } from '../hooks/useGroups';
import { type NoticeHandler, type PanelGroup } from '../types';
import { getPanelErrorMessage } from '../utils/errors';
import { CreateGroupDialog } from './CreateGroupDialog';
import { EditGroupDialog } from './EditGroupDialog';
import { GroupsTable } from './GroupsTable';
import { SectionEmpty, SectionError, SectionLoading } from './SectionState';
import { TablePagination } from './TablePagination';

interface GroupsSectionProps {
  isGeneralAdmin: boolean;
  onNotice: NoticeHandler;
}

const PAGE_SIZE = 6;

export const GroupsSection = ({
  isGeneralAdmin,
  onNotice,
}: GroupsSectionProps) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<PanelGroup | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const query = useGroups({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  return (
    <section id="groups" aria-labelledby="groups-title">
      <Card className="h-full">
        <CardHeader className="gap-3 p-4 pb-3 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pb-3">
          <CardTitle id="groups-title" className="text-base">
            Gestionar grupos de usuarios
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary text-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Crear nuevo grupo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
          <div className="relative sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Buscar grupos…"
              aria-label="Buscar grupos"
              className="pl-9"
            />
          </div>

          {query.isPending ? (
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
