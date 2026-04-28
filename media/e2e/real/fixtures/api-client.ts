/**
 * Shared real-backend API client for chromium-real specs.
 *
 * Wraps the global `fetch` and:
 *   - resolves base URL from BACKEND_URL (default http://localhost:8000)
 *   - injects Authorization: Bearer <token> from storageState.json
 *     when no explicit token is passed
 *   - exposes a few typed convenience methods (register/login/me/etc.)
 *
 * Specs SHOULD prefer this client for any backend-only seed work (creating
 * tracks, fetching play counts, etc.) so credentials are centrally managed.
 */

import { promises as fs } from 'node:fs';
import { REAL_STORAGE_STATE } from '../storage-state-path';

export const BACKEND_URL = (
  process.env.BACKEND_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');
export const API_BASE = `${BACKEND_URL}/api`;

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  raw: Response;
}

interface StorageOriginEntry {
  origin: string;
  localStorage: Array<{ name: string; value: string }>;
}
interface StorageStateFile {
  cookies: unknown[];
  origins: StorageOriginEntry[];
}

let cachedToken: string | null | undefined = undefined;
let cachedSeedUser: {
  email: string;
  username: string;
  password: string;
  refresh_token: string | null;
} | null = null;

async function loadStorageState(): Promise<StorageStateFile | null> {
  try {
    const txt = await fs.readFile(REAL_STORAGE_STATE, 'utf8');
    return JSON.parse(txt) as StorageStateFile;
  } catch {
    return null;
  }
}

export async function getSeedToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  const state = await loadStorageState();
  if (!state) {
    cachedToken = null;
    return null;
  }
  for (const origin of state.origins ?? []) {
    for (const entry of origin.localStorage ?? []) {
      if (entry.name === 'auth_token' && entry.value) {
        cachedToken = entry.value;
        return cachedToken;
      }
      if (entry.name === 'e2e_real_user' && entry.value) {
        try {
          cachedSeedUser = JSON.parse(entry.value);
        } catch {
          /* ignore */
        }
      }
    }
  }
  cachedToken = null;
  return null;
}

export async function getSeedUser(): Promise<typeof cachedSeedUser> {
  if (cachedSeedUser) return cachedSeedUser;
  await getSeedToken(); // populates cachedSeedUser as a side effect
  return cachedSeedUser;
}

export async function isStorageStateAuthenticated(): Promise<boolean> {
  const token = await getSeedToken();
  return Boolean(token);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(
  pathOrUrl: string,
  query?: RequestOptions['query']
): string {
  const url = pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${API_BASE}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
  if (!query) return url;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  if (!qs) return url;
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
}

export async function apiRequest<T = unknown>(
  pathOrUrl: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {}, query } = options;
  const token =
    options.token === undefined ? await getSeedToken() : options.token;

  const finalHeaders: Record<string, string> = { ...headers };
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] =
      finalHeaders['Content-Type'] ?? 'application/json';
  }

  const init: RequestInit = {
    method,
    headers: finalHeaders,
  };
  if (body !== undefined) {
    init.body =
      body instanceof FormData
        ? (body as unknown as BodyInit)
        : JSON.stringify(body);
  }

  const raw = await fetch(buildUrl(pathOrUrl, query), init);
  let data: T | null = null;
  const contentType = raw.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      data = (await raw.json()) as T;
    } catch {
      data = null;
    }
  }
  return { ok: raw.ok, status: raw.status, data, raw };
}

// ── High-level helpers ────────────────────────────────────────────────────

export async function apiGetMe(token?: string): Promise<ApiResponse> {
  return apiRequest('/users/me', { token });
}

export async function apiRegister(payload: {
  email: string;
  username: string;
  password: string;
}): Promise<ApiResponse> {
  return apiRequest('/auth/register', { method: 'POST', body: payload, token: null });
}

export async function apiLogin(payload: {
  identifier: string;
  password: string;
}): Promise<ApiResponse<{
  access_token?: string;
  refresh_token?: string;
  token?: string;
}>> {
  return apiRequest('/auth/login', { method: 'POST', body: payload, token: null });
}

export async function apiRefresh(refreshToken: string): Promise<ApiResponse> {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
    token: null,
  });
}

export async function apiLogout(token: string): Promise<ApiResponse> {
  return apiRequest('/auth/logout', { method: 'POST', token });
}

export async function apiSearchTracks(
  keyword: string
): Promise<ApiResponse<unknown[]>> {
  return apiRequest('/search/tracks', { query: { keyword } });
}

export async function apiCreatePlaylist(payload: {
  name: string;
  is_private?: boolean;
}): Promise<ApiResponse<{ id?: string }>> {
  return apiRequest('/playlists/', { method: 'POST', body: payload });
}

export async function apiDeletePlaylist(id: string): Promise<ApiResponse> {
  return apiRequest(`/playlists/${id}`, { method: 'DELETE' });
}

export async function apiUploadTrackMultipart(
  audio: { name: string; mime: string; buffer: Buffer | Uint8Array },
  metadata: { title: string; description?: string; genre?: string }
): Promise<ApiResponse<{ id?: string }>> {
  const fd = new FormData();
  // Cast Node Buffer/Uint8Array to a Blob via the Web FormData polyfill.
  const blob = new Blob([new Uint8Array(audio.buffer)], { type: audio.mime });
  fd.append('audio', blob, audio.name);
  fd.append('title', metadata.title);
  if (metadata.description) fd.append('description', metadata.description);
  if (metadata.genre) fd.append('genre', metadata.genre);
  return apiRequest('/tracks/', { method: 'POST', body: fd });
}
