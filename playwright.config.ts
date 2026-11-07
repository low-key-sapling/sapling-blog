import { defineConfig, devices } from '@playwright/test';

const services = process.env.TEST_SERVICES === '1';
const port = services ? 4322 : 4321;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: services ? 'services.spec.ts' : 'site.spec.ts',
  fullyParallel: true,
  // The local Python static server can refuse asset requests from concurrent browsers.
  workers: services ? 1 : 3,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    colorScheme: 'light',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: {
    command: services
      ? 'python -m http.server 4322 --bind 127.0.0.1 --directory .runtime/services-dist'
      : 'npm run preview -- --port 4321',
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
