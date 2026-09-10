import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { App } from './App';

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="global-toaster" />,
}));

vi.mock('@/features/auth/components/LoginPage', () => ({
  LoginPage: () => <div>Página de acceso</div>,
}));

describe('App', () => {
  test('monta una única instancia global del Toaster', () => {
    window.history.pushState({}, '', '/login');

    render(<App />);

    expect(screen.getAllByTestId('global-toaster')).toHaveLength(1);
  });
});
