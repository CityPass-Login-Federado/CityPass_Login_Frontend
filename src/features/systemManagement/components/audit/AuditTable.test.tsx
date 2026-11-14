import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { AuditTable } from './AuditTable';

describe('AuditTable', () => {
  test('muestra actor, acción traducida, módulo y detalle del evento', () => {
    render(
      <AuditTable
        entries={[
          {
            id: '9423464d-dc24-4bdf-b23a-c45c6bb64826',
            actorSub: 'U000042',
            actorUid: 'jperez',
            module: 'reclamos',
            action: 'PERSON_CREATED',
            target: 'uid=ana,ou=people,ou=reclamos',
            detail: 'alta desde el panel',
            occurredAt: '2026-11-14T12:30:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('jperez')).toBeInTheDocument();
    expect(screen.getByText('U000042')).toBeInTheDocument();
    expect(screen.getByText('Usuario creado')).toHaveAttribute(
      'title',
      'PERSON_CREATED',
    );
    expect(screen.getByText('Reclamos')).toBeInTheDocument();
    expect(screen.getByText('alta desde el panel')).toBeInTheDocument();
    expect(screen.getByRole('time')).toHaveAttribute(
      'datetime',
      '2026-11-14T12:30:00Z',
    );
  });
});
