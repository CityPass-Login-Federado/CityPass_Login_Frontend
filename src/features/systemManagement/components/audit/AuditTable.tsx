import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { type PanelAuditEntry } from '../../types';
import { formatAuditDate, getAuditActionLabel } from '../../utils/audit';
import { getModuleName } from '../../utils/modules';

interface AuditTableProps {
  entries: PanelAuditEntry[];
}

const responsiveCellClass =
  'grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-3 px-0 py-2 sm:table-cell sm:px-4 sm:py-3';

const MobileLabel = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold text-muted-foreground sm:hidden">
    {children}
  </span>
);

export const AuditTable = ({ entries }: AuditTableProps) => (
  <div className="overflow-hidden rounded-lg border">
    <Table className="block sm:table sm:min-w-[980px]">
      <TableHeader className="hidden bg-slate-950 text-white sm:table-header-group">
        <TableRow className="border-slate-950 hover:bg-slate-950">
          <TableHead className="min-w-40 text-white">Fecha</TableHead>
          <TableHead className="min-w-40 text-white">Administrador</TableHead>
          <TableHead className="min-w-36 text-white">Módulo</TableHead>
          <TableHead className="min-w-44 text-white">Acción</TableHead>
          <TableHead className="min-w-52 text-white">Recurso</TableHead>
          <TableHead className="min-w-52 text-white">Detalle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="block sm:table-row-group">
        {entries.map((entry) => (
          <TableRow
            key={entry.id}
            className="block p-4 last:border-0 sm:table-row sm:p-0"
          >
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Fecha</MobileLabel>
              <time className="whitespace-nowrap" dateTime={entry.occurredAt}>
                {formatAuditDate(entry.occurredAt)}
              </time>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Administrador</MobileLabel>
              <span>
                <span className="block font-medium">{entry.actorUid}</span>
                <span className="block text-xs text-muted-foreground">
                  {entry.actorSub}
                </span>
              </span>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Módulo</MobileLabel>
              <span>{getModuleName(entry.module)}</span>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Acción</MobileLabel>
              <Badge variant="secondary" title={entry.action}>
                {getAuditActionLabel(entry.action)}
              </Badge>
            </TableCell>
            <TableCell className={responsiveCellClass} title={entry.target}>
              <MobileLabel>Recurso</MobileLabel>
              <span className="min-w-0 break-words sm:block sm:max-w-64 sm:truncate">
                {entry.target}
              </span>
            </TableCell>
            <TableCell
              className={responsiveCellClass}
              title={entry.detail ?? undefined}
            >
              <MobileLabel>Detalle</MobileLabel>
              <span className="min-w-0 break-words sm:block sm:max-w-72 sm:truncate">
                {entry.detail || '—'}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
