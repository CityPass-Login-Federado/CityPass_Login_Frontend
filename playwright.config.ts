import { defineConfig, devices } from '@playwright/test';

const appUrl = 'http://127.0.0.1:4173';
const apiBaseUrl =
  process.env.E2E_API_BASE_URL ?? 'https://api.citypass-login.pp.ua';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: appUrl,
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: appUrl,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_API_BASE_URL: '/api',
      VITE_CLIENT_ID: 'citypass-admin-web',
      VITE_API_PROXY_TARGET: apiBaseUrl,
      E2E_USERNAME: '',
      E2E_PASSWORD: '',
    },
  },
});
