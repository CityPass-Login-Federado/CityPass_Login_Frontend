import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  approveAnomalyEvent,
  fetchAnomalyEvents,
} from '../api/panelApi';
import {
  type AnomalyEventListParams,
  type ApproveAnomalyEventVariables,
} from '../types';
import { panelQueryKeys } from '../utils/queryKeys';

export const useAnomalyEvents = (
  params: AnomalyEventListParams,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: panelQueryKeys.anomalyEventsList(params),
    queryFn: () => fetchAnomalyEvents(params),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useApproveAnomalyEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: ApproveAnomalyEventVariables) =>
      approveAnomalyEvent(variables),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: panelQueryKeys.anomalyEvents(),
        }),
        queryClient.invalidateQueries({ queryKey: panelQueryKeys.people() }),
        queryClient.invalidateQueries({ queryKey: panelQueryKeys.audit() }),
      ]);
    },
  });
};
