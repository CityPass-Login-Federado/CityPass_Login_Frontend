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
});
