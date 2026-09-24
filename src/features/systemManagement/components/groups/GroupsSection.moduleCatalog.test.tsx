import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { GroupsSection } from './GroupsSection';

const mocks = vi.hoisted(() => ({
  useGroups: vi.fn(),
  useModules: vi.fn(),
}));

vi.mock('../../hooks/useGroups', () => ({
  useGroups: mocks.useGroups,
}));

vi.mock('../../hooks/useModules', () => ({
  useModules: mocks.useModules,
}));

vi.mock('./GroupFilters', () => ({
  GroupFilters: ({
    module,
    onModuleChange,
  }: {
    module: string;
    onModuleChange: (value: string) => void;
  }) => (
    <div>
      <span data-testid="selected-group-module">{module}</span>
      <button type="button" onClick={() => onModuleChange('eda')}>
        Seleccionar EDA
      </button>
    </div>
  ),
}));

vi.mock('./CreateGroupDialog', () => ({
  CreateGroupDialog: () => null,
}));

vi.mock('./EditGroupDialog', () => ({
  EditGroupDialog: () => null,
}));

describe('GroupsSection module catalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useGroups.mockReturnValue({
      isPending: true,
      isError: false,
      isPlaceholderData: false,
    });
  });

  test('descarta el módulo seleccionado cuando deja de existir', async () => {
    let modules = [
      { id: 'reclamos', name: 'Reclamos' },
      { id: 'eda', name: 'EDA' },
    ];
    mocks.useModules.mockImplementation(() => ({
      data: modules,
      isError: false,
      isPending: false,
    }));
    const { rerender } = render(
      <GroupsSection isGeneralAdmin onNotice={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar EDA' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-group-module')).toHaveTextContent(
        'eda',
      );
      expect(mocks.useGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({ module: 'eda' }),
      );
    });

    modules = [{ id: 'reclamos', name: 'Reclamos' }];
    rerender(<GroupsSection isGeneralAdmin onNotice={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('selected-group-module')).toHaveTextContent(
        'all',
      );
      expect(mocks.useGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({ module: undefined }),
      );
    });
  });
});
