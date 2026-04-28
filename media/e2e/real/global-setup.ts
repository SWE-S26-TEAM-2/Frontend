/**
 * Playwright global setup for the chromium-real project.
 *
 * Registers (or reuses) a fresh user against the live FastAPI backend
 * and writes a storageState.json file containing:
 *   - localStorage `auth_token`
 *   - any HttpOnly cookies returned by /auth/login
 *
 * The file path is exported as REAL_STORAGE_STATE from playwright.config.ts
 * and consumed by chromium-real via `use.storageState`.
 *
 * Environment variables:
 *   BACKEND_URL                 - FastAPI base URL, default http://localhost:8000
 *                                 ROUTES live under {BACKEND_URL}/api/* because
 *                                 the backend mounts root_path="/api".
 *   E2E_REAL_USER_EMAIL         - Optional: reuse a pre-provisioned account.
 *   E2E_REAL_USER_USERNAME      - Optional: pre-provisioned username.
 *   E2E_REAL_USER_PASSWORD      - Optional: pre-provisioned password.
 *   TEST_VERIFY_TOKEN_OVERRIDE  - Optional: known verification token to feed to
 *                                 /auth/verify-email when the account is freshly
 *                                 registered. When neither this nor a
 *                                 VERIFICATION_BACKDOOR endpoint are available,
 *                                 setup logs a warning and writes a placeholder
 *                                 storageState (real-API tests should test.skip).
 *   VERIFICATION_BACKDOOR       - Optional: URL of a test-only endpoint that
 *                                 returns the most-recent verification token for
 *                                 a given email. Format must be
 *                                 GET <url>?email=<email> -> { token: string }
 *
 * NOTE: This setup is best-effort. If the backend is unreachable we still write
 *       a minimal storageState file so the rest of Playwright bootstrap can
 *       proceed; real tests guard themselves with isStorageStateAuthenticated().
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { FullConfig } from '@playwright/test';
import { REAL_STORAGE_STATE } from './storage-state-path';

interface CookieEntry {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

interface StorageStateFile {
  cookies: CookieEntry[];
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
}

const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  ''
);
const API_BASE = `${BACKEND_URL}/api`;
const FRONTEND_ORIGIN = 'http://127.0.0.1:3101';

function uniqueSuffix(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function defaultCredentials() {
  const suffix = uniqueSuffix();
  return {
    email:
      process.env.E2E_REAL_USER_EMAIL ?? `pw-real-${suffix}@example.com`,
    username:
      process.env.E2E_REAL_USER_USERNAME ?? `pwreal${suffix.slice(0, 10)}`,
    password: process.env.E2E_REAL_USER_PASSWORD ?? 'PwReal1Pass!',
  };
}

function cookieHeaderToEntries(
  cookieHeaders: string[],
  domain: string
): CookieEntry[] {
  const out: CookieEntry[] = [];
  for (const header of cookieHeaders) {
    const [pair, ...attrs] = header.split(';').map((p) => p.trim());
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const name = pair.slice(0, eq);
    const value = pair.slice(eq + 1);
    let cPath = '/';
    let httpOnly = false;
    let secure = false;
    let sameSite: CookieEntry['sameSite'] = 'Lax';
    let expires = -1;
    for (const attr of attrs) {
      const [k, v] = attr.split('=').map((p) => p.trim());
      const key = k.toLowerCase();
      if (key === 'path' && v) cPath = v;
      if (key === 'httponly') httpOnly = true;
      if (key === 'secure') secure = true;
      if (key === 'samesite' && v) {
        const norm = v.toLowerCase();
        if (norm === 'strict') sameSite = 'Strict';
        else if (norm === 'none') sameSite = 'None';
        else sameSite = 'Lax';
      }
      if (key === 'expires' && v) {
        const t = Date.parse(v);
        if (!isNaN(t)) expires = Math.floor(t / 1000);
      }
      if (key === 'max-age' && v) {
        expires = Math.floor(Date.now() / 1000) + parseInt(v, 10);
      }
    }
    out.push({
      name,
      value,
      domain,
      path: cPath,
      expires,
      httpOnly,
      secure,
      sameSite,
    });
  }
  return out;
}

function extractSetCookies(headers: Headers): string[] {
  // node fetch combines Set-Cookie headers with commas which is wrong - but
  // most stacks return one. Try a few strategies.
  const raw =
    typeof (headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie === 'function'
      ? (
          headers as unknown as { getSetCookie: () => string[] }
        ).getSetCookie()
      : headers.get('set-cookie')
        ? [headers.get('set-cookie') as string]
        : [];
  return raw;
}

async function postJson<T = unknown>(
  url: string,
  body: unknown,
  extraHeaders: Record<string, string> = {}
): Promise<{ ok: boolean; status: number; data: T | null; headers: Headers }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  });
  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    /* ignore */
  }
  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

