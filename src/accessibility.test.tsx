import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { LoginForm } from './features/auth/forms/LoginForm';
import { AnomalyTable } from './features/systemManagement/components/anomalies/AnomalyTable';
import { AuditTable } from './features/systemManagement/components/audit/AuditTable';
import { GroupsTable } from './features/systemManagement/components/groups/GroupsTable';
import { UsersTable } from './features/systemManagement/components/users/UsersTable';
import {
  type PanelAnomalyEvent,
  type PanelAuditEntry,
  type PanelGroup,
  type PanelPerson,
} from './features/systemManagement/types';

const person: PanelPerson = {
  employeeNumber: 'U000001',
  uid: 'jperez',
  givenName: 'Juan',
  sn: 'Pérez',
  email: 'jperez@citypass.local',
  disabled: false,
  locked: true,
  lockoutUntil: '2026-11-15T15:30:00Z',
  module: 'reclamos',
};

const group: PanelGroup = {
  name: 'soporte-n2',
  displayName: 'Soporte N2',
  members: ['jperez'],
  reserved: false,
  module: 'reclamos',
};

const auditEntry: PanelAuditEntry = {
  id: 'audit-1',
  actorSub: 'U000099',
  actorUid: 'admin',
  module: 'reclamos',
  action: 'PERSON_UPDATED',
  target: 'uid=jperez,ou=people',
  detail: 'email actualizado',
  occurredAt: '2026-11-15T12:30:00Z',
};

const anomalyEvent: PanelAnomalyEvent = {
  id: 'event-1',
  userSub: 'U000001',
  username: 'jperez',
  module: 'reclamos',
  clientId: 'citypass-admin-web',
  ipAddress: '203.0.113.10',
  userAgent: 'Mozilla/5.0',
  riskScore: 0.93,
  reasons: ['IP nueva'],
  status: 'BLOCKED',
  blockedAt: '2026-11-15T12:30:00Z',
  approvedAt: null,
  approvalExpiresAt: null,
  approvedBySub: null,
  approvedByUid: null,
  consumedAt: null,
};

const expectNoAxeViolations = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results.violations).toEqual([]);
};

afterEach(() => cleanup());

describe('accesibilidad automatizada de las pantallas principales', () => {
  test('login no presenta violaciones detectables por axe', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await expectNoAxeViolations(container);
    queryClient.clear();
  });

  test.each([
    [
      'usuarios',
      <UsersTable
        people={[person]}
        groupNamesByUser={new Map([['reclamos:jperez', ['soporte-n2']]])}
        groupDataStatus="ready"
        isGeneralAdmin
        onEdit={vi.fn()}
        onUnlock={vi.fn()}
        onChangeStatus={vi.fn()}
        isUnlockPending={false}
      />,
    ],
    [
      'grupos',
      <GroupsTable groups={[group]} isGeneralAdmin onEdit={vi.fn()} />,
    ],
    ['auditoría', <AuditTable entries={[auditEntry]} />],
    [
      'anomalías',
      <AnomalyTable
        events={[anomalyEvent]}
        isApprovalPending={false}
        onApprove={vi.fn()}
      />,
    ],
  ])('la vista de %s no presenta violaciones detectables por axe', async (_name, view) => {
    const { container } = render(<main>{view}</main>);

    await expectNoAxeViolations(container);
  });
});
