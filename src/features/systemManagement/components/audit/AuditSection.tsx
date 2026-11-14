import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuditEntries } from '../../hooks/useAudit';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useModules } from '../../hooks/useModules';
import { getPanelErrorMessage } from '../../utils/errors';
import { toLocalDayBoundaryIso } from '../../utils/audit';
import { AuditFilters } from './AuditFilters';
import { AuditTable } from './AuditTable';
import {
  SectionEmpty,
  SectionError,
  SectionLoading,
} from '../shared/SectionState';
import { TablePagination } from '../shared/TablePagination';

interface AuditSectionProps {
  isGeneralAdmin: boolean;
}

const PAGE_SIZE = 10;

export const AuditSection = ({ isGeneralAdmin }: AuditSectionProps) => {
  const [page, setPage] = useState(0);
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [module, setModule] = useState('all');
  const debouncedActor = useDebouncedValue(actor);
  const modulesQuery = useModules({ enabled: isGeneralAdmin });
  const modules = useMemo(() => modulesQuery.data ?? [], [modulesQuery.data]);
  const isModuleFilterDisabled =
    isGeneralAdmin && (modulesQuery.isPending || modules.length === 0);
  const hasInvalidDateRange = Boolean(
    fromDate && toDate && fromDate > toDate,
  );

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

  const query = useAuditEntries(
    {
      page,
      size: PAGE_SIZE,
      actor: debouncedActor.trim() || undefined,
      action: action === 'all' ? undefined : action,
      from: fromDate
        ? toLocalDayBoundaryIso(fromDate, 'start')
        : undefined,
      to: toDate ? toLocalDayBoundaryIso(toDate, 'end') : undefined,
      module:
        isGeneralAdmin && module !== 'all' ? module : undefined,
    },
    { enabled: !hasInvalidDateRange },
  );

  const handleFilterChange = (callback: () => void) => {
    callback();
    setPage(0);
  };

  const clearFilters = () => {
    setActor('');
    setAction('all');
    setFromDate('');
    setToDate('');
    setModule('all');
    setPage(0);
  };

  return (
    <section id="audit" aria-labelledby="audit-title">
      <Card>
        <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
          <CardTitle id="audit-title" className="text-lg">
            Auditoría
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Consultá quién realizó cada cambio administrativo y cuándo ocurrió.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
          <AuditFilters
            actor={actor}
            action={action}
            fromDate={fromDate}
            toDate={toDate}
            module={module}
            modules={modules}
            isGeneralAdmin={isGeneralAdmin}
            isModuleFilterDisabled={isModuleFilterDisabled}
            onActorChange={(value) =>
              handleFilterChange(() => setActor(value))
            }
            onActionChange={(value) =>
              handleFilterChange(() => setAction(value))
            }
            onFromDateChange={(value) =>
              handleFilterChange(() => setFromDate(value))
            }
            onToDateChange={(value) =>
              handleFilterChange(() => setToDate(value))
            }
            onModuleChange={(value) =>
              handleFilterChange(() => setModule(value))
            }
            onClear={clearFilters}
          />

          {hasInvalidDateRange && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              La fecha desde no puede ser posterior a la fecha hasta.
            </p>
          )}

          {isGeneralAdmin && modulesQuery.isError && modules.length === 0 && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              No se pudieron cargar los módulos. La auditoría completa continúa
              disponible, pero el filtro por módulo está deshabilitado.
            </p>
          )}

          {!hasInvalidDateRange &&
            (query.isPending || query.isPlaceholderData ? (
              <SectionLoading />
            ) : query.isError ? (
              <SectionError
                message={getPanelErrorMessage(
                  query.error,
                  'No se pudo cargar el historial de auditoría.',
                )}
              />
            ) : query.data.content.length === 0 ? (
              <SectionEmpty message="No hay eventos para los filtros seleccionados." />
            ) : (
              <>
                <AuditTable entries={query.data.content} />
                <TablePagination
                  currentPage={query.data.currentPage}
                  totalPages={query.data.totalPages}
                  totalElements={query.data.totalElements}
                  pageSize={query.data.size}
                  itemLabel="eventos"
                  onPageChange={setPage}
                />
              </>
            ))}
        </CardContent>
      </Card>
    </section>
  );
};
