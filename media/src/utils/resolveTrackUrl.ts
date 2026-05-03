import { ENV } from "@/config/env";

/**
 * resolveTrackUrl — converts a track URL to an absolute URL.
 *
 * - If the URL is already absolute (starts with http/https), return as-is.
 * - If the URL is a relative path, prepend the API base URL.
 * - If the URL is empty/null, construct a streaming URL from the trackId.
 */
export function resolveTrackUrl(url: string | undefined, trackId: string): string {
  if (!url) {
    return `${ENV.API_BASE_URL}/tracks/${trackId}/stream`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Relative path — prepend API base
  return `${ENV.API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}
