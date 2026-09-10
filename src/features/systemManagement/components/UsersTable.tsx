import { Pencil, RotateCcw, Trash2 } from 'lucide-react';

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

import { type PanelPerson } from '../types';
import { getModuleName } from '../utils/modules';

interface UsersTableProps {
  people: PanelPerson[];
  groupNamesByUser: Map<string, string[]>;
  groupDataStatus: 'loading' | 'ready' | 'error';
  isGeneralAdmin: boolean;
  onEdit: (person: PanelPerson) => void;
  onChangeStatus: (person: PanelPerson) => void;
}

export const UsersTable = ({
  people,
  groupNamesByUser,
  groupDataStatus,
  isGeneralAdmin,
  onEdit,
  onChangeStatus,
}: UsersTableProps) => (
  <div className="overflow-hidden rounded-lg border">
    <Table>
      <TableHeader className="bg-slate-950 text-white">
        <TableRow className="border-slate-950 hover:bg-slate-950">
          <TableHead className="min-w-40 text-white">Nombre</TableHead>
          <TableHead className="min-w-52 text-white">Email</TableHead>
          <TableHead className="min-w-40 text-white">Grupo</TableHead>
          {isGeneralAdmin && (
            <TableHead className="min-w-36 text-white">Módulo</TableHead>
          )}
          <TableHead className="text-white">Estado</TableHead>
          <TableHead className="text-right text-white">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => {
          const groups = groupNamesByUser.get(person.uid) ?? [];
          const groupLabel =
            groupDataStatus === 'loading'
              ? 'Cargando grupos…'
              : groupDataStatus === 'error'
                ? 'No disponible'
                : groups.length
                  ? groups.join(', ')
                  : 'Sin grupo';
          return (
            <TableRow key={person.employeeNumber}>
              <TableCell>
                <div className="font-medium">
                  {person.givenName} {person.sn}
                </div>
                <div className="text-xs text-muted-foreground">{person.uid}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {person.email}
              </TableCell>
              <TableCell
                title={
                  groupDataStatus === 'ready' ? groups.join(', ') : undefined
                }
              >
                <span className="block max-w-48 truncate">
                  {groupLabel}
                </span>
              </TableCell>
              {isGeneralAdmin && (
                <TableCell>{getModuleName(person.module)}</TableCell>
              )}
              <TableCell>
                <Badge variant={person.disabled ? 'destructive' : 'success'}>
                  {person.disabled ? 'Inactivo' : 'Activo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    onClick={() => onEdit(person)}
                    aria-label={`Modificar a ${person.givenName} ${person.sn}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={
                      person.disabled
                        ? 'h-8 w-8 text-emerald-700'
                        : 'h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
                    }
                    onClick={() => onChangeStatus(person)}
                    aria-label={
                      person.disabled
                        ? `Rehabilitar a ${person.givenName} ${person.sn}`
                        : `Deshabilitar a ${person.givenName} ${person.sn}`
                    }
                  >
                    {person.disabled ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);
