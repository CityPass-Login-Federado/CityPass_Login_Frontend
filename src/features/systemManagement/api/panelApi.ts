import { axiosInstance } from '@/lib/axios';

import {
  type AssignUserToGroupRequest,
  type BulkMembershipRequest,
  type BulkMembershipResponse,
  type CreateGroupVariables,
  type CreatePersonVariables,
  type DeleteGroupRequest,
  type GroupListParams,
  type MembershipChangeResponse,
  type PaginatedResponse,
  type PanelGroup,
  type PanelPerson,
  type PeopleListParams,
  type RemoveGroupMemberRequest,
  type UpdatePersonVariables,
} from '../types';
import {
  normalizePaginatedResponse,
  type RawListResponse,
} from '../utils/pagination';

const withoutEmptyParams = <T extends object>(params: T) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

const moduleConfig = (module?: string) =>
  module ? { params: { module } } : undefined;

export const fetchModules = async (): Promise<string[]> => {
  const response = await axiosInstance.get<string[]>('/panel/modules');
  return response.data;
};

export const fetchPeople = async (
  params: PeopleListParams,
): Promise<PaginatedResponse<PanelPerson>> => {
  const { isGeneralAdmin = false, ...requestParams } = params;
  const isGlobalView = isGeneralAdmin && !requestParams.module;

  const response = await axiosInstance.get<RawListResponse<PanelPerson>>(
    isGlobalView ? '/panel/admin/people' : '/panel/people',
    { params: withoutEmptyParams(requestParams) },
  );
  const normalized = normalizePaginatedResponse(
    response.data,
    requestParams.page,
    requestParams.size,
  );

  return isGeneralAdmin && requestParams.module
    ? {
        ...normalized,
        content: normalized.content.map((person) => ({
          ...person,
          module: requestParams.module,
        })),
      }
    : normalized;
};

export const createPerson = async (
  { data, module }: CreatePersonVariables,
): Promise<PanelPerson> => {
  const response = await axiosInstance.post<PanelPerson>(
    '/panel/people',
    data,
    moduleConfig(module),
  );
  return response.data;
};

export const updatePerson = async ({
  uid,
  data,
  module,
}: UpdatePersonVariables): Promise<PanelPerson> => {
  const response = await axiosInstance.put<PanelPerson>(
    `/panel/people/${encodeURIComponent(uid)}`,
    data,
    moduleConfig(module),
  );
  return response.data;
};

export const setPersonDisabled = async ({
  uid,
  disabled,
  module,
}: {
  uid: string;
  disabled: boolean;
  module?: string;
}): Promise<void> => {
  const action = disabled ? 'disable' : 'enable';
  await axiosInstance.post(
    `/panel/people/${encodeURIComponent(uid)}/${action}`,
    undefined,
    moduleConfig(module),
  );
};

export const fetchGroups = async (
  params: GroupListParams,
): Promise<PaginatedResponse<PanelGroup>> => {
  const { isGeneralAdmin = false, ...requestParams } = params;
  const isGlobalView = isGeneralAdmin && !requestParams.module;

  const response = await axiosInstance.get<RawListResponse<PanelGroup>>(
    isGlobalView ? '/panel/admin/groups' : '/panel/groups',
    { params: withoutEmptyParams(requestParams) },
  );
  const normalized = normalizePaginatedResponse(
    response.data,
    requestParams.page,
    requestParams.size,
  );

  return isGeneralAdmin && requestParams.module
    ? {
        ...normalized,
        content: normalized.content.map((group) => ({
          ...group,
          module: requestParams.module,
        })),
      }
    : normalized;
};

export const createGroup = async (
  { data, module }: CreateGroupVariables,
): Promise<PanelGroup> => {
  const response = await axiosInstance.post<PanelGroup>(
    '/panel/groups',
    data,
    moduleConfig(module),
  );
  return response.data;
};

export const deleteGroup = async ({
  groupName,
  module,
}: DeleteGroupRequest): Promise<void> => {
  await axiosInstance.delete(
    `/panel/groups/${encodeURIComponent(groupName)}`,
    moduleConfig(module),
  );
};

export const addUserToGroup = async ({
  userId,
  groupName,
  module,
}: AssignUserToGroupRequest): Promise<MembershipChangeResponse> => {
  const response = await axiosInstance.post<MembershipChangeResponse>(
    `/panel/groups/${encodeURIComponent(groupName)}/members`,
    { memberUid: userId },
    moduleConfig(module),
  );
  return response.data;
};

export const addUsersToGroups = async ({
  memberUids,
  groupNames,
  module,
}: BulkMembershipRequest): Promise<BulkMembershipResponse> => {
  const response = await axiosInstance.post<BulkMembershipResponse>(
    '/panel/group-memberships/bulk',
    { memberUids, groupNames },
    moduleConfig(module),
  );
  return response.data;
};

export const removeUserFromGroup = async ({
  userId,
  groupName,
  module,
}: RemoveGroupMemberRequest): Promise<MembershipChangeResponse> => {
  const response = await axiosInstance.delete<MembershipChangeResponse>(
    `/panel/groups/${encodeURIComponent(groupName)}/members/${encodeURIComponent(userId)}`,
    moduleConfig(module),
  );
  return response.data;
};
