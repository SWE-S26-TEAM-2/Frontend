/**
 * Shared API client for all real service files.
 * Handles: Bearer token injection, {success, data} envelope unwrapping, 401 auto-refresh.
 */

import { ENV } from "@/config/env";

// ── Token helpers (SSR-safe) ────────────────────────────────────────────────
const getAccessToken = (): string | null =>
  typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;

const getRefreshToken = (): string | null =>
  typeof window !== "undefined" ? window.localStorage.getItem("refresh_token") : null;

const saveTokens = (access: string, refresh: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("auth_token", access);
  window.localStorage.setItem("refresh_token", refresh);
};

const clearTokens = () => {
  if (typeof window === "undefined") return;
  ["auth_token", "refresh_token", "auth_user_id", "auth_username"].forEach((k) =>
    window.localStorage.removeItem(k)
  );
};

// ── Token refresh (calls backend directly to avoid circular imports) ─────────
let isRefreshing = false;

async function doRefresh(): Promise<string> {
  if (isRefreshing) throw new Error("Already refreshing");
  isRefreshing = true;
  try {
    const res = await fetch(`${ENV.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: getRefreshToken() }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const json = await res.json();
    const { access_token: accessToken, refresh_token: refreshToken } = json.data;
    saveTokens(accessToken, refreshToken);
    return accessToken;
  } finally {
    isRefreshing = false;
  }
}

// ── Core request function ────────────────────────────────────────────────────
interface IApiOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(url: string, options: IApiOptions = {}): Promise<T> {
  const { skipAuth = false, headers: extraHeaders, ...rest } = options;

  const buildHeaders = (token: string | null): Record<string, string> => {
    const h: Record<string, string> = {};
    if (!skipAuth && token) h["Authorization"] = `Bearer ${token}`;
    // Merge caller-supplied headers (don't override Content-Type if already set)
    if (extraHeaders) {
      Object.assign(h, extraHeaders instanceof Headers ? Object.fromEntries(extraHeaders) : extraHeaders);
    }
    return h;
  };

  // First attempt
  let token = getAccessToken();
  let res = await fetch(url, { ...rest, headers: buildHeaders(token) });

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    try {
      token = await doRefresh();
      res = await fetch(url, { ...rest, headers: buildHeaders(token) });
    } catch {
      clearTokens();
      // Redirect to login if in browser
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.detail || errBody?.message || res.statusText || "Request failed");
  }

  const json = await res.json();
  // Unwrap backend's {success, data} envelope
  return (json?.data ?? json) as T;
}

// ── Convenience methods ──────────────────────────────────────────────────────
export const apiGet = <T>(url: string, opts?: IApiOptions): Promise<T> =>
  request<T>(url, { method: "GET", ...opts });

export const apiPost = <T>(url: string, body?: unknown, opts?: IApiOptions): Promise<T> =>
  request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts?.headers as object) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

export const apiPatch = <T>(url: string, body?: unknown, opts?: IApiOptions): Promise<T> =>
  request<T>(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(opts?.headers as object) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

export const apiPut = <T>(url: string, body?: unknown, opts?: IApiOptions): Promise<T> =>
  request<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(opts?.headers as object) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

export const apiDelete = <T = void>(url: string, opts?: IApiOptions): Promise<T> =>
  request<T>(url, { method: "DELETE", ...opts });
