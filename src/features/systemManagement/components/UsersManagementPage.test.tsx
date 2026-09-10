import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { UsersManagementPage } from './UsersManagementPage';

vi.mock('./UsersSection', () => ({
  UsersSection: ({ isGeneralAdmin }: { isGeneralAdmin: boolean }) => (
    <div>{isGeneralAdmin ? 'Listado general' : 'Listado delegado'}</div>
  ),
}));

describe('UsersManagementPage', () => {
  test('presenta la vista exclusiva y el alcance general', () => {
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
      <MemoryRouter initialEntries={['/panel/users']}>
        <UsersManagementPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Panel de Gestión de Usuarios' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Listado general')).toBeInTheDocument();
    expect(screen.queryByText('ABM y asignación de grupos')).not.toBeInTheDocument();
  });
});
