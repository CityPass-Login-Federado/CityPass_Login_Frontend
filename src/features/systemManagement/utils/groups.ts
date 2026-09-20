import { type PanelGroup } from '../types';

export const getUniqueGroupNames = (groups: PanelGroup[]) =>
  [...new Set(groups.map((item) => item.name))].sort((a, b) =>
    a.localeCompare(b),
  );

export const getGroupDisplayName = (group: PanelGroup) => {
  if (group.displayName?.trim()) return group.displayName.trim();

  return group.name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};
