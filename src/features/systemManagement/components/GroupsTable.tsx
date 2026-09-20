import { Pencil, Trash2 } from 'lucide-react';

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
import { getGroupDisplayName } from '../utils/groups';

interface GroupsTableProps {
  groups: PanelGroup[];
  onEdit: (group: PanelGroup) => void;
  onDelete: (group: PanelGroup) => void;
}

export const GroupsTable = ({
  groups,
  onEdit,
  onDelete,
}: GroupsTableProps) => (
  <div className="overflow-hidden rounded-lg border">
    <Table>
      <TableHeader className="bg-slate-950 text-white">
        <TableRow className="border-slate-950 hover:bg-slate-950">
          <TableHead className="min-w-40 text-white">Número de Grupo</TableHead>
          <TableHead className="min-w-44 text-white">Nombre</TableHead>
          <TableHead className="min-w-40 text-white">
            Cantidad de Usuarios
          </TableHead>
          <TableHead className="min-w-28 text-white">Estado</TableHead>
          <TableHead className="text-right text-white">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={`${group.module ?? 'scoped'}-${group.name}`}>
            <TableCell className="font-medium">
              {group.groupNumber ?? group.name}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {getGroupDisplayName(group)}
            </TableCell>
            <TableCell>{group.members.length}</TableCell>
            <TableCell>
              <Badge variant={group.disabled ? 'destructive' : 'success'}>
                {group.disabled ? 'Inactivo' : 'Activo'}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(group)}
                  aria-label={`Eliminar ${group.name}`}
                  title="Eliminar grupo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
