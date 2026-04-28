import { defineConfig, devices } from '@playwright/test';
import { REAL_STORAGE_STATE } from './e2e/real/storage-state-path';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';

export { REAL_STORAGE_STATE };

// Skip booting the second Next.js dev server (port 3101) when the user is
// explicitly running only the chromium-mock project. This keeps mock-only CI
// runs fast without forcing the user to maintain a parallel config file.
const projectFlag = process.argv
  .slice(2)
  .find((arg) => arg === '--project' || arg.startsWith('--project='));
const projectArg = projectFlag?.startsWith('--project=')
  ? projectFlag.slice('--project='.length)
  : projectFlag === '--project'
    ? process.argv[process.argv.indexOf('--project') + 1]
    : undefined;
const onlyMock = projectArg === 'chromium-mock';
const onlyReal = projectArg === 'chromium-real';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  globalSetup: require.resolve('./e2e/real/global-setup.ts'),
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-mock',
      testDir: './e2e/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3100',
      },
    },
    {
      name: 'chromium-real',
      testDir: './e2e/real',
      testIgnore: [
        '**/global-setup.ts',
        '**/fixtures/**',
        '**/.auth/**',
      ],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3101',
        storageState: REAL_STORAGE_STATE,
        extraHTTPHeaders: {
          'x-pw-real-mode': '1',
        },
      },
    },
  ],
  webServer: [
    ...(onlyReal
      ? []
      : [
          {
            command: 'npm run dev -- --port 3100 --webpack',
            url: 'http://127.0.0.1:3100',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
            env: {
              NEXT_PUBLIC_USE_MOCK_API: 'true',
            },
          },
        ]),
    ...(onlyMock
      ? []
      : [
          {
            command: 'npm run dev -- --port 3101 --webpack',
            url: 'http://127.0.0.1:3101',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
            env: {
              NEXT_PUBLIC_USE_MOCK_API: 'false',
              // Existing src/config/env.ts reads NEXT_PUBLIC_API_URL.
              // The audit plan specifies NEXT_PUBLIC_API_BASE_URL, so we
              // set both for forward-compat without breaking existing code.
              NEXT_PUBLIC_API_URL: `${BACKEND_URL}/api`,
              NEXT_PUBLIC_API_BASE_URL: BACKEND_URL,
            },
          },
        ]),
  ],
});
