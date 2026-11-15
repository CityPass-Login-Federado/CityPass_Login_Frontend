import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { type PanelAnomalyEvent } from '../../types';
import { AnomalyTable } from './AnomalyTable';

const blockedEvent: PanelAnomalyEvent = {
  id: '9423464d-dc24-4bdf-b23a-c45c6bb64826',
  userSub: 'U000042',
  username: 'jperez',
  module: 'reclamos',
  clientId: 'citypass-admin-web',
  ipAddress: '203.0.113.10',
  userAgent: 'Mozilla/5.0',
  riskScore: 0.93,
  reasons: ['IP nueva', 'Agente desconocido'],
  status: 'BLOCKED',
  blockedAt: '2026-11-15T12:30:00Z',
  approvedAt: null,
  approvalExpiresAt: null,
  approvedBySub: null,
  approvedByUid: null,
  consumedAt: null,
};

describe('AnomalyTable', () => {
  test('presenta el riesgo, contexto y solo permite aprobar eventos bloqueados', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    const approvedEvent: PanelAnomalyEvent = {
      ...blockedEvent,
      id: 'ce36f47c-2c54-45e4-884d-3902e06786f2',
      username: 'mlopez',
      status: 'APPROVED',
      approvedAt: '2026-11-15T12:35:00Z',
      approvalExpiresAt: '2026-11-15T12:50:00Z',
    };

    render(
      <AnomalyTable
        events={[blockedEvent, approvedEvent]}
        isApprovalPending={false}
        onApprove={onApprove}
      />,
    );

    expect(screen.getAllByText('93 %')).toHaveLength(2);
    expect(screen.getAllByText('IP nueva, Agente desconocido')).toHaveLength(2);
    expect(screen.getAllByText('Reclamos')).toHaveLength(2);
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByText('Sin acciones')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Aprobar evento de jperez' }),
    );

    expect(onApprove).toHaveBeenCalledWith(blockedEvent);
  });
});
