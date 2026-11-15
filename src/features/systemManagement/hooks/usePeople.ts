import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createPerson,
  fetchPeople,
  setPersonDisabled,
  unlockPerson,
  updatePerson,
} from '../api/panelApi';
import {
  type CreatePersonVariables,
  type PeopleListParams,
  type PersonStatusVariables,
  type UnlockPersonVariables,
  type UpdatePersonVariables,
} from '../types';
import { reconcilePeopleAndGroups } from '../utils/cacheReconciliation';
import { panelQueryKeys } from '../utils/queryKeys';

export const usePeople = (
  params: PeopleListParams,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: panelQueryKeys.peopleList(params),
    queryFn: () => fetchPeople(params),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreatePersonVariables) => createPerson(variables),
    onSettled: () => reconcilePeopleAndGroups(queryClient),
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdatePersonVariables) => updatePerson(variables),
    onSettled: () => reconcilePeopleAndGroups(queryClient),
  });
};

export const useSetPersonStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: PersonStatusVariables) =>
      setPersonDisabled(variables),
    onSettled: () => reconcilePeopleAndGroups(queryClient),
  });
};

export const useUnlockPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UnlockPersonVariables) => unlockPerson(variables),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: panelQueryKeys.people() }),
        queryClient.invalidateQueries({ queryKey: panelQueryKeys.audit() }),
      ]);
    },
  });
};
