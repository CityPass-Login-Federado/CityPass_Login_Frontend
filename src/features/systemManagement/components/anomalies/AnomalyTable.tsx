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
  <div className="overflow-x-auto rounded-lg border">
    <Table className="min-w-[1120px]">
      <TableHeader className="bg-slate-950 text-white">
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
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="whitespace-nowrap">
              <time dateTime={event.blockedAt}>
                {formatAuditDate(event.blockedAt)}
              </time>
            </TableCell>
            <TableCell>
              <span className="block font-medium">{event.username}</span>
              <span className="block text-xs text-muted-foreground">
                {event.userSub}
              </span>
            </TableCell>
            <TableCell>{getModuleName(event.module)}</TableCell>
            <TableCell>
              <span className="font-semibold text-destructive">
                {formatRiskScore(event.riskScore)}
              </span>
            </TableCell>
            <TableCell title={event.reasons.join(', ')}>
              <span className="block max-w-64 truncate">
                {event.reasons.length > 0 ? event.reasons.join(', ') : '—'}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(event.status)}>
                {getAnomalyStatusLabel(event.status)}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="block">IP: {event.ipAddress || 'No disponible'}</span>
              <span
                className="block max-w-64 truncate text-xs text-muted-foreground"
                title={event.userAgent ?? undefined}
              >
                {event.clientId} · {event.userAgent || 'Agente no disponible'}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
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
