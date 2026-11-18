import { type AxiosRequestConfig } from 'axios';

import { axiosInstance } from '@/lib/axios';

interface AnalyticsRequestConfig extends AxiosRequestConfig {
  _preserveSessionOnUnauthorized: boolean;
}

const ANALYTICS_REQUEST_TIMEOUT_MS = 25_000;

const analyticsRequestConfig: AnalyticsRequestConfig = {
  headers: { Accept: 'text/html' },
  responseType: 'text',
  timeout: ANALYTICS_REQUEST_TIMEOUT_MS,
  _preserveSessionOnUnauthorized: true,
};

export const fetchAnalyticsHtml = async (): Promise<string> => {
  const response = await axiosInstance.get<string>(
    '/admin/analitica',
    analyticsRequestConfig,
  );

  return response.data;
};
