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

export const AuditTable = ({ entries }: AuditTableProps) => (
  <div className="overflow-x-auto rounded-lg border">
    <Table className="min-w-[980px]">
      <TableHeader className="bg-slate-950 text-white">
        <TableRow className="border-slate-950 hover:bg-slate-950">
          <TableHead className="min-w-40 text-white">Fecha</TableHead>
          <TableHead className="min-w-40 text-white">Administrador</TableHead>
          <TableHead className="min-w-36 text-white">Módulo</TableHead>
          <TableHead className="min-w-44 text-white">Acción</TableHead>
          <TableHead className="min-w-52 text-white">Recurso</TableHead>
          <TableHead className="min-w-52 text-white">Detalle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="whitespace-nowrap">
              <time dateTime={entry.occurredAt}>
                {formatAuditDate(entry.occurredAt)}
              </time>
            </TableCell>
            <TableCell>
              <span className="block font-medium">{entry.actorUid}</span>
              <span className="block text-xs text-muted-foreground">
                {entry.actorSub}
              </span>
            </TableCell>
            <TableCell>{getModuleName(entry.module)}</TableCell>
            <TableCell>
              <Badge variant="secondary" title={entry.action}>
                {getAuditActionLabel(entry.action)}
              </Badge>
            </TableCell>
            <TableCell title={entry.target}>
              <span className="block max-w-64 truncate">{entry.target}</span>
            </TableCell>
            <TableCell title={entry.detail ?? undefined}>
              <span className="block max-w-72 truncate">
                {entry.detail || '—'}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