async function probeMe(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchVerificationToken(
  email: string
): Promise<string | null> {
  if (process.env.TEST_VERIFY_TOKEN_OVERRIDE) {
    return process.env.TEST_VERIFY_TOKEN_OVERRIDE;
  }
  if (process.env.VERIFICATION_BACKDOOR) {
    try {
      const res = await fetch(
        `${process.env.VERIFICATION_BACKDOOR}?email=${encodeURIComponent(email)}`
      );
      if (!res.ok) return null;
      const body = (await res.json()) as { token?: string };
      return body?.token ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

async function writeStorageState(
  state: StorageStateFile
): Promise<void> {
  await fs.mkdir(path.dirname(REAL_STORAGE_STATE), { recursive: true });
  await fs.writeFile(REAL_STORAGE_STATE, JSON.stringify(state, null, 2));
}

async function readExistingState(): Promise<StorageStateFile | null> {
  try {
    const txt = await fs.readFile(REAL_STORAGE_STATE, 'utf8');
    return JSON.parse(txt) as StorageStateFile;
  } catch {
    return null;
  }
}

function tokenFromState(state: StorageStateFile): string | null {
  for (const origin of state.origins ?? []) {
    for (const entry of origin.localStorage ?? []) {
      if (entry.name === 'auth_token' && entry.value) return entry.value;
    }
  }
  return null;
}

function placeholderState(): StorageStateFile {
  return {
    cookies: [],
    origins: [
      {
        origin: FRONTEND_ORIGIN,
        localStorage: [
          { name: 'auth_token', value: '' },
          { name: 'e2e_real_setup_status', value: 'no-backend' },
        ],
      },
    ],
  };
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  // Skip entirely if only mock projects are scheduled (no chromium-real in
  // selected projects). This keeps `npm run test:e2e -- --project=chromium-mock`
  // free of any backend dependency.
  const willRunReal = config.projects.some((p) => p.name === 'chromium-real');
  if (!willRunReal) {
    console.log('[real-setup] chromium-real not selected, skipping setup.');
    return;
  }

  console.log(`[real-setup] Backend: ${BACKEND_URL}`);

  // Idempotency: if existing state still answers /users/me, keep it.
  const existing = await readExistingState();
  if (existing) {
    const token = tokenFromState(existing);
    if (token && (await probeMe(token))) {
      console.log('[real-setup] storageState already valid, skipping.');
      return;
    }
  }

  const creds = defaultCredentials();

  // Step 1: register (idempotent: 409 means user already exists, that's OK).
  let registerResp = await postJson<{ user_id?: string }>(
    `${API_BASE}/auth/register`,
    {
      email: creds.email,
      username: creds.username,
      password: creds.password,
    }
  ).catch((err) => {
    console.warn(`[real-setup] register network error: ${String(err)}`);
    return null;
  });

  if (registerResp == null) {
    console.warn(
      '[real-setup] Backend unreachable - writing placeholder storageState. ' +
        'Real-API tests will skip themselves until BACKEND_URL is reachable.'
    );
    await writeStorageState(placeholderState());
    return;
  }

  if (
    !registerResp.ok &&
    registerResp.status !== 409 &&
    registerResp.status !== 400
  ) {
    console.warn(
      `[real-setup] register returned ${registerResp.status}. Continuing best-effort.`
    );
  }

  // Step 2: try to verify email if registration was fresh.
  if (registerResp.ok || registerResp.status === 200) {
    const verifyToken = await fetchVerificationToken(creds.email);
    if (verifyToken) {
      const v = await postJson(`${API_BASE}/auth/verify-email`, {
        token: verifyToken,
      }).catch(() => null);
      if (!v?.ok) {
        console.warn(
          `[real-setup] /auth/verify-email failed (status ${v?.status}). Continuing.`
        );
      }
    } else {
      console.warn(
        '[real-setup] No TEST_VERIFY_TOKEN_OVERRIDE / VERIFICATION_BACKDOOR set; ' +
          'fresh users may be unverified. Set one of these env vars to enable ' +
          'auth-real verification flows.'
      );
    }
  }

  // Step 3: login and harvest token + cookies.
  const loginResp = await postJson<{
    access_token?: string;
    token?: string;
    refresh_token?: string;
  }>(`${API_BASE}/auth/login`, {
    identifier: creds.email,
    password: creds.password,
  }).catch((err) => {
    console.warn(`[real-setup] login network error: ${String(err)}`);
    return null;
  });

  if (!loginResp || !loginResp.ok) {
    console.warn(
      `[real-setup] /auth/login failed (status=${loginResp?.status}). ` +
        'Writing placeholder storageState so test runner does not crash. ' +
        'Real-API tests will skip themselves.'
    );
    await writeStorageState(placeholderState());
    return;
  }

  const data = loginResp.data ?? {};
  const accessToken = data.access_token ?? data.token ?? '';
  const cookieHeaders = extractSetCookies(loginResp.headers);
  const backendHost = new URL(BACKEND_URL).hostname;
  const cookies = cookieHeaderToEntries(cookieHeaders, backendHost);

  const state: StorageStateFile = {
    cookies,
    origins: [
      {
        origin: FRONTEND_ORIGIN,
        localStorage: [
          { name: 'auth_token', value: accessToken },
          {
            name: 'e2e_real_user',
            value: JSON.stringify({
              email: creds.email,
              username: creds.username,
              password: creds.password,
              refresh_token: data.refresh_token ?? null,
            }),
          },
          { name: 'e2e_real_setup_status', value: 'ok' },
        ],
      },
    ],
  };
  await writeStorageState(state);
  console.log(
    `[real-setup] Authenticated as ${creds.username} (${creds.email}). storageState written.`
  );
}
