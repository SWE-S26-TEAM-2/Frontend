/**
 * Feed Real API Service
 * Place at: services/api/feed.api.ts
 */

import { ENV } from "@/config/env";
import { mockFeedService } from "@/services/mocks/feed.mock";
import type { ITrack } from "@/types/track.types";
import type { IArtist } from "@/types/home.types";
import type {
  IFeedService,
  IFeedPageData,
  IRawFeedTrack,
  IRawFeedUser,
  IRawHistoryEntry,
} from "@/types/feed.types";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

// ── HELPERS ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json: { success: boolean; data: T } = await res.json();
  return json.data;
}

// ── ADAPTERS ──────────────────────────────────────────────────────────────────

function adaptTrack(raw: IRawFeedTrack | IRawHistoryEntry): ITrack {
  return {
    id:            raw.track_id,
    title:         raw.title,
    artist:        "Unknown Artist",
    albumArt:      "/default-track-cover.png",
    genre:         raw.genre ?? undefined,
    description:   raw.description ?? undefined,
    url:           raw.file_url.startsWith("http")
                     ? raw.file_url
                     : `${BASE_URL}${raw.file_url}`,
    duration:      raw.duration_seconds ?? 0,
    likes:         0,
    plays:         raw.play_count,
    commentsCount: 0,
    isLiked:       false,
    createdAt:     raw.release_date ?? new Date().toISOString(),
    updatedAt:     new Date().toISOString(),
  };
}

function adaptUser(raw: IRawFeedUser): IArtist {
  return {
    id:          raw.user_id,
    name:        raw.display_name,
    followers:   raw.follower_count.toLocaleString(),
    tracksCount: raw.track_count,
    imageUrl:    raw.profile_picture
                   ? raw.profile_picture.startsWith("http")
                     ? raw.profile_picture
                     : `${BASE_URL}${raw.profile_picture}`
                   : "/default-avatar.png",
    type: "artist",
  };
}

// ── REAL SERVICE ──────────────────────────────────────────────────────────────

export const realFeedService: IFeedService = {
  async getFeedPageData(): Promise<IFeedPageData> {
    try {
      const [historyData, suggestionsData, recentData] = await Promise.all([
        apiFetch<IRawHistoryEntry[]>("/users/me/listening-history").catch(() => []),
        apiFetch<{ users: IRawFeedUser[] }>("/search/users?keyword=").catch(() => ({ users: [] })),
        apiFetch<IRawFeedTrack[]>("/users/me/recently-played").catch(() => []),
      ]);

      return {
        feedTracks:        (recentData ?? []).map(adaptTrack),
        followSuggestions: (suggestionsData?.users ?? []).slice(0, 4).map(adaptUser),
        listeningHistory:  (historyData ?? []).slice(0, 3).map(adaptTrack),
      };
    } catch (error) {
      console.error("Feed service failed:", error);
      return { feedTracks: [], followSuggestions: [], listeningHistory: [] };
    }
  },

  async refreshFollowSuggestions(): Promise<IArtist[]> {
    try {
      const data = await apiFetch<{ users: IRawFeedUser[] }>("/search/users?keyword=");
      return (data?.users ?? []).slice(0, 4).map(adaptUser);
    } catch (error) {
      console.error("Refresh suggestions failed:", error);
      return [];
    }
  },
};

// ── DI EXPORT ─────────────────────────────────────────────────────────────────

export const feedService: IFeedService = ENV.USE_MOCK_API
  ? mockFeedService
  : realFeedService;