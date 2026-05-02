import type { TestInfo } from '@playwright/test';

/** Local/mock defaults; override on deploy via .env.e2e.local (see deploy.env.example). */
export const TEST_USERS = {
  owner: process.env.E2E_PROFILE_OWNER_SLUG?.trim() || 'testuser',
  artist: process.env.E2E_PROFILE_ARTIST_SLUG?.trim() || 'testartist',
} as const;

const useRealEnv = process.env.USE_REAL_ENV === 'true';

export function skipIfDeployProfileSlugMissing(
  testInfo: TestInfo,
  kind: 'artist' | 'owner'
): void {
  if (!useRealEnv) return;
  const key =
    kind === 'artist' ? 'E2E_PROFILE_ARTIST_SLUG' : 'E2E_PROFILE_OWNER_SLUG';
  const val = process.env[key]?.trim();
  if (!val) {
    testInfo.skip(true, `Deploy profile tests: set ${key} to an existing username.`);
  }
}

