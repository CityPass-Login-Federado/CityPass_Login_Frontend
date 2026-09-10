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
import {
  reconcileGroups,
  reconcilePeopleAndGroups,
} from '../utils/cacheReconciliation';
import { panelQueryKeys } from '../utils/queryKeys';

export const useGroups = (
  params: GroupListParams,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: panelQueryKeys.groupsList(params),
    queryFn: () => fetchGroups(params),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupRequest) => createGroup(data),
    onSettled: () => reconcileGroups(queryClient),
  });
};

export const useAssignUserToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignUserToGroupRequest) => addUserToGroup(data),
    onSettled: () => reconcilePeopleAndGroups(queryClient),
  });
};

export const useRemoveUserFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveGroupMemberRequest) =>
      removeUserFromGroup(data),
    onSettled: () => reconcilePeopleAndGroups(queryClient),
  });
};
