import { ShieldCheck } from 'lucide-react';

import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { type PanelAnomalyEvent } from '../../types';
import {
  formatRiskScore,
  getAnomalyStatusLabel,
} from '../../utils/anomalies';
import { formatAuditDate } from '../../utils/audit';
import { getModuleName } from '../../utils/modules';

interface AnomalyTableProps {
  events: PanelAnomalyEvent[];
  isApprovalPending: boolean;
  onApprove: (event: PanelAnomalyEvent) => void;
}

const responsiveCellClass =
  'grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-3 px-0 py-2 sm:table-cell sm:px-4 sm:py-3';

const MobileLabel = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold text-muted-foreground sm:hidden">
    {children}
  </span>
);

const getStatusVariant = (
  status: PanelAnomalyEvent['status'],
): BadgeProps['variant'] => {
  if (status === 'BLOCKED') return 'destructive';
  if (status === 'APPROVED') return 'success';
  return 'secondary';
};

export const AnomalyTable = ({
  events,
  isApprovalPending,
  onApprove,
}: AnomalyTableProps) => (
  <div className="overflow-hidden rounded-lg border">
    <Table className="block sm:table sm:min-w-[1120px]">
      <TableHeader className="hidden bg-slate-950 text-white sm:table-header-group">
        <TableRow className="border-slate-950 hover:bg-slate-950">
          <TableHead className="min-w-40 text-white">Fecha</TableHead>
          <TableHead className="min-w-40 text-white">Usuario</TableHead>
          <TableHead className="min-w-36 text-white">Módulo</TableHead>
          <TableHead className="min-w-24 text-white">Riesgo</TableHead>
          <TableHead className="min-w-52 text-white">Motivos</TableHead>
          <TableHead className="min-w-32 text-white">Estado</TableHead>
          <TableHead className="min-w-52 text-white">Contexto</TableHead>
          <TableHead className="text-right text-white">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="block sm:table-row-group">
        {events.map((event) => (
          <TableRow
            key={event.id}
            className="block p-4 last:border-0 sm:table-row sm:p-0"
          >
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Fecha</MobileLabel>
              <time className="whitespace-nowrap" dateTime={event.blockedAt}>
                {formatAuditDate(event.blockedAt)}
              </time>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Usuario</MobileLabel>
              <span>
                <span className="block font-medium">{event.username}</span>
                <span className="block text-xs text-muted-foreground">
                  {event.userSub}
                </span>
              </span>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Módulo</MobileLabel>
              <span>{getModuleName(event.module)}</span>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Riesgo</MobileLabel>
              <span className="font-semibold text-destructive">
                {formatRiskScore(event.riskScore)}
              </span>
            </TableCell>
            <TableCell
              className={responsiveCellClass}
              title={event.reasons.join(', ')}
            >
              <MobileLabel>Motivos</MobileLabel>
              <span className="min-w-0 break-words sm:block sm:max-w-64 sm:truncate">
                {event.reasons.length > 0 ? event.reasons.join(', ') : '—'}
              </span>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Estado</MobileLabel>
              <Badge variant={getStatusVariant(event.status)}>
                {getAnomalyStatusLabel(event.status)}
              </Badge>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Contexto</MobileLabel>
              <span className="min-w-0">
                <span className="block break-all">
                  IP: {event.ipAddress || 'No disponible'}
                </span>
                <span
                  className="block break-words text-xs text-muted-foreground sm:max-w-64 sm:truncate"
                  title={event.userAgent ?? undefined}
                >
                  {event.clientId} · {event.userAgent || 'Agente no disponible'}
                </span>
              </span>
            </TableCell>
            <TableCell className={responsiveCellClass}>
              <MobileLabel>Acciones</MobileLabel>
              <div className="flex sm:justify-end">
                {event.status === 'BLOCKED' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(event)}
                    disabled={isApprovalPending}
                    aria-label={`Aprobar evento de ${event.username}`}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                    Aprobar
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin acciones</span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
