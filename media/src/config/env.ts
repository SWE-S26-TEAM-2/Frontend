const DEFAULT_DEV_API_BASE = "http://localhost:8000/api";

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, "");

export const getApiBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (typeof window === "undefined") {
    // Inside Docker, use internal service URL to avoid external DNS resolution
    const internal = process.env.INTERNAL_API_URL?.trim();
    return trimTrailingSlash(internal || configured || DEFAULT_DEV_API_BASE);
  }

  if (!configured) {
    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    return isLocalhost ? DEFAULT_DEV_API_BASE : `${window.location.origin}/api`;
  }

  try {
    const url = new URL(configured, window.location.origin);
    if (window.location.protocol === "https:" && url.protocol === "http:") {
      url.protocol = "https:";
    }
    return trimTrailingSlash(url.toString());
  } catch {
    return trimTrailingSlash(configured);
  }
};

export const normalizeApiUrl = (url: string): string => {
  const raw = url.trim();
  if (typeof window === "undefined") return raw;

  try {
    const normalized = new URL(raw, window.location.origin);
    if (window.location.protocol === "https:" && normalized.protocol === "http:") {
      normalized.protocol = "https:";
    }
    return normalized.toString();
  } catch {
    return raw;
  }
};

export const ENV = {
  USE_MOCK_API: false as const,
  API_BASE_URL: getApiBaseUrl(),
};
