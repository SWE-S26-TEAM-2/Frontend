/**
 * Feed Real API Service
 * Place at: services/api/feed.api.ts
 */

import axios from "axios";
import { ENV } from "@/config/env";
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

function adaptFeedTrack(raw: IRawFeedTrack): ITrack {
  return {
    id:            raw.track_id,
    title:         raw.title,
    artist:        raw.artist.display_name,
    albumArt:      raw.cover_image_url
                     ? raw.cover_image_url.startsWith("http")
                       ? raw.cover_image_url
                       : `${BASE_URL}${raw.cover_image_url}`
                     : "/default-track-cover.png",
    genre:         raw.genre ?? undefined,
    description:   raw.description ?? undefined,
    url:           raw.stream_url.startsWith("http")
                     ? raw.stream_url
                     : `${BASE_URL}${raw.stream_url}`,
    duration:      raw.duration_seconds ?? 0,
    likes:         raw.like_count,
    plays:         raw.play_count,
    commentsCount: raw.comment_count,
    isLiked:       raw.is_liked,
    createdAt:     raw.created_at,
    updatedAt:     raw.created_at,
  };
}

function adaptHistoryTrack(raw: IRawHistoryEntry): ITrack {
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
                   : "",
    type:        "artist",
  };
}

// ── REAL SERVICE ──────────────────────────────────────────────────────────────

export const realFeedService: IFeedService = {
  async getFeedPageData(): Promise<IFeedPageData> {
    try {
      const [feedRes, historyRes, suggestionsRes] = await Promise.all([
        axios.get(`${BASE_URL}/feed/following`, { params: { limit: 20 } }),
        axios.get(`${BASE_URL}/users/me/listening-history`),
        axios.get(`${BASE_URL}/search/users`, { params: { keyword: "" } }),
      ]);

      // Feed tracks from the new endpoint
      const rawFeed: IRawFeedTrack[] = feedRes.data?.data?.items ?? [];
      const feedTracks = rawFeed.map(adaptFeedTrack);

      // History — last 3 entries for the sidebar
      const rawHistory: IRawHistoryEntry[] = historyRes.data?.data ?? [];
      const listeningHistory = rawHistory.slice(0, 3).map(adaptHistoryTrack);

      // Follow suggestions
      const rawUsers: IRawFeedUser[] = suggestionsRes.data?.data?.users ?? [];
      const followSuggestions = rawUsers.slice(0, 4).map(adaptUser);

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