import {
  type AnomalyEventListParams,
  type AuditListParams,
  type GroupListParams,
  type PeopleListParams,
} from '../types';

export const panelQueryKeys = {
  all: ['system-management'] as const,
  modules: () => [...panelQueryKeys.all, 'modules'] as const,
  audit: () => [...panelQueryKeys.all, 'audit'] as const,
  auditList: (params: AuditListParams) =>
    [...panelQueryKeys.audit(), params] as const,
  anomalyEvents: () => [...panelQueryKeys.all, 'anomaly-events'] as const,
  anomalyEventsList: (params: AnomalyEventListParams) =>
    [...panelQueryKeys.anomalyEvents(), params] as const,
  people: () => [...panelQueryKeys.all, 'people'] as const,
  peopleList: (params: PeopleListParams) =>
    [...panelQueryKeys.people(), params] as const,
  groups: () => [...panelQueryKeys.all, 'groups'] as const,
  groupsList: (params: GroupListParams) =>
    [...panelQueryKeys.groups(), params] as const,
};
