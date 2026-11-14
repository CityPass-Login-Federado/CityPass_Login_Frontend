import { RotateCcw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { type ModuleSummary } from '../../types';
import { AUDIT_ACTION_OPTIONS } from '../../utils/audit';

interface AuditFiltersProps {
  actor: string;
  action: string;
  fromDate: string;
  toDate: string;
  module: string;
  modules: ModuleSummary[];
  isGeneralAdmin: boolean;
  isModuleFilterDisabled: boolean;
  onActorChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onClear: () => void;
}

export const AuditFilters = ({
  actor,
  action,
  fromDate,
  toDate,
  module,
  modules,
  isGeneralAdmin,
  isModuleFilterDisabled,
  onActorChange,
  onActionChange,
  onFromDateChange,
  onToDateChange,
  onModuleChange,
  onClear,
}: AuditFiltersProps) => {
  const hasFilters =
    actor.length > 0 ||
    action !== 'all' ||
    fromDate.length > 0 ||
    toDate.length > 0 ||
    (isGeneralAdmin && module !== 'all');

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 xl:items-end">
      <div className="space-y-1.5 md:col-span-2 xl:col-span-1">
        <Label htmlFor="audit-actor">Administrador</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="audit-actor"
            value={actor}
            onChange={(event) => onActorChange(event.target.value)}
            placeholder="Usuario o identificador"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="audit-action">Acción</Label>
        <Select value={action} onValueChange={onActionChange}>
          <SelectTrigger id="audit-action" aria-label="Filtrar por acción">
            <SelectValue placeholder="Todas las acciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            {AUDIT_ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="audit-from">Desde</Label>
        <Input
          id="audit-from"
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(event) => onFromDateChange(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="audit-to">Hasta</Label>
        <Input
          id="audit-to"
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(event) => onToDateChange(event.target.value)}
        />
      </div>

      {isGeneralAdmin && (
        <div className="space-y-1.5">
          <Label htmlFor="audit-module">Módulo</Label>
          <Select
            value={module}
            onValueChange={onModuleChange}
            disabled={isModuleFilterDisabled}
          >
            <SelectTrigger id="audit-module" aria-label="Filtrar por módulo">
              <SelectValue placeholder="Todos los módulos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los módulos</SelectItem>
              {modules.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        disabled={!hasFilters}
        className={isGeneralAdmin ? undefined : 'xl:col-start-6'}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Limpiar filtros
      </Button>
    </div>
  );
};
