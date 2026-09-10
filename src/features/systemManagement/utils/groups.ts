import { type PanelGroup } from '../types';

export const getUniqueGroupNames = (groups: PanelGroup[]) =>
  [...new Set(groups.map((item) => item.name))].sort((a, b) =>
    a.localeCompare(b),
  );
