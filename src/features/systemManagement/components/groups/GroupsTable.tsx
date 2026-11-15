import { Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { type PanelGroup } from '../../types';
import { getGroupDisplayName } from '../../utils/groups';
import { getModuleName } from '../../utils/modules';

interface GroupsTableProps {
  groups: PanelGroup[];
  isGeneralAdmin: boolean;
  onEdit: (group: PanelGroup) => void;
}

const responsiveCellClass =
  'grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-3 px-0 py-2 sm:table-cell sm:px-4 sm:py-3';

const MobileLabel = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold text-muted-foreground sm:hidden">
    {children}
  </span>
);

export const GroupsTable = ({
  groups,
  isGeneralAdmin,
  onEdit,
}: GroupsTableProps) => (
  <div className="overflow-hidden rounded-lg border">
    <Table className="block sm:table">
      <TableHeader className="hidden bg-slate-950 text-white sm:table-header-group">
        <TableRow className="border-slate-950 hover:bg-slate-950">
          <TableHead className="sm:min-w-44 text-white">Nombre</TableHead>
          <TableHead className="sm:min-w-40 text-white">Cantidad de Usuarios</TableHead>
          {isGeneralAdmin && (
            <TableHead className="sm:min-w-36 text-white">Módulo</TableHead>
          )}
          <TableHead className="sm:min-w-28 text-white">Reservado</TableHead>
          <TableHead className="text-right text-white">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="block sm:table-row-group">
        {groups.map((group) => (
          <TableRow
            key={`${group.module ?? 'scoped'}-${group.name}`}
            className="block p-4 last:border-0 sm:table-row sm:p-0"
          >
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Nombre</MobileLabel>
              <span>{getGroupDisplayName(group)}</span>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Usuarios</MobileLabel>
              <span>{group.members.length}</span>
            </TableCell>
            {isGeneralAdmin && (
              <TableCell className={responsiveCellClass}>
                <MobileLabel>Módulo</MobileLabel>
                <span>{getModuleName(group.module)}</span>
              </TableCell>
            )}
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Estado</MobileLabel>
              <Badge variant={group.reserved ? 'secondary' : 'default'}>
                {group.reserved ? 'Reservado' : 'Disponible'}
              </Badge>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Acciones</MobileLabel>
              <div className="flex sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-auto px-3 text-primary hover:bg-primary/10 hover:text-primary sm:h-8 sm:w-8 sm:px-0"
                  onClick={() => onEdit(group)}
                  aria-label={`Modificar ${group.name}`}
                  title="Modificar grupo"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  <span className="ml-2 sm:sr-only">Modificar</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
