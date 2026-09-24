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

export const GroupsTable = ({
  groups,
  isGeneralAdmin,
  onEdit,
}: GroupsTableProps) => (
  <div className="overflow-hidden rounded-lg border">
    <Table>
      <TableHeader className="bg-slate-950 text-white">
        <TableRow className="border-slate-950 hover:bg-slate-950">
          <TableHead className="min-w-44 text-white">Nombre</TableHead>
          <TableHead className="min-w-40 text-white">Cantidad de Usuarios</TableHead>
          {isGeneralAdmin && (
            <TableHead className="min-w-36 text-white">Módulo</TableHead>
          )}
          <TableHead className="min-w-28 text-white">Reservado</TableHead>
          <TableHead className="text-right text-white">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={`${group.module ?? 'scoped'}-${group.name}`}>
            <TableCell>
              {getGroupDisplayName(group)}
            </TableCell>
            <TableCell>{group.members.length}</TableCell>
            {isGeneralAdmin && (
              <TableCell>{getModuleName(group.module)}</TableCell>
            )}
            <TableCell>
              <Badge variant={group.reserved ? 'secondary' : 'default'}>
                {group.reserved ? 'Reservado' : 'Disponible'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={() => onEdit(group)}
                  aria-label={`Modificar ${group.name}`}
                  title="Modificar grupo"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
