export interface ModuleSummary {
  id: string;
  name: string;
}

export interface PanelPerson {
  employeeNumber: string;
  uid: string;
  givenName: string;
  sn: string;
  email: string;
  disabled: boolean;
  module?: string;
}

export interface PanelGroup {
  name: string;
  members: string[];
  reserved: boolean;
  module?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface PeopleListParams {
  page: number;
  size: number;
  search?: string;
  group?: string;
  disabled?: boolean;
  module?: string;
}

export interface GroupListParams {
  page: number;
  size: number;
  search?: string;
  reserved?: boolean;
  module?: string;
}

export interface CreatePersonRequest {
  givenName: string;
  sn: string;
  username: string;
  email: string;
  temporaryPassword: string;
}

export interface UpdatePersonRequest {
  givenName?: string;
  sn?: string;
  email?: string;
  newUsername?: string;
}

export interface UpdatePersonVariables {
  uid: string;
  data: UpdatePersonRequest;
}

export interface PersonStatusVariables {
  uid: string;
  disabled: boolean;
}

export interface CreateGroupRequest {
  name: string;
}

export interface AssignUserToGroupRequest {
  userId: string;
  groupName: string;
  moduleId?: string;
}

export interface RemoveGroupMemberRequest {
  userId: string;
  groupName: string;
}

export interface MembershipChangeResponse {
  group: PanelGroup;
  warnings: string[];
}

export interface PanelApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
}

export type PersonStatusFilter = 'all' | 'active' | 'inactive';

export type NoticeKind = 'success' | 'error' | 'warning';
export type NoticeHandler = (kind: NoticeKind, message: string) => void;
