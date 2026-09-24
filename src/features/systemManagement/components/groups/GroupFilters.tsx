import { Boxes, Plus, Search, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { type GroupReservationFilter } from '../../types';
import { CITYPASS_MODULES } from '../../utils/modules';

interface GroupFiltersProps {
  search: string;
  reservation: GroupReservationFilter;
  module: string;
  isGeneralAdmin: boolean;
  onSearchChange: (value: string) => void;
  onReservationChange: (value: GroupReservationFilter) => void;
  onModuleChange: (value: string) => void;
  onAddGroup: () => void;
}

export const GroupFilters = ({
  search,
  reservation,
  module,
  isGeneralAdmin,
  onSearchChange,
  onReservationChange,
  onModuleChange,
  onAddGroup,
}: GroupFiltersProps) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
    <div className="relative w-full lg:min-w-44 lg:flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar grupos..."
        aria-label="Buscar grupos"
        className="h-9 pl-9"
      />
    </div>

    <Select
      value={reservation}
      onValueChange={(value) =>
        onReservationChange(value as GroupReservationFilter)
      }
    >
      <SelectTrigger
        className="h-9 w-full lg:w-[170px] lg:shrink-0"
        aria-label="Filtrar por reserva"
      >
        <ShieldCheck className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Tipo de grupo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        <SelectItem value="reserved">Reservados</SelectItem>
        <SelectItem value="available">Disponibles</SelectItem>
      </SelectContent>
    </Select>

    {isGeneralAdmin && (
      <Select value={module} onValueChange={onModuleChange}>
        <SelectTrigger
          className="h-9 w-full lg:w-[190px] lg:shrink-0"
          aria-label="Filtrar por módulo"
        >
          <Boxes className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Módulo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los módulos</SelectItem>
          {CITYPASS_MODULES.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}

    <Button
      type="button"
      size="sm"
      className="w-full shrink-0 lg:ml-auto lg:w-auto"
      onClick={onAddGroup}
    >
      <Plus className="mr-1.5 h-4 w-4" />
      Agregar Grupo
    </Button>
  </div>
);
