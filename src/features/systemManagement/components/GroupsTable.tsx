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

import { type PanelGroup } from '../types';
import { getModuleName } from '../utils/modules';

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
          <TableHead className="min-w-44 text-white">Nombre del grupo</TableHead>
          <TableHead className="min-w-28 text-white">Miembros</TableHead>
          <TableHead className="min-w-28 text-white">Tipo</TableHead>
          {isGeneralAdmin && (
            <TableHead className="min-w-36 text-white">Módulo</TableHead>
          )}
          <TableHead className="text-right text-white">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={`${group.module ?? 'scoped'}-${group.name}`}>
            <TableCell className="font-medium">{group.name}</TableCell>
            <TableCell>{group.members.length} miembros</TableCell>
            <TableCell>
              <Badge variant={group.reserved ? 'secondary' : 'outline'}>
                {group.reserved ? 'Reservado' : 'Colaborativo'}
              </Badge>
            </TableCell>
            {isGeneralAdmin && (
              <TableCell>{getModuleName(group.module)}</TableCell>
            )}
            <TableCell className="text-right">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => onEdit(group)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
