import { describe, expect, test } from 'vitest';

import {
  formatAuditDate,
  getAuditActionLabel,
  toLocalDayBoundaryIso,
} from './audit';

describe('audit utils', () => {
  test('traduce acciones conocidas y conserva acciones futuras', () => {
    expect(getAuditActionLabel('MEMBER_ADDED')).toBe('Miembro agregado');
    expect(getAuditActionLabel('LOGIN_LOCKOUT_CLEARED')).toBe(
      'Cuenta desbloqueada',
    );
    expect(getAuditActionLabel('custom_action')).toBe('custom_action');
  });

  test('convierte los extremos del día local a instantes ISO inclusivos', () => {
    const start = toLocalDayBoundaryIso('2026-11-14', 'start');
    const end = toLocalDayBoundaryIso('2026-11-14', 'end');

    expect(start).toBe(new Date(2026, 10, 14, 0, 0, 0, 0).toISOString());
    expect(end).toBe(
      new Date(2026, 10, 14, 23, 59, 59, 999).toISOString(),
    );
    expect(toLocalDayBoundaryIso('', 'start')).toBeUndefined();
  });

  test('formatea instantes válidos y tolera valores inesperados', () => {
    expect(formatAuditDate('2026-11-14T12:30:00Z')).not.toBe(
      '2026-11-14T12:30:00Z',
    );
    expect(formatAuditDate('sin-fecha')).toBe('sin-fecha');
  });
});
