import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { vi } from 'vitest';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { type NoticeHandler } from '../types';
import { SystemManagementPage } from './SystemManagementPage';

interface NoticeSourceProps {
  onNotice: NoticeHandler;
}

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('./ManagementSidebar', () => ({
  ManagementSidebar: () => null,
}));

vi.mock('./UsersSection', () => ({
  UsersSection: ({ onNotice }: NoticeSourceProps) => (
    <div>
      <button
        type="button"
        onClick={() => onNotice('success', 'Usuario guardado correctamente.')}
      >
        Notificar éxito
      </button>
      <button
        type="button"
        onClick={() => onNotice('error', 'No se pudo guardar el usuario.')}
      >
        Notificar error
      </button>
      <button
        type="button"
        onClick={() => onNotice('warning', 'La membresía requiere atención.')}
      >
        Notificar advertencia
      </button>
    </div>
  ),
}));

vi.mock('./GroupsSection', () => ({
  GroupsSection: () => null,
}));

vi.mock('./AssignUserToGroupCard', () => ({
  AssignUserToGroupCard: () => null,
}));

describe('SystemManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  test('convierte los avisos transitorios en toasts según su severidad', async () => {
    const user = userEvent.setup();
    render(<SystemManagementPage />);

    await user.click(screen.getByRole('button', { name: 'Notificar éxito' }));
    await user.click(screen.getByRole('button', { name: 'Notificar error' }));
    await user.click(
      screen.getByRole('button', { name: 'Notificar advertencia' }),
    );

    expect(toast.success).toHaveBeenCalledWith(
      'Usuario guardado correctamente.',
    );
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo guardar el usuario.',
    );
    expect(toast.warning).toHaveBeenCalledWith(
      'La membresía requiere atención.',
    );
    expect(
      screen.queryByText('Usuario guardado correctamente.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('No se pudo guardar el usuario.'),
    ).not.toBeInTheDocument();
  });
});
