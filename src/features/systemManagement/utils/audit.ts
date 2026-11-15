export const AUDIT_ACTION_OPTIONS = [
  { value: 'PERSON_CREATED', label: 'Usuario creado' },
  { value: 'PERSON_UPDATED', label: 'Usuario actualizado' },
  { value: 'PERSON_RENAMED', label: 'Usuario renombrado' },
  { value: 'PERSON_DISABLED', label: 'Usuario deshabilitado' },
  { value: 'PERSON_ENABLED', label: 'Usuario rehabilitado' },
  { value: 'PASSWORD_RESET', label: 'Contraseña restablecida' },
  { value: 'SESSIONS_REVOKED', label: 'Sesiones revocadas' },
  { value: 'GROUP_CREATED', label: 'Grupo creado' },
  { value: 'GROUP_DELETED', label: 'Grupo eliminado' },
  { value: 'MEMBER_ADDED', label: 'Miembro agregado' },
  { value: 'MEMBER_REMOVED', label: 'Miembro quitado' },
  { value: 'LOGIN_LOCKOUT_CLEARED', label: 'Cuenta desbloqueada' },
  { value: 'ANOMALY_EVENT_APPROVED', label: 'Anomalía aprobada' },
] as const;

const auditActionLabels = new Map<string, string>(
  AUDIT_ACTION_OPTIONS.map(({ value, label }) => [value, label]),
);

export const getAuditActionLabel = (action: string) =>
  auditActionLabels.get(action.toUpperCase()) ?? action;

export const toLocalDayBoundaryIso = (
  value: string,
  boundary: 'start' | 'end',
) => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  const date =
    boundary === 'start'
      ? new Date(year, month - 1, day, 0, 0, 0, 0)
      : new Date(year, month - 1, day, 23, 59, 59, 999);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const auditDateFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

export const formatAuditDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : auditDateFormatter.format(date);
};
