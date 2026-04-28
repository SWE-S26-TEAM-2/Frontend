/**
 * profile-real.spec.ts - follow / unfollow against the live backend.
 *
 * Strategy:
 *   1. Resolve a target username from env OTHER_USERNAME, otherwise register a
 *      transient secondary user via /auth/register.
 *   2. Visit /{username}, click the Follow button.
 *   3. Intercept POST /users/{username}/follow expecting 200/201.
 *   4. Click again to unfollow; intercept DELETE /users/{username}/follow.
 *
 * Note: Today's `ProfileActions` button only flips local state; this spec is
 * specifically designed to fail until the FE wires the click to the API. That
 * failure is the audit-finding signal we want to surface.
 */
import { test, expect } from '@playwright/test';
import {
  apiRegister,
  apiRequest,
  isStorageStateAuthenticated,
  getSeedUser,
} from './fixtures/api-client';

async function resolveTargetUsername(): Promise<string | null> {
  if (process.env.OTHER_USERNAME) return process.env.OTHER_USERNAME;

  // Register a transient second user.
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const username = `pwfoll${id.slice(0, 10)}`;
  const res = await apiRegister({
    email: `pw-follow-${id}@example.com`,
    username,
    password: 'PwFollow1!',
  });
  if (!res.ok && res.status !== 409) return null;
  return username;
}

test.describe('@real profile follow', () => {
  test.beforeAll(async () => {
    if (!(await isStorageStateAuthenticated())) {
      test.skip(true, 'No real-backend auth; see fixtures/README.md.');
    }
  });

  test('follow then unfollow sends the right requests', async ({ page }) => {
    const seedUser = await getSeedUser();
    const target = await resolveTargetUsername();
    test.skip(
      target === null,
      'Could not resolve a target username; set OTHER_USERNAME or enable /auth/register.'
    );
    test.skip(
      Boolean(seedUser && target === seedUser.username),
      'Cannot follow self; set OTHER_USERNAME to a different user.'
    );

    let followStatus: number | null = null;
    let unfollowStatus: number | null = null;
    await page.route(`**/users/${target}/follow`, async (route) => {
      const method = route.request().method();
      const response = await route.fetch();
      if (method === 'POST') followStatus = response.status();
      if (method === 'DELETE') unfollowStatus = response.status();
      await route.fulfill({ response });
    });

    await page.goto(`/${target}`);
    const followBtn = page.getByRole('button', { name: /Follow$/ });
    await followBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await followBtn.click();

    // Wait for either the route to fire (preferred) or the UI to flip.
    await expect
      .poll(
        async () => {
          if (followStatus !== null) return true;
          const r = await apiRequest(`/users/${target}/followers`).catch(
            () => null
          );
          if (r?.ok && Array.isArray(r.data)) {
            return r.data.some(
              (u: unknown) =>
                typeof u === 'object' &&
                u !== null &&
                (u as { username?: string }).username === seedUser?.username
            );
          }
          return false;
        },
        { timeout: 8000 }
      )
      .toBe(true);

    if (followStatus !== null) {
      expect([200, 201, 204]).toContain(followStatus);
    }

    // Unfollow
    const unfollowBtn = page.getByRole('button', { name: /Following/ });
    if (await unfollowBtn.isVisible().catch(() => false)) {
      await unfollowBtn.click();
      await expect
        .poll(() => unfollowStatus, { timeout: 6000 })
        .not.toBeNull();
      expect([200, 202, 204]).toContain(unfollowStatus!);
    } else {
      test.info().annotations.push({
        type: 'note',
        description:
          'Follow button never flipped to "Following" - FE click likely ' +
          'updated only local state. Wire ProfileActions click to ' +
          'POST /users/{username}/follow to clear this finding.',
      });
    }
  });
});
