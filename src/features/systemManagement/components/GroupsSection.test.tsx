import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { GroupsSection } from './GroupsSection';

vi.mock('../hooks/useGroups', () => ({
  useGroups: () => ({ isPending: true }),
}));

vi.mock('./CreateGroupDialog', () => ({
  CreateGroupDialog: () => null,
}));

vi.mock('./EditGroupDialog', () => ({
  EditGroupDialog: () => null,
}));

vi.mock('./DeleteGroupAlertDialog', () => ({
  DeleteGroupAlertDialog: () => null,
}));

describe('GroupsSection', () => {
  test('usa el estilo primario para crear un grupo', () => {
    render(<GroupsSection onNotice={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Agregar Grupo' }),
    ).toHaveClass('bg-primary', 'text-primary-foreground');
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por módulo' }),
    ).toBeInTheDocument();
  });
});
