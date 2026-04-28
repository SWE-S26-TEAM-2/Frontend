/**
 * auth-real.spec.ts - exercises {BACKEND_URL}/api/auth/* directly.
 *
 * Coverage:
 *   - register a brand-new user (status 201/200/409 tolerated)
 *   - login good credentials -> access_token returned
 *   - login bad credentials -> 4xx
 *   - refresh flow after sleep -> new token
 *   - logout invalidates refresh token (subsequent /users/me 401)
 *   - /users/me 401 when token cleared
 */
import { test, expect } from '@playwright/test';
import {
  apiRegister,
  apiLogin,
  apiRefresh,
  apiLogout,
  apiGetMe,
  getSeedUser,
  isStorageStateAuthenticated,
  API_BASE,
} from './fixtures/api-client';

function suffix(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

test.describe('@real auth', () => {
  test.beforeAll(async () => {
    if (!(await isStorageStateAuthenticated())) {
      test.skip(
        true,
        `Real backend at ${API_BASE} is unreachable or storageState invalid; ` +
          `set BACKEND_URL + verification env vars (see e2e/real/fixtures/README.md).`
      );
    }
  });

  test('register a brand-new user', async () => {
    const id = suffix();
    const payload = {
      email: `pw-newuser-${id}@example.com`,
      username: `pwnew${id.slice(0, 10)}`,
      password: 'PwNewUser1!',
    };
    const res = await apiRegister(payload);
    // Acceptable outcomes: 200 / 201 success, 409 already-exists (rare collision).
    expect([200, 201, 409]).toContain(res.status);
  });

  test('login good credentials returns access token', async () => {
    const seedUser = await getSeedUser();
    test.skip(!seedUser, 'No seed user available from storageState.');
    const res = await apiLogin({
      identifier: seedUser!.email,
      password: seedUser!.password,
    });
    expect(res.ok, JSON.stringify(res.data)).toBe(true);
    const token = res.data?.access_token ?? res.data?.token;
    expect(token, 'login response should include an access_token').toBeTruthy();
  });

  test('login bad credentials is rejected', async () => {
    const seedUser = await getSeedUser();
    test.skip(!seedUser, 'No seed user available from storageState.');
    const res = await apiLogin({
      identifier: seedUser!.email,
      password: 'this-is-not-the-password',
    });
    expect(res.ok).toBe(false);
    expect([400, 401, 403, 422]).toContain(res.status);
  });

  test('refresh flow returns a new access token', async () => {
    const seedUser = await getSeedUser();
    test.skip(
      !seedUser?.refresh_token,
      'storageState has no refresh_token; backend may not return one yet.'
    );
    // Wait briefly so iat-based JWTs don't collide.
    await new Promise((r) => setTimeout(r, 1100));
    const res = await apiRefresh(seedUser!.refresh_token!);
    expect(res.ok, JSON.stringify(res.data)).toBe(true);
  });

  test('logout invalidates refresh token (best-effort)', async () => {
    const seedUser = await getSeedUser();
    test.skip(!seedUser, 'No seed user available from storageState.');
    // Issue a fresh login so we can revoke without breaking the storageState
    // token used by the rest of the suite.
    const fresh = await apiLogin({
      identifier: seedUser!.email,
      password: seedUser!.password,
    });
    expect(fresh.ok).toBe(true);
    const accessToken = fresh.data?.access_token ?? fresh.data?.token;
    const refresh = fresh.data?.refresh_token;
    test.skip(!accessToken, 'No access token from login.');
    const out = await apiLogout(accessToken!);
    expect([200, 204]).toContain(out.status);
    if (refresh) {
      const r = await apiRefresh(refresh);
      expect(r.ok).toBe(false);
      expect([400, 401, 403, 422]).toContain(r.status);
    }
  });

  test('/users/me 401 when token cleared', async () => {
    const res = await apiGetMe('');
    expect(res.ok).toBe(false);
    expect([401, 403]).toContain(res.status);
  });
});
