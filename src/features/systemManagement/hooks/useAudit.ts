import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchAuditEntries } from '../api/panelApi';
import { type AuditListParams } from '../types';
import { panelQueryKeys } from '../utils/queryKeys';

export const useAuditEntries = (
  params: AuditListParams,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: panelQueryKeys.auditList(params),
    queryFn: () => fetchAuditEntries(params),
    enabled,
    placeholderData: keepPreviousData,
  });
