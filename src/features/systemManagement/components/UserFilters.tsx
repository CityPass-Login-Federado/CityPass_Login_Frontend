import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { type PanelGroup, type PersonStatusFilter } from '../types';
import { getUniqueGroupNames } from '../utils/groups';
import { CITYPASS_MODULES } from '../utils/modules';

interface UserFiltersProps {
  search: string;
  group: string;
  status: PersonStatusFilter;
  module: string;
  groups: PanelGroup[];
  isGroupFilterDisabled: boolean;
  isGeneralAdmin: boolean;
  onSearchChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onStatusChange: (value: PersonStatusFilter) => void;
  onModuleChange: (value: string) => void;
  onAddUser: () => void;
}

export const UserFilters = ({
  search,
  group,
  status,
  module,
  groups,
  isGroupFilterDisabled,
  isGeneralAdmin,
  onSearchChange,
  onGroupChange,
  onStatusChange,
  onModuleChange,
  onAddUser,
}: UserFiltersProps) => {
  const groupNames = getUniqueGroupNames(groups);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 lg:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar usuarios…"
          aria-label="Buscar usuarios"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Select
          value={group}
          onValueChange={onGroupChange}
          disabled={isGroupFilterDisabled}
        >
          <SelectTrigger className="sm:w-44" aria-label="Filtrar por grupo">
            <SelectValue placeholder="Grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grupos</SelectItem>
            {groupNames.map((groupName) => (
              <SelectItem key={groupName} value={groupName}>
                {groupName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as PersonStatusFilter)}
        >
          <SelectTrigger className="sm:w-36" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {isGeneralAdmin && (
          <Select value={module} onValueChange={onModuleChange}>
            <SelectTrigger
              className="col-span-2 sm:w-48"
              aria-label="Filtrar por módulo"
            >
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
      </div>

      <Button type="button" className="lg:ml-auto" onClick={onAddUser}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar usuario
      </Button>
    </div>
  );
};
