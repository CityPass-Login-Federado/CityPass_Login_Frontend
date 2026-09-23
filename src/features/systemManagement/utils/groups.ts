import {
  type GroupReservationFilter,
  type PanelGroup,
} from '../types';

export const getScopedMemberKey = (uid: string, module?: string) =>
  `${module ?? 'scoped'}:${uid}`;

export const getUniqueGroupNames = (groups: PanelGroup[]) =>
  [...new Set(groups.map((item) => item.name))].sort((a, b) =>
    a.localeCompare(b),
  );

export const getReservedParam = (
  reservation: GroupReservationFilter,
): boolean | undefined => {
  if (reservation === 'all') return undefined;
  return reservation === 'reserved';
};

export const getGroupDisplayName = (group: PanelGroup) => {
  if (group.displayName?.trim()) return group.displayName.trim();

  return group.name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};
