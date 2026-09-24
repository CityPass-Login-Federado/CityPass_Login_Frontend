import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { type PanelGroup } from '../../types';
import { getUniqueGroupNames } from '../../utils/groups';
import { UserFilters } from './UserFilters';

const groups: PanelGroup[] = [
  { name: 'soporte-n2', members: [], reserved: false, module: 'reclamos' },
  { name: 'soporte-n2', members: [], reserved: false, module: 'estacionamiento' },
];
const modules = [
  { id: 'reclamos', name: 'Reclamos' },
  { id: 'eda', name: 'EDA' },
];

const renderFilters = (
  isGroupFilterDisabled = false,
  selectedModule = 'all',
) =>
  render(
    <UserFilters
      search=""
      group="all"
      status="all"
      module={selectedModule}
      modules={modules}
      groups={groups}
      isGroupFilterDisabled={isGroupFilterDisabled}
      isModuleFilterDisabled={false}
      isGeneralAdmin
      onSearchChange={vi.fn()}
      onGroupChange={vi.fn()}
      onStatusChange={vi.fn()}
      onModuleChange={vi.fn()}
      onAddUser={vi.fn()}
    />,
  );

describe('UserFilters', () => {
  test('deshabilita el filtro de grupos cuando sus datos no están disponibles', () => {
    renderFilters(true);

    expect(
      screen.getByRole('combobox', { name: 'Filtrar por grupo' }),
    ).toBeDisabled();
  });

  test('deduplica nombres de grupo repetidos entre módulos', () => {
    expect(getUniqueGroupNames(groups)).toEqual(['soporte-n2']);
  });

  test('muestra los módulos informados por el backend, incluido EDA', () => {
    renderFilters(false, 'eda');

    expect(
      screen.getByRole('combobox', { name: 'Filtrar por módulo' }),
    ).toHaveTextContent('EDA');
  });
});
