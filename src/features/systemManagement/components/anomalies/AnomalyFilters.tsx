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

import {
  type AnomalyEventStatus,
  type ModuleSummary,
} from '../../types';
import { ANOMALY_STATUS_OPTIONS } from '../../utils/anomalies';

interface AnomalyFiltersProps {
  username: string;
  status: AnomalyEventStatus;
  module: string;
  modules: ModuleSummary[];
  isGeneralAdmin: boolean;
  isModuleFilterDisabled: boolean;
  onUsernameChange: (value: string) => void;
  onStatusChange: (value: AnomalyEventStatus) => void;
  onModuleChange: (value: string) => void;
  onClear: () => void;
}

export const AnomalyFilters = ({
  username,
  status,
  module,
  modules,
  isGeneralAdmin,
  isModuleFilterDisabled,
  onUsernameChange,
  onStatusChange,
  onModuleChange,
  onClear,
}: AnomalyFiltersProps) => {
  const hasFilters =
    username.length > 0 ||
    status !== 'BLOCKED' ||
    (isGeneralAdmin && module !== 'all');

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="anomaly-username">Usuario</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="anomaly-username"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="Buscar por usuario"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="anomaly-status">Estado</Label>
        <Select
          value={status}
          onValueChange={(value) =>
            onStatusChange(value as AnomalyEventStatus)
          }
        >
          <SelectTrigger id="anomaly-status" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANOMALY_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isGeneralAdmin && (
        <div className="space-y-1.5">
          <Label htmlFor="anomaly-module">Módulo</Label>
          <Select
            value={module}
            onValueChange={onModuleChange}
            disabled={isModuleFilterDisabled}
          >
            <SelectTrigger id="anomaly-module" aria-label="Filtrar por módulo">
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
        className={isGeneralAdmin ? undefined : 'xl:col-start-4'}
      >
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
        Limpiar filtros
      </Button>
    </div>
  );
};
