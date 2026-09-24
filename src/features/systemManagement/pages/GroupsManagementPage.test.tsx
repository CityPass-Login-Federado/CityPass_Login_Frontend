import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { GroupsManagementPage } from './GroupsManagementPage';

vi.mock('../components/groups/GroupsSection', () => ({
  GroupsSection: () => <div>Listado exclusivo de grupos</div>,
}));

vi.mock('../components/groups/AssignUserToGroupCard', () => ({
  AssignUserToGroupCard: () => <div>Asignación de usuario</div>,
}));

vi.mock('@/features/auth/layout/UserMenu', () => ({
  UserMenu: () => null,
}));

describe('GroupsManagementPage', () => {
  test('presenta únicamente la gestión de grupos y su asignación', () => {
    useAuthStore.setState({
      session: {
        userId: 'admin',
        username: 'admin',
        groups: [],
        roles: [],
        adminScope: 'GENERAL',
        expiresAt: Date.now() + 60_000,
      },
      isHydrated: true,
    });

    render(
      <MemoryRouter initialEntries={['/panel/groups']}>
        <GroupsManagementPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Panel de Gestión de Grupos' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Listado exclusivo de grupos')).toBeInTheDocument();
    expect(screen.getByText('Asignación de usuario')).toBeInTheDocument();
    expect(screen.queryByText('Listado de usuarios')).not.toBeInTheDocument();
  });
});
