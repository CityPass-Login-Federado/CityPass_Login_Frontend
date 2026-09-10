import {
  type GroupListParams,
  type PeopleListParams,
} from '../types';

export const panelQueryKeys = {
  all: ['system-management'] as const,
  people: () => [...panelQueryKeys.all, 'people'] as const,
  peopleList: (params: PeopleListParams) =>
    [...panelQueryKeys.people(), params] as const,
  groups: () => [...panelQueryKeys.all, 'groups'] as const,
  groupsList: (params: GroupListParams) =>
    [...panelQueryKeys.groups(), params] as const,
};
