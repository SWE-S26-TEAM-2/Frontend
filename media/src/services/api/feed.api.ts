/**
 * Feed Real API Service
 * Place at: services/api/feed.api.ts
 */

import axios from "axios";
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

// ── ADAPTERS ──────────────────────────────────────────────────────────────────

function adaptTrack(raw: IRawFeedTrack | IRawHistoryEntry): ITrack {
  return {
    id:            raw.track_id,
    title:         raw.title,
    artist:        "Unknown Artist", // TODO: backend to bundle display_name in track response
    albumArt:      "",               // TODO: backend to add cover_image field
    genre:         raw.genre ?? undefined,
    description:   raw.description ?? undefined,
    url:           raw.file_url.startsWith("http")
                     ? raw.file_url
                     : `${BASE_URL}${raw.file_url}`,
    duration:      raw.duration_seconds ?? 0,
    likes:         0,                // TODO: backend to add likes count
    plays:         raw.play_count,
    commentsCount: 0,                // TODO: backend to add comments count
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
                   : "",
    type:        "artist",
  };
}

// ── REAL SERVICE ──────────────────────────────────────────────────────────────

export const realFeedService: IFeedService = {
  async getFeedPageData(): Promise<IFeedPageData> {
    try {
      const [historyRes, suggestionsRes] = await Promise.all([
        axios.get(`${BASE_URL}/users/me/listening-history`),
        axios.get(`${BASE_URL}/search/users`, { params: { keyword: "" } }),
      ]);

      // History — last 3 entries only (for sidebar)
      const rawHistory: IRawHistoryEntry[] = historyRes.data?.data ?? [];
      const listeningHistory = rawHistory
        .slice(0, 3)
        .map(adaptTrack);

      // Follow suggestions
      const rawUsers: IRawFeedUser[] = suggestionsRes.data?.data?.users ?? [];
      const followSuggestions = rawUsers.slice(0, 4).map(adaptUser);

      // Feed tracks — recently played as feed content for now
      // TODO: replace with a dedicated /feed endpoint once backend adds it
      const recentRes = await axios.get(`${BASE_URL}/users/me/recently-played`);
      const rawFeed: IRawFeedTrack[] = recentRes.data?.data ?? [];
      const feedTracks = rawFeed.map(adaptTrack);

      return { feedTracks, followSuggestions, listeningHistory };
    } catch (error) {
      console.error("Feed service failed:", error);
      return { feedTracks: [], followSuggestions: [], listeningHistory: [] };
    }
  },

  async refreshFollowSuggestions(): Promise<IArtist[]> {
    try {
      const res = await axios.get(`${BASE_URL}/search/users`, {
        params: { keyword: "" },
      });
      const rawUsers: IRawFeedUser[] = res.data?.data?.users ?? [];
      return rawUsers.slice(0, 4).map(adaptUser);
    } catch (error) {
      console.error("Refresh suggestions failed:", error);
      return [];
    }
  },
};

// ── DI EXPORT ─────────────────────────────────────────────────────────────────
// Add to services/index.ts:
//   import { mockFeedService } from "./mocks/feed.mock";
//   import { realFeedService } from "./api/feed.api";
//   export const feedService = ENV.USE_MOCK_API ? mockFeedService : realFeedService;

