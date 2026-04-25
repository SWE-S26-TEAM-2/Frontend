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
  IRawSearchUser,
  IRawSearchPlaylist,
} from "@/types/search.types";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

// ── ADAPTER: IRawSearchTrack → ITrack ─────────────────────────────────────────
// Maps raw API shape to ITrack so TrackCard works with zero changes.
// Fields not yet in the API are defaulted and marked with TODO.

function adaptTrack(raw: IRawSearchTrack): ITrack {
  return {
    id:           raw.track_id,
    title:        raw.title,
    artist:       "Unknown Artist", // TODO: backend to bundle display_name in track response
    albumArt:     "",               // TODO: backend to add cover_image field
    genre:        raw.genre ?? undefined,
    description:  raw.description ?? undefined,
    url:          raw.file_url.startsWith("http")
                    ? raw.file_url
                    : `${BASE_URL}${raw.file_url}`,
    duration:     raw.duration_seconds ?? 0,
    likes:        0,                // TODO: backend to add likes count
    plays:        raw.play_count,
    commentsCount: 0,               // TODO: backend to add comments count
    isLiked:      false,
    createdAt:    raw.release_date ?? new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
  };
}

// ── FETCH HELPER ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.[0]?.msg || `API error ${res.status}`);
  }

  const json: { success: boolean; data: T } = await res.json();
  return json.data;
}

// ── REAL SERVICE ──────────────────────────────────────────────────────────────

export const realSearchService = {
  async searchTracks(keyword: string): Promise<ITrack[]> {
    if (!keyword.trim()) return [];
    const data = await apiFetch<{ tracks: IRawSearchTrack[] }>(
      `/search/tracks?keyword=${encodeURIComponent(keyword.trim())}`
    );
    return (data.tracks ?? []).map(adaptTrack);
  },

  async searchUsers(keyword: string): Promise<IRawSearchUser[]> {
    if (!keyword.trim()) return [];
    const data = await apiFetch<{ users: IRawSearchUser[] }>(
      `/search/users?keyword=${encodeURIComponent(keyword.trim())}`
    );
    return data.users ?? [];
  },

  async searchPlaylists(keyword: string): Promise<IRawSearchPlaylist[]> {
    if (!keyword.trim()) return [];
    const data = await apiFetch<{ playlists: IRawSearchPlaylist[] }>(
      `/search/playlists?keyword=${encodeURIComponent(keyword.trim())}`
    );
    return data.playlists ?? [];
  },

  async searchAll(keyword: string): Promise<ISearchResults> {
    if (!keyword.trim()) return { tracks: [], users: [], playlists: [] };
    const [tracks, users, playlists] = await Promise.all([
      realSearchService.searchTracks(keyword),
      realSearchService.searchUsers(keyword),
      realSearchService.searchPlaylists(keyword),
    ]);
    return { tracks, users, playlists };
  },
};

// ── DI EXPORT ─────────────────────────────────────────────────────────────────
// Add to services/index.ts:
//   import { searchService } from "./api/search.api";
//   export { searchService };

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
  if (!coverPhoto) return "/default-track-cover.png";
  if (coverPhoto.startsWith("http")) return coverPhoto;
  return `${BASE_URL}${coverPhoto}`;
}