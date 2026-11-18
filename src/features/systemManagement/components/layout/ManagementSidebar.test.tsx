import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { ManagementSidebar } from './ManagementSidebar';

describe('ManagementSidebar', () => {
  test('navega al panel de usuarios y mantiene su opción activa', () => {
    render(
      <MemoryRouter initialEntries={['/panel/users']}>
        <ManagementSidebar />
      </MemoryRouter>,
    );

    const userLinks = screen.getAllByRole('link', {
      name: 'ABM de Usuarios',
    });

    expect(userLinks).toHaveLength(2);
    expect(userLinks[0]).toHaveAttribute('href', '/panel/users');
    expect(userLinks[0]).toHaveAttribute('aria-current', 'page');
  });

  test('navega a la vista exclusiva de grupos', () => {
    render(
      <MemoryRouter initialEntries={['/panel/groups']}>
        <ManagementSidebar />
      </MemoryRouter>,
    );

    const groupLinks = screen.getAllByRole('link', { name: 'ABM de Grupos' });
    expect(groupLinks).toHaveLength(2);
    expect(groupLinks[0]).toHaveAttribute('href', '/panel/groups');
    expect(groupLinks[0]).toHaveAttribute('aria-current', 'page');
  });

  test('navega a la página de auditoría y mantiene su opción activa', () => {
    render(
      <MemoryRouter initialEntries={['/panel/audit']}>
        <ManagementSidebar />
      </MemoryRouter>,
    );

    const auditLinks = screen.getAllByRole('link', { name: 'Auditoría' });
    expect(auditLinks).toHaveLength(2);
    expect(auditLinks[0]).toHaveAttribute('href', '/panel/audit');
    expect(auditLinks[0]).toHaveAttribute('aria-current', 'page');
  });

  test('navega a los eventos de anomalía y mantiene su opción activa', () => {
    render(
      <MemoryRouter initialEntries={['/panel/anomalies']}>
        <ManagementSidebar />
      </MemoryRouter>,
    );

    const anomalyLinks = screen.getAllByRole('link', { name: 'Anomalías' });
    expect(anomalyLinks).toHaveLength(2);
    expect(anomalyLinks[0]).toHaveAttribute('href', '/panel/anomalies');
    expect(anomalyLinks[0]).toHaveAttribute('aria-current', 'page');
  });

  test('muestra Analítica activa únicamente para admin-global', () => {
    useAuthStore.setState({
      session: {
        userId: 'u-global',
        username: 'admin-global',
        groups: ['admin-global'],
        roles: [],
        adminScope: 'GENERAL',
        expiresAt: Date.now() + 60_000,
      },
      isHydrated: true,
    });

    render(
      <MemoryRouter initialEntries={['/panel/analitica']}>
        <ManagementSidebar />
      </MemoryRouter>,
    );

    const analyticsLinks = screen.getAllByRole('link', { name: 'Analítica' });
    expect(analyticsLinks).toHaveLength(2);
    expect(analyticsLinks[0]).toHaveAttribute('href', '/panel/analitica');
    expect(analyticsLinks[0]).toHaveAttribute('aria-current', 'page');
  });

  test('oculta Analítica para un delegado de módulo', () => {
    useAuthStore.setState({
      session: {
        userId: 'u-delegate',
        username: 'delegado',
        module: 'reclamos',
        groups: ['delegados'],
        roles: [],
        adminScope: 'MODULE',
        expiresAt: Date.now() + 60_000,
      },
      isHydrated: true,
    });

    render(
      <MemoryRouter initialEntries={['/panel']}>
        <ManagementSidebar />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: 'Analítica' })).not.toBeInTheDocument();
  });
});
