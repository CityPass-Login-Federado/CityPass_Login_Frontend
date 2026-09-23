import { type AxiosError } from 'axios';

import { type ApiError } from '../types';

export const getApiErrorMessage = (
  error: AxiosError<ApiError> | null,
  fallback: string,
) => error?.response?.data?.message ?? fallback;
