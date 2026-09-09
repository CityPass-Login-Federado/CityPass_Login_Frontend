import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  addUserToGroup,
  createGroup,
  fetchGroups,
  removeUserFromGroup,
} from '../api/panelApi';
import {
  type AssignUserToGroupRequest,
  type CreateGroupRequest,
  type GroupListParams,
  type RemoveGroupMemberRequest,
} from '../types';
import { panelQueryKeys } from '../utils/queryKeys';

export const useGroups = (params: GroupListParams) =>
  useQuery({
    queryKey: panelQueryKeys.groupsList(params),
    queryFn: () => fetchGroups(params),
    placeholderData: keepPreviousData,
  });

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupRequest) => createGroup(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: panelQueryKeys.groups() }),
  });
};

export const useAssignUserToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignUserToGroupRequest) => addUserToGroup(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: panelQueryKeys.people() }),
        queryClient.invalidateQueries({ queryKey: panelQueryKeys.groups() }),
      ]);
    },
  });
};

export const useRemoveUserFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveGroupMemberRequest) =>
      removeUserFromGroup(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: panelQueryKeys.people() }),
        queryClient.invalidateQueries({ queryKey: panelQueryKeys.groups() }),
      ]);
    },
  });
};
