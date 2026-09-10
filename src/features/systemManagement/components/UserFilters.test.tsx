import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { type PanelGroup } from '../types';
import { getUniqueGroupNames } from '../utils/groups';
import { UserFilters } from './UserFilters';

const groups: PanelGroup[] = [
  { name: 'soporte-n2', members: [], reserved: false, module: 'reclamos' },
  { name: 'soporte-n2', members: [], reserved: false, module: 'estacionamiento' },
];

const renderFilters = (isGroupFilterDisabled = false) =>
  render(
    <UserFilters
      search=""
      group="all"
      status="all"
      module="all"
      groups={groups}
      isGroupFilterDisabled={isGroupFilterDisabled}
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
});
