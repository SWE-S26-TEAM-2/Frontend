/**
 * settings-real.spec.ts - PATCH /api/users/me, /privacy, /username against
 * the live backend.
 *
 * Per the audit, only these settings tabs have BE endpoints:
 *   - PATCH /users/me            (bio etc.)
 *   - PATCH /users/me/privacy    (is_private)
 *   - PATCH /users/me/username   (handle change, 4xx on conflict)
 * Other tabs (advertising, content, notifications, two-factor) are
 * documented as test.skip until BE endpoints exist.
 */
import { test, expect } from '@playwright/test';
import {
  apiRequest,
  isStorageStateAuthenticated,
  getSeedUser,
} from './fixtures/api-client';

test.describe('@real settings', () => {
  test.beforeAll(async () => {
    if (!(await isStorageStateAuthenticated())) {
      test.skip(true, 'No real-backend auth; see fixtures/README.md.');
    }
  });

  test('PATCH /users/me updates bio', async () => {
    const newBio = `pw-real bio ${Date.now()}`;
    const res = await apiRequest('/users/me', {
      method: 'PATCH',
      body: { bio: newBio },
    });
    expect(res.ok, JSON.stringify(res.data)).toBe(true);

    const me = await apiRequest<{ bio?: string }>('/users/me');
    expect(me.ok).toBe(true);
    expect(me.data?.bio ?? '').toContain('pw-real bio');
  });

  test('PATCH /users/me/privacy toggles is_private', async () => {
    const before = await apiRequest<{ is_private?: boolean }>('/users/me');
    expect(before.ok).toBe(true);
    const wasPrivate = Boolean(before.data?.is_private);

    const flipped = await apiRequest('/users/me/privacy', {
      method: 'PATCH',
      body: { is_private: !wasPrivate },
    });
    expect(flipped.ok, JSON.stringify(flipped.data)).toBe(true);

    const after = await apiRequest<{ is_private?: boolean }>('/users/me');
    expect(Boolean(after.data?.is_private)).toBe(!wasPrivate);

    // Restore.
    const restore = await apiRequest('/users/me/privacy', {
      method: 'PATCH',
      body: { is_private: wasPrivate },
    });
    expect(restore.ok).toBe(true);
  });

  test('PATCH /users/me/username conflict surfaces a 4xx', async () => {
    const seedUser = await getSeedUser();
    test.skip(!seedUser, 'No seed user available.');
    // Pick a name that almost certainly exists already - the seed user's own
    // username collides if we try it. If env COLLIDING_USERNAME is set we use
    // that, otherwise we keep our own username (still a self-collision in most
    // implementations) and rely on the BE to reject.
    const colliding =
      process.env.COLLIDING_USERNAME ?? seedUser!.username;

    const res = await apiRequest('/users/me/username', {
      method: 'PATCH',
      body: { username: colliding },
    });
    expect(res.ok).toBe(false);
    expect([400, 409, 422]).toContain(res.status);
  });

  test.skip(
    'mock-only settings tabs (advertising/content/notifications/2FA) are NOT real',
    async () => {
      // These tabs are mock-only as per the audit (STEP 5C). Re-enable each
      // when the BE adds an endpoint for them.
    }
  );
});
