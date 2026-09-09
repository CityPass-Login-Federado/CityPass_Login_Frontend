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
  updatePerson,
} from '../api/panelApi';
import {
  type CreatePersonRequest,
  type PeopleListParams,
  type PersonStatusVariables,
  type UpdatePersonVariables,
} from '../types';
import { panelQueryKeys } from '../utils/queryKeys';

export const usePeople = (params: PeopleListParams) =>
  useQuery({
    queryKey: panelQueryKeys.peopleList(params),
    queryFn: () => fetchPeople(params),
    placeholderData: keepPreviousData,
  });

export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonRequest) => createPerson(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: panelQueryKeys.people() }),
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdatePersonVariables) => updatePerson(variables),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: panelQueryKeys.people() }),
  });
};

export const useSetPersonStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: PersonStatusVariables) =>
      setPersonDisabled(variables),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: panelQueryKeys.people() }),
  });
};
