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

describe('GroupsSection', () => {
  test('usa el estilo primario para crear un grupo', () => {
    render(<GroupsSection isGeneralAdmin onNotice={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Crear nuevo grupo' }),
    ).toHaveClass('bg-primary', 'text-primary-foreground');
  });
});
