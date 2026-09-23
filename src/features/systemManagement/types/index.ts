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
  groupNumber?: string;
  displayName?: string;
  members: string[];
  reserved: boolean;
  module?: string;
}

export interface UserSelectOption {
  value: string;
  label: string;
  email?: string;
}

export interface GroupSelectOption {
  value: string;
  label: string;
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
  isGeneralAdmin?: boolean;
}

export interface GroupListParams {
  page: number;
  size: number;
  search?: string;
  reserved?: boolean;
  module?: string;
  isGeneralAdmin?: boolean;
}

export interface CreatePersonRequest {
  givenName: string;
  sn: string;
  username: string;
  email: string;
  temporaryPassword: string;
}

export interface CreatePersonVariables {
  data: CreatePersonRequest;
  module?: string;
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
  module?: string;
}

export interface PersonStatusVariables {
  uid: string;
  disabled: boolean;
  module?: string;
}

export interface CreateGroupRequest {
  name: string;
}

export interface CreateGroupVariables {
  data: CreateGroupRequest;
  module?: string;
}

export interface AssignUserToGroupRequest {
  userId: string;
  groupName: string;
  module?: string;
}

export type BulkMembershipStatus = 'SUCCESS' | 'PARTIAL' | 'FAILED';

export type MembershipOperationStatus =
  | 'ASSIGNED'
  | 'ALREADY_MEMBER'
  | 'FAILED';

export interface BulkMembershipRequest {
  memberUids: string[];
  groupNames: string[];
  module?: string;
}

export interface MembershipOperationResult {
  memberUid: string;
  groupName: string;
  status: MembershipOperationStatus;
  message: string | null;
}

export interface MembershipWarning {
  memberUid: string;
  totalGroups: number;
  message: string;
}

export interface BulkMembershipResponse {
  status: BulkMembershipStatus;
  requested: number;
  assigned: number;
  skipped: number;
  failed: number;
  results: MembershipOperationResult[];
  warnings: MembershipWarning[];
}

export interface DeleteGroupRequest {
  groupName: string;
  module?: string;
}

export interface RemoveGroupMemberRequest {
  userId: string;
  groupName: string;
  module?: string;
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
export type GroupReservationFilter = 'all' | 'reserved' | 'available';

export type NoticeKind = 'success' | 'error' | 'warning';
export type NoticeHandler = (kind: NoticeKind, message: string) => void;
