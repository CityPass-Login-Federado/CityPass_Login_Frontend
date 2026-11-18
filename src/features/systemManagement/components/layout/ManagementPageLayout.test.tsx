import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { ManagementPageLayout } from './ManagementPageLayout';

vi.mock('@/features/auth/layout/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

describe('ManagementPageLayout', () => {
  afterEach(() => {
    cleanup();
    useAuthStore.setState({ session: null, isHydrated: false });
  });

  test('limita el panel al viewport y concentra el scroll en el contenido', () => {
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
      <MemoryRouter>
        <ManagementPageLayout
          title="Panel de prueba"
          description="Descripción de prueba"
        >
          <section>Contenido</section>
        </ManagementPageLayout>
      </MemoryRouter>,
    );

    const layout = screen.getByRole('heading', {
      name: 'Panel de prueba',
    }).closest('#top');
    const contentScroller = screen.getByRole('main').parentElement;
    const sidebar = screen.getByRole('complementary');

    expect(layout).toHaveClass('h-dvh', 'overflow-hidden');
    expect(layout).not.toHaveClass('min-h-screen');
    expect(contentScroller).toHaveClass('min-h-0', 'overflow-y-auto');
    expect(sidebar).toHaveClass('h-full', 'overflow-y-auto');
    expect(sidebar).not.toHaveClass('min-h-screen');
  });
});
