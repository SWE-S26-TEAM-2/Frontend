import type { APIRequestContext, Page } from '@playwright/test';

/**
 * Seeds both the localStorage auth_token (read by client-side AuthService)
 * and the sc_auth_token cookie (read by middleware.ts) so that:
 *   - The app considers the user authenticated client-side
 *   - The Next.js middleware does NOT redirect protected routes to /login
 *
 * Local runs use a synthetic token accepted by middleware when the backing
 * `/users/me` implementation allows it. Real deployed API rejects forged JWTs —
 * then set `USE_REAL_ENV=true`, `E2E_TEST_PASSWORD`, and optionally `E2E_TEST_EMAIL`
 * / `E2E_LOGIN_URL` so this performs a login and injects `data.access_token`.
 */
function deployOrigin(): string {
  return (
    process.env.E2E_BASE_URL?.replace(/\/$/, '') ??
    'https://streamline-swp.duckdns.org'
  );
}

function defaultLoginUrl(): string {
  return `${deployOrigin()}/api/auth/login`;
}

async function fetchTokensFromDeployedLogin(
  request: APIRequestContext,
  role: 'user' | 'admin' = 'user'
): Promise<{ accessToken: string; refreshToken?: string }> {
  const url = process.env.E2E_LOGIN_URL?.trim() || defaultLoginUrl();
  let email: string;
  let password: string | undefined;

  if (role === 'admin') {
    email = process.env.E2E_ADMIN_EMAIL?.trim() ?? '';
    password = process.env.E2E_ADMIN_PASSWORD?.trim();
    if (!email || !password) {
      throw new Error(
        'Deployed admin e2e: set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (plus USE_REAL_ENV=true).'
      );
    }
  } else {
    email = process.env.E2E_TEST_EMAIL?.trim() || 'loadtest@example.com';
    password = process.env.E2E_TEST_PASSWORD?.trim();
    if (!password) {
      throw new Error(
        'USE_REAL_ENV e2e: set E2E_TEST_PASSWORD for POST /auth/login (optional: E2E_TEST_EMAIL, E2E_LOGIN_URL).'
      );
    }
  }

  const res = await request.post(url, {
    headers: { 'Content-Type': 'application/json' },
    data: { identifier: email, password },
    failOnStatusCode: false,
  });

  if (!res.ok()) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `E2E login failed (${res.status()}): ${body.slice(0, 400)}`
    );
  }

  const json = (await res.json()) as {
    data?: { access_token?: string; refresh_token?: string };
  };
  const accessToken = json?.data?.access_token;
  const refreshToken = json?.data?.refresh_token;
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('E2E login: response JSON missing string data.access_token');
  }

  return { accessToken, refreshToken };
}

/** `deployRole`: only used when USE_REAL_ENV=true (real login). */
export async function seedAuthToken(
  page: Page,
  tokenOrRole?: string | { deployRole?: 'user' | 'admin' }
) {
  let accessToken: string;
  let refreshToken: string | undefined;

  const loginRole =
    typeof tokenOrRole === 'object' && tokenOrRole?.deployRole === 'admin'
      ? 'admin'
      : ('user' as const);

  if (typeof tokenOrRole === 'string') {
    accessToken = tokenOrRole;
  } else if (process.env.USE_REAL_ENV === 'true') {
    const t = await fetchTokensFromDeployedLogin(page.request, loginRole);
    accessToken = t.accessToken;
    refreshToken = t.refreshToken;
  } else {
    accessToken = 'fake-e2e-token';
  }

  await page.addInitScript(
    ({ accessToken: at, refreshToken: rt }) => {
      window.localStorage.setItem('auth_token', at);
      if (rt) window.localStorage.setItem('refresh_token', rt);
    },
    { accessToken, refreshToken: refreshToken ?? '' }
  );

  await page.context().addCookies([
    {
      name: 'sc_auth_token',
      value: accessToken,
      url:
        process.env.USE_REAL_ENV === 'true'
          ? deployOrigin()
          : 'http://localhost:3100',
      httpOnly: false,
      secure: process.env.USE_REAL_ENV === 'true',
      sameSite: 'Lax',
    },
  ]);
}

export async function clearAuthState(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth_token');
  });
  await page.context().clearCookies();
}


