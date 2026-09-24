import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { GroupsSection } from './components/groups/GroupsSection';
import { SectionEmpty, SectionError, SectionLoading } from './components/shared/SectionState';
import { TablePagination } from './components/shared/TablePagination';
import { UnauthorizedPage } from '../auth/pages/UnauthorizedPage';

vi.mock('./hooks/useGroups', () => ({
  useGroups: () => ({
    isPending: false,
    isError: false,
    data: { content: [], totalElements: 0, totalPages: 0, currentPage: 0, size: 6 },
  }),
  useCreateGroup: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useRemoveUserFromGroup: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useAssignUserToGroup: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useAssignUsersToGroups: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useDeleteGroup: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

describe('system management coverage additions', () => {
  test('renderiza estados de carga, error y vacío', () => {
    const { rerender } = render(<SectionLoading />);
    expect(screen.getByLabelText('Cargando')).toBeInTheDocument();

    rerender(<SectionError message="Error de prueba" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Error de prueba');

    rerender(<SectionEmpty message="Sin resultados" />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  test('renderiza la paginación y activa el cambio de página', () => {
    render(
      <TablePagination
        currentPage={1}
        totalPages={3}
        totalElements={18}
        pageSize={6}
        itemLabel="elementos"
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Mostrando 7–12/)).toBeInTheDocument();
    expect(screen.getByLabelText('Página 2')).toBeInTheDocument();
  });

  test('renderiza la sección de grupos sin error y usa la vista de acceso no autorizado', () => {
    render(
      <MemoryRouter>
        <GroupsSection isGeneralAdmin={false} onNotice={vi.fn()} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('button', { name: 'Agregar Grupo' }),
    ).toBeInTheDocument();

    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Acceso no autorizado')).toBeInTheDocument();
  });
});
