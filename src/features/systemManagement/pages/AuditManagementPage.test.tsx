import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { AuditManagementPage } from './AuditManagementPage';

vi.mock('../components/audit/AuditSection', () => ({
  AuditSection: ({ isGeneralAdmin }: { isGeneralAdmin: boolean }) => (
    <div>{isGeneralAdmin ? 'Auditoría general' : 'Auditoría de módulo'}</div>
  ),
}));

vi.mock('@/features/auth/layout/UserMenu', () => ({
  UserMenu: () => null,
}));

describe('AuditManagementPage', () => {
  test('presenta la auditoría en una página exclusiva con alcance general', () => {
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
      <MemoryRouter initialEntries={['/panel/audit']}>
        <AuditManagementPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Panel de Auditoría' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Auditoría general')).toBeInTheDocument();
    expect(screen.queryByText('Listado de usuarios')).not.toBeInTheDocument();
  });
});
