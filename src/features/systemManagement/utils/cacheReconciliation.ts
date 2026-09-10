import { type QueryClient } from '@tanstack/react-query';

import { panelQueryKeys } from './queryKeys';

export const reconcilePeopleAndGroups = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: panelQueryKeys.people() }),
    queryClient.invalidateQueries({ queryKey: panelQueryKeys.groups() }),
  ]);
};

export const reconcileGroups = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: panelQueryKeys.groups() });
