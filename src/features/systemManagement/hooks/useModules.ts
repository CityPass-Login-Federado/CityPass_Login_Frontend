import { useQuery } from '@tanstack/react-query';

import { fetchModules } from '../api/panelApi';
import { toModuleSummaries } from '../utils/modules';
import { panelQueryKeys } from '../utils/queryKeys';

const MODULES_STALE_TIME = 5 * 60 * 1000;

export const useModules = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: panelQueryKeys.modules(),
    queryFn: fetchModules,
    select: toModuleSummaries,
    enabled,
    staleTime: MODULES_STALE_TIME,
  });
