import { AxiosError } from 'axios';

import { type PanelApiError } from '../types';

export const getPanelErrorMessage = (
  error: unknown,
  fallback = 'No se pudo completar la operación.',
) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as PanelApiError | undefined;
    return data?.message ?? fallback;
  }

  return fallback;
};
