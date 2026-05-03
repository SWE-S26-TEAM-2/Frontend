import type { APIRequestContext, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type E2ETokens = { accessToken: string; refreshToken?: string };

const deployedTokenCache = new Map<'user' | 'admin', E2ETokens>();
const deployedTokenCachePath = path.join(
  process.cwd(),
  'test-results',
  '.deployed-auth-tokens.json'
);
const RETRYABLE_LOGIN_ERRORS = [
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'socket hang up',
];

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

function readCachedDeployedToken(role: 'user' | 'admin'): E2ETokens | undefined {
  const memoryCached = deployedTokenCache.get(role);
  if (memoryCached) return memoryCached;

  try {
    const raw = fs.readFileSync(deployedTokenCachePath, 'utf8');
    const json = JSON.parse(raw) as Partial<Record<'user' | 'admin', E2ETokens>>;
    const tokens = json[role];
    if (tokens?.accessToken) {
      deployedTokenCache.set(role, tokens);
      return tokens;
    }
  } catch {
    // Cache misses are expected before the first real-env login.
  }

  return undefined;
}

function writeCachedDeployedToken(role: 'user' | 'admin', tokens: E2ETokens) {
  deployedTokenCache.set(role, tokens);

  try {
    fs.mkdirSync(path.dirname(deployedTokenCachePath), { recursive: true });
    let existing: Partial<Record<'user' | 'admin', E2ETokens>> = {};
    if (fs.existsSync(deployedTokenCachePath)) {
      existing = JSON.parse(fs.readFileSync(deployedTokenCachePath, 'utf8'));
    }
    fs.writeFileSync(
      deployedTokenCachePath,
      JSON.stringify({ ...existing, [role]: tokens })
    );
  } catch {
    // The in-memory cache still covers the common single-worker real-env path.
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableLoginError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE_LOGIN_ERRORS.some((needle) => message.includes(needle));
}

async function postLoginWithRetries(
  request: APIRequestContext,
  url: string,
  data: { identifier: string; password: string }
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await request.post(url, {
        headers: { 'Content-Type': 'application/json' },
        data,
        failOnStatusCode: false,
      });

      if (res.status() === 429 || res.status() >= 500) {
        lastError = new Error(`E2E login retryable status ${res.status()}`);
        await delay(500 * attempt);
        continue;
      }

      return res;
    } catch (error) {
      lastError = error;
      if (!isRetryableLoginError(error) || attempt === 3) {
        throw error;
      }
      await delay(500 * attempt);
    }
  }

  throw lastError;
}

async function fetchTokensFromDeployedLogin(
  request: APIRequestContext,
  role: 'user' | 'admin' = 'user'
): Promise<E2ETokens> {
  const cached = readCachedDeployedToken(role);
  if (cached) return cached;

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

  const res = await postLoginWithRetries(request, url, {
    identifier: email,
    password,
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

  const tokens = { accessToken, refreshToken };
  writeCachedDeployedToken(role, tokens);
  return tokens;
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
