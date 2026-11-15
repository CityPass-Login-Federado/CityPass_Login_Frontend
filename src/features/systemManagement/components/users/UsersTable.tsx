import { LockOpen, Pencil, RotateCcw, Trash2 } from 'lucide-react';

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

import { type PanelPerson } from '../../types';
import { formatAuditDate } from '../../utils/audit';
import { getScopedMemberKey } from '../../utils/groups';
import { getModuleName } from '../../utils/modules';

interface UsersTableProps {
  people: PanelPerson[];
  groupNamesByUser: Map<string, string[]>;
  groupDataStatus: 'loading' | 'ready' | 'error';
  isGeneralAdmin: boolean;
  onEdit: (person: PanelPerson) => void;
  onUnlock: (person: PanelPerson) => void;
  onChangeStatus: (person: PanelPerson) => void;
  isUnlockPending: boolean;
}

const responsiveCellClass =
  'grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-3 px-0 py-2 sm:table-cell sm:px-4 sm:py-3';

const MobileLabel = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold text-muted-foreground sm:hidden">
    {children}
  </span>
);

export const UsersTable = ({
  people,
  groupNamesByUser,
  groupDataStatus,
  isGeneralAdmin,
  onEdit,
  onUnlock,
  onChangeStatus,
  isUnlockPending,
}: UsersTableProps) => (
  <div className="overflow-hidden rounded-lg border">
    <Table className="block sm:table">
      <TableHeader className="hidden bg-slate-950 text-white sm:table-header-group">
        <TableRow className="border-slate-950 hover:bg-slate-950">
          <TableHead className="sm:min-w-40 text-white">Nombre</TableHead>
          <TableHead className="sm:min-w-52 text-white">Email</TableHead>
          <TableHead className="sm:min-w-40 text-white">Grupo</TableHead>
          {isGeneralAdmin && (
            <TableHead className="sm:min-w-36 text-white">Módulo</TableHead>
          )}
          <TableHead className="text-white">Estado</TableHead>
          <TableHead className="text-right text-white">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="block sm:table-row-group">
        {people.map((person) => {
          const groups =
            groupNamesByUser.get(
              getScopedMemberKey(person.uid, person.module),
            ) ?? [];
          const groupLabel =
            groupDataStatus === 'loading'
              ? 'Cargando grupos…'
              : groupDataStatus === 'error'
                ? 'No disponible'
                : groups.length
                  ? groups.join(', ')
                  : 'Sin grupo';
          return (
            <TableRow
              key={`${person.module ?? 'scoped'}-${person.employeeNumber}`}
              className="block p-4 last:border-0 sm:table-row sm:p-0"
            >
              <TableCell className={responsiveCellClass}>
                <MobileLabel>Nombre</MobileLabel>
                <div>
                  <div className="font-medium">
                    {person.givenName} {person.sn}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {person.uid}
                  </div>
                </div>
              </TableCell>
              <TableCell className={responsiveCellClass}>
                <MobileLabel>Email</MobileLabel>
                <span className="min-w-0 break-all">{person.email}</span>
              </TableCell>
              <TableCell
                className={responsiveCellClass}
                title={
                  groupDataStatus === 'ready' ? groups.join(', ') : undefined
                }
              >
                <MobileLabel>Grupo</MobileLabel>
                <span className="block min-w-0 sm:max-w-48 sm:truncate">
                  {groupLabel}
                </span>
              </TableCell>
              {isGeneralAdmin && (
                <TableCell className={responsiveCellClass}>
                  <MobileLabel>Módulo</MobileLabel>
                  <span>{getModuleName(person.module)}</span>
                </TableCell>
              )}
              <TableCell className={responsiveCellClass}>
                <MobileLabel>Estado</MobileLabel>
                <div className="space-y-1">
                  {person.disabled ? (
                    <Badge variant="destructive">Deshabilitado</Badge>
                  ) : person.locked ? (
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-50 text-amber-800"
                    >
                      Bloqueado temporalmente
                    </Badge>
                  ) : (
                    <Badge variant="success">Activo</Badge>
                  )}
                  {person.locked && person.lockoutUntil && (
                    <p className="text-xs text-muted-foreground">
                      Hasta{' '}
                      <time dateTime={person.lockoutUntil}>
                        {formatAuditDate(person.lockoutUntil)}
                      </time>
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className={responsiveCellClass}>
                <MobileLabel>Acciones</MobileLabel>
                <div className="flex flex-wrap gap-2 sm:justify-end sm:gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-auto px-3 text-primary sm:h-8 sm:w-8 sm:px-0"
                    onClick={() => onEdit(person)}
                    aria-label={`Modificar a ${person.givenName} ${person.sn}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    <span className="ml-2 sm:sr-only">Modificar</span>
                  </Button>
                  {person.locked && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-auto px-3 text-amber-700 hover:bg-amber-50 hover:text-amber-800 sm:h-8 sm:w-8 sm:px-0"
                      onClick={() => onUnlock(person)}
                      disabled={isUnlockPending}
                      aria-label={`Desbloquear cuenta de ${person.givenName} ${person.sn}`}
                    >
                      <LockOpen className="h-4 w-4" aria-hidden="true" />
                      <span className="ml-2 sm:sr-only">Desbloquear</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={
                      person.disabled
                        ? 'h-9 w-auto px-3 text-emerald-700 sm:h-8 sm:w-8 sm:px-0'
                        : 'h-9 w-auto px-3 text-destructive hover:bg-destructive/10 hover:text-destructive sm:h-8 sm:w-8 sm:px-0'
                    }
                    onClick={() => onChangeStatus(person)}
                    aria-label={
                      person.disabled
                        ? `Rehabilitar a ${person.givenName} ${person.sn}`
                        : `Deshabilitar a ${person.givenName} ${person.sn}`
                    }
                  >
                    {person.disabled ? (
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="ml-2 sm:sr-only">
                      {person.disabled ? 'Rehabilitar' : 'Deshabilitar'}
                    </span>
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
