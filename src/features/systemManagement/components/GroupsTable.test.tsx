import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { type PanelGroup } from '../types';
import { GroupsTable } from './GroupsTable';

const group: PanelGroup = {
  name: 'soporte-n2',
  members: ['jperez'],
  reserved: false,
  module: 'reclamos',
};

describe('GroupsTable', () => {
  test.each([
    { isGeneralAdmin: false, expected: false },
    { isGeneralAdmin: true, expected: true },
  ])(
    'condiciona la columna Módulo según el alcance administrativo',
    ({ isGeneralAdmin, expected }) => {
      render(
        <GroupsTable
          groups={[group]}
          isGeneralAdmin={isGeneralAdmin}
          onEdit={vi.fn()}
        />,
      );

      const moduleHeader = screen.queryByRole('columnheader', {
        name: 'Módulo',
      });
      if (expected) {
        expect(moduleHeader).toBeInTheDocument();
        expect(screen.getByText('Reclamos')).toBeInTheDocument();
      } else {
        expect(moduleHeader).not.toBeInTheDocument();
        expect(screen.queryByText('Reclamos')).not.toBeInTheDocument();
      }
    },
  );
});
