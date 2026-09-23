import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  addUserToGroup,
  addUsersToGroups,
  createGroup,
  deleteGroup,
  fetchGroups,
  removeUserFromGroup,
} from '../api/panelApi';
import {
  type AssignUserToGroupRequest,
  type BulkMembershipRequest,
  type CreateGroupVariables,
  type DeleteGroupRequest,
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
    mutationFn: (variables: CreateGroupVariables) => createGroup(variables),
    onSettled: () => reconcileGroups(queryClient),
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteGroupRequest) => deleteGroup(data),
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

export const useAssignUsersToGroups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkMembershipRequest) => addUsersToGroups(data),
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
