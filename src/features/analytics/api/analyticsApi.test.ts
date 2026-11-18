import { beforeEach, describe, expect, test, vi } from 'vitest';

import { axiosInstance } from '@/lib/axios';

import { fetchAnalyticsHtml } from './analyticsApi';

describe('analyticsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('solicita el HTML al proxy autenticado del backend', async () => {
    const html = '<!doctype html><html><body>Tablero</body></html>';
    const getSpy = vi
      .spyOn(axiosInstance, 'get')
      .mockResolvedValue({ data: html });

    await expect(fetchAnalyticsHtml()).resolves.toBe(html);
    expect(getSpy).toHaveBeenCalledWith('/admin/analitica', {
      headers: { Accept: 'text/html' },
      responseType: 'text',
      timeout: 25_000,
      _preserveSessionOnUnauthorized: true,
    });
  });
});
