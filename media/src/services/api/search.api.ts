/**
 * Search Real API Service
 * Place at: services/api/search.api.ts
 */

import { ENV } from "@/config/env";
import { mockSearchService } from "@/services/mocks/search.mock";
import type { ITrack } from "@/types/track.types";
import type {
  ISearchResults,
  IRawSearchTrack,
  ISearchUser,
  ISearchPlaylist,
} from "@/types/search.types";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getToken(): string | null {
  return typeof window !== "undefined"
    ? window.localStorage.getItem("auth_token")
    : null;
}

function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Fetch helper — returns null (instead of throwing) on 401/403 so that
 * public pages don't surface auth errors to the user.
 */
async function apiFetch<T>(
  path: string,
  { requiresAuth = false }: { requiresAuth?: boolean } = {},
): Promise<T | null> {
  const token = getToken();

  // If the endpoint requires auth and we have no token, bail silently.
  if (requiresAuth && !token) return null;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 401 / 403 on a public page — not an error worth surfacing
  if (res.status === 401 || res.status === 403) {
    console.warn(`apiFetch: ${res.status} on ${path} — skipping (not logged in)`);
    return null;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: Array<{ msg: string }> })?.detail?.[0]?.msg ||
        `API error ${res.status}`,
    );
  }

  const json = await res.json();
  // Handle both { success, data: T } and bare T responses
  return (json?.data ?? json) as T;
}

// ── ADAPTER ───────────────────────────────────────────────────────────────────

function adaptTrack(raw: IRawSearchTrack): ITrack {
  const artistName =
    (raw as unknown as { display_name?: string }).display_name ??
    (raw as unknown as { artist?: { display_name?: string } }).artist?.display_name ??
    "Unknown Artist";

  const coverUrl =
    (raw as unknown as { cover_image_url?: string }).cover_image_url ?? "";

  const streamUrl =
    raw.file_url ??
    (raw as unknown as { stream_url?: string }).stream_url ??
    "";

  return {
    id:            raw.track_id,
    title:         raw.title,
    artist:        artistName,
    albumArt:      coverUrl
      ? coverUrl.startsWith("http") ? coverUrl : `${BASE_URL}${coverUrl}`
      : "",
    genre:         raw.genre ?? undefined,
    description:   raw.description ?? undefined,
    url:           streamUrl
      ? streamUrl.startsWith("http") ? streamUrl : `${BASE_URL}${streamUrl}`
      : "",
    duration:      raw.duration_seconds ?? 0,
    likes:         (raw as unknown as { like_count?: number }).like_count ?? 0,
    plays:         raw.play_count,
    commentsCount: (raw as unknown as { comment_count?: number }).comment_count ?? 0,
    isLiked:       false,
    createdAt:     raw.release_date ?? new Date().toISOString(),
    updatedAt:     new Date().toISOString(),
  };
}

// ── REAL SERVICE ──────────────────────────────────────────────────────────────

export const realSearchService = {
  async searchTracks(keyword: string): Promise<ITrack[]> {
    if (!keyword.trim()) return [];

    const data = await apiFetch<{ tracks?: IRawSearchTrack[] } | IRawSearchTrack[]>(
      `/search/tracks?keyword=${encodeURIComponent(keyword.trim())}`,
    );
    if (!data) return [];

    const tracks: IRawSearchTrack[] = Array.isArray(data)
      ? data
      : (data as { tracks?: IRawSearchTrack[] }).tracks ?? [];

    return tracks.map(adaptTrack);
  },

  /**
   * User search requires auth — returns [] silently on public pages.
   */
  async searchUsers(keyword: string): Promise<ISearchUser[]> {
    if (!isAuthenticated()) return [];

    const data = await apiFetch<{ users?: ISearchUser[] } | ISearchUser[]>(
      `/search/users?keyword=${encodeURIComponent(keyword.trim())}`,
      { requiresAuth: true },
    );
    if (!data) return [];

    return Array.isArray(data)
      ? (data as ISearchUser[])
      : (data as { users?: ISearchUser[] }).users ?? [];
  },

  /**
   * Playlist search — also guarded; some backends require auth here too.
   */
  async searchPlaylists(keyword: string): Promise<ISearchPlaylist[]> {
    if (!keyword.trim()) return [];

    const data = await apiFetch<{ playlists?: ISearchPlaylist[] } | ISearchPlaylist[]>(
      `/search/playlists?keyword=${encodeURIComponent(keyword.trim())}`,
    );
    if (!data) return [];

    return Array.isArray(data)
      ? (data as ISearchPlaylist[])
      : (data as { playlists?: ISearchPlaylist[] }).playlists ?? [];
  },

  async searchAll(keyword: string): Promise<ISearchResults> {
    if (!keyword.trim()) return { tracks: [], users: [], playlists: [] };

    // Run all three in parallel; each one handles its own auth guard
    const [tracks, users, playlists] = await Promise.all([
      realSearchService.searchTracks(keyword),
      realSearchService.searchUsers(keyword),
      realSearchService.searchPlaylists(keyword),
    ]);

    return { tracks, users, playlists };
  },
};

// ── DI EXPORT ─────────────────────────────────────────────────────────────────

export const searchService = ENV.USE_MOCK_API
  ? mockSearchService
  : realSearchService;

// ── URL UTILS ─────────────────────────────────────────────────────────────────

export function resolveAvatarUrl(profilePicture: string | null): string {
  if (!profilePicture) return "/default-avatar.png";
  if (profilePicture.startsWith("http")) return profilePicture;
  return `${BASE_URL}${profilePicture}`;
}

export function resolvePlaylistCover(coverPhoto: string | null): string {
  if (!coverPhoto) return "/cc.jpg";
  if (coverPhoto.startsWith("http")) return coverPhoto;
  return `${BASE_URL}${coverPhoto}`;
}