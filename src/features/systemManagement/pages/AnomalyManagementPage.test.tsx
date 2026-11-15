import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { vi } from 'vitest';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { type NoticeHandler } from '../types';
import { AnomalyManagementPage } from './AnomalyManagementPage';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../components/anomalies/AnomalySection', () => ({
  AnomalySection: ({
    isGeneralAdmin,
    onNotice,
  }: {
    isGeneralAdmin: boolean;
    onNotice: NoticeHandler;
  }) => (
    <div>
      <span>{isGeneralAdmin ? 'Anomalías generales' : 'Anomalías de módulo'}</span>
      <button
        type="button"
        onClick={() => onNotice('success', 'Evento aprobado.')}
      >
        Notificar aprobación
      </button>
    </div>
  ),
}));

vi.mock('@/features/auth/layout/UserMenu', () => ({
  UserMenu: () => null,
}));

describe('AnomalyManagementPage', () => {
  test('presenta la vista general y convierte sus avisos en toasts', async () => {
    const user = userEvent.setup();
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
      <MemoryRouter initialEntries={['/panel/anomalies']}>
        <AnomalyManagementPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Eventos de anomalía' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Anomalías generales')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Notificar aprobación' }),
    );

    expect(toast.success).toHaveBeenCalledWith('Evento aprobado.');
  });
});
