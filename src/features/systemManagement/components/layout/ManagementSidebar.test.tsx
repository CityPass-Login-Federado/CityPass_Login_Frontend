import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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
});
