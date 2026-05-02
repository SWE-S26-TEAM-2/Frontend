import path from 'path';
import { config as loadDeployEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Secrets for `npm run test:e2e:real`: put them in `.env.e2e.local`, not in git.
loadDeployEnv({
  path: path.join(__dirname, '.env.e2e.local'),
});

/** Deploy/staging origin for USE_REAL_ENV (no trailing slash). */
const E2E_DEFAULT_DEPLOY_ORIGIN =
  process.env.E2E_BASE_URL?.replace(/\/$/, '') ??
  'https://streamline-swp.duckdns.org';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL:
      process.env.USE_REAL_ENV === 'true'
        ? E2E_DEFAULT_DEPLOY_ORIGIN
        : 'http://localhost:3100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: process.env.USE_REAL_ENV === 'true' ? undefined : {
    command:
      'cross-env E2E_SKIP_AUTH_VERIFY=true PLAYWRIGHT_FORCE_MOCK=1 npm run dev -- -p 3100',
    url: 'http://localhost:3100',
    // Default false: otherwise `npm run test:e2e` reuses whichever process already
    // owns :3100 (e.g. a plain `npm run dev`) — wrong env ⇒ mass failures for QE.
    // Opt in: PW_REUSE_WEB_SERVER=true npm run test:e2e
    reuseExistingServer: process.env.PW_REUSE_WEB_SERVER === 'true',
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
