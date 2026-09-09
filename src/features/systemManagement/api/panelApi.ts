import { axiosInstance } from '@/lib/axios';

import {
  type AssignUserToGroupRequest,
  type CreateGroupRequest,
  type CreatePersonRequest,
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

export const fetchPeople = async (
  params: PeopleListParams,
): Promise<PaginatedResponse<PanelPerson>> => {
  const response = await axiosInstance.get<RawListResponse<PanelPerson>>(
    '/panel/people',
    { params: withoutEmptyParams(params) },
  );
  return normalizePaginatedResponse(response.data, params.page, params.size);
};

export const createPerson = async (
  data: CreatePersonRequest,
): Promise<PanelPerson> => {
  const response = await axiosInstance.post<PanelPerson>('/panel/people', data);
  return response.data;
};

export const updatePerson = async ({
  uid,
  data,
}: UpdatePersonVariables): Promise<PanelPerson> => {
  const response = await axiosInstance.put<PanelPerson>(
    `/panel/people/${encodeURIComponent(uid)}`,
    data,
  );
  return response.data;
};

export const setPersonDisabled = async ({
  uid,
  disabled,
}: {
  uid: string;
  disabled: boolean;
}): Promise<void> => {
  const action = disabled ? 'disable' : 'enable';
  await axiosInstance.post(
    `/panel/people/${encodeURIComponent(uid)}/${action}`,
  );
};

export const fetchGroups = async (
  params: GroupListParams,
): Promise<PaginatedResponse<PanelGroup>> => {
  const response = await axiosInstance.get<RawListResponse<PanelGroup>>(
    '/panel/groups',
    { params: withoutEmptyParams(params) },
  );
  return normalizePaginatedResponse(response.data, params.page, params.size);
};

export const createGroup = async (
  data: CreateGroupRequest,
): Promise<PanelGroup> => {
  const response = await axiosInstance.post<PanelGroup>('/panel/groups', data);
  return response.data;
};

export const addUserToGroup = async ({
  userId,
  groupName,
}: AssignUserToGroupRequest): Promise<MembershipChangeResponse> => {
  const response = await axiosInstance.post<MembershipChangeResponse>(
    `/panel/groups/${encodeURIComponent(groupName)}/members`,
    { memberUid: userId },
  );
  return response.data;
};

export const removeUserFromGroup = async ({
  userId,
  groupName,
}: RemoveGroupMemberRequest): Promise<MembershipChangeResponse> => {
  const response = await axiosInstance.delete<MembershipChangeResponse>(
    `/panel/groups/${encodeURIComponent(groupName)}/members/${encodeURIComponent(userId)}`,
  );
  return response.data;
};
