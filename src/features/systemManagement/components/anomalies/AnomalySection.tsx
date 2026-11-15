import { useEffect, useMemo, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  useAnomalyEvents,
  useApproveAnomalyEvent,
} from '../../hooks/useAnomalyEvents';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useModules } from '../../hooks/useModules';
import {
  type AnomalyEventStatus,
  type NoticeHandler,
  type PanelAnomalyEvent,
} from '../../types';
import { getPanelErrorMessage } from '../../utils/errors';
import { AnomalyFilters } from './AnomalyFilters';
import { AnomalyTable } from './AnomalyTable';
import {
  SectionEmpty,
  SectionError,
  SectionLoading,
} from '../shared/SectionState';
import { TablePagination } from '../shared/TablePagination';

interface AnomalySectionProps {
  isGeneralAdmin: boolean;
  onNotice: NoticeHandler;
}

const PAGE_SIZE = 20;

export const AnomalySection = ({
  isGeneralAdmin,
  onNotice,
}: AnomalySectionProps) => {
  const [page, setPage] = useState(0);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<AnomalyEventStatus>('BLOCKED');
  const [module, setModule] = useState('all');
  const [selectedEvent, setSelectedEvent] =
    useState<PanelAnomalyEvent | null>(null);
  const debouncedUsername = useDebouncedValue(username);
  const modulesQuery = useModules({ enabled: isGeneralAdmin });
  const modules = useMemo(() => modulesQuery.data ?? [], [modulesQuery.data]);
  const isModuleFilterDisabled =
    isGeneralAdmin && (modulesQuery.isPending || modules.length === 0);
  const query = useAnomalyEvents({
    page,
    size: PAGE_SIZE,
    status,
    username: debouncedUsername.trim() || undefined,
    module: isGeneralAdmin && module !== 'all' ? module : undefined,
  });
  const approvalMutation = useApproveAnomalyEvent();

  useEffect(() => {
    if (
      module !== 'all' &&
      !modulesQuery.isPending &&
      !modulesQuery.isError &&
      !modules.some((item) => item.id === module)
    ) {
      setModule('all');
      setPage(0);
    }
  }, [module, modules, modulesQuery.isError, modulesQuery.isPending]);

  const handleFilterChange = (callback: () => void) => {
    callback();
    setPage(0);
  };

  const clearFilters = () => {
    setUsername('');
    setStatus('BLOCKED');
    setModule('all');
    setPage(0);
  };

  const handleApprove = () => {
    if (!selectedEvent) return;

    approvalMutation.mutate(
      { eventId: selectedEvent.id },
      {
        onSuccess: () => {
          onNotice(
            'success',
            `Evento de ${selectedEvent.username} aprobado. El próximo intento válido podrá continuar.`,
          );
          setSelectedEvent(null);
        },
        onError: (error) => {
          onNotice(
            'error',
            getPanelErrorMessage(error, 'No se pudo aprobar el evento.'),
          );
        },
      },
    );
  };

  return (
    <section id="anomalies" aria-labelledby="anomalies-title">
      <Card>
        <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
          <CardTitle id="anomalies-title" className="text-lg">
            Eventos bloqueados
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Revisá los accesos detenidos por el detector de anomalías y habilitá
            un único reintento cuando corresponda.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
          <AnomalyFilters
            username={username}
            status={status}
            module={module}
            modules={modules}
            isGeneralAdmin={isGeneralAdmin}
            isModuleFilterDisabled={isModuleFilterDisabled}
            onUsernameChange={(value) =>
              handleFilterChange(() => setUsername(value))
            }
            onStatusChange={(value) =>
              handleFilterChange(() => setStatus(value))
            }
            onModuleChange={(value) =>
              handleFilterChange(() => setModule(value))
            }
            onClear={clearFilters}
          />

          {isGeneralAdmin && modulesQuery.isError && modules.length === 0 && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              No se pudieron cargar los módulos. El listado completo continúa
              disponible, pero el filtro por módulo está deshabilitado.
            </p>
          )}

          {query.isPending || query.isPlaceholderData ? (
            <SectionLoading />
          ) : query.isError ? (
            <SectionError
              message={getPanelErrorMessage(
                query.error,
                'No se pudieron cargar los eventos de anomalía.',
              )}
            />
          ) : query.data.content.length === 0 ? (
            <SectionEmpty message="No hay eventos para los filtros seleccionados." />
          ) : (
            <>
              <AnomalyTable
                events={query.data.content}
                isApprovalPending={approvalMutation.isPending}
                onApprove={setSelectedEvent}
              />
              <TablePagination
                currentPage={query.data.currentPage}
                totalPages={query.data.totalPages}
                totalElements={query.data.totalElements}
                pageSize={query.data.size}
                itemLabel="eventos"
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={selectedEvent !== null}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar este acceso?</AlertDialogTitle>
            <AlertDialogDescription>
              Se habilitará un único reintento para {selectedEvent?.username},
              limitado al mismo cliente, dirección IP y agente de usuario. La
              autorización vencerá automáticamente si no se utiliza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approvalMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={approvalMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleApprove();
              }}
            >
              {approvalMutation.isPending ? 'Aprobando…' : 'Aprobar acceso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
