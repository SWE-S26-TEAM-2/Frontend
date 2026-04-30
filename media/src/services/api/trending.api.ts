/**
 * Trending API Service
 * Place at: services/api/trending.api.ts
 *
 * NOTE: Backend has no dedicated trending endpoints.
 * Using /feed/following as the data source for all three sliders.
 * TODO: Replace with dedicated endpoints once backend ships:
 *   - GET /feed/discover       (currently 404)
 *   - GET /tracks/curated      (not yet implemented)
 *   - GET /tracks/power        (not yet implemented)
 */

import { apiGet } from "./apiClient";
import type { ITrack } from "@/types/track.types";

// ── RAW FEED SHAPE ────────────────────────────────────────────────────────────

interface IRawFeedItem {
  track_id:         string;
  title:            string;
  description:      string | null;
  genre:            string | null;
  cover_image_url:  string | null;
  stream_url:       string | null;
  duration_seconds: number | null;
  play_count:       number;
  like_count:       number;
  comment_count:    number;
  is_liked:         boolean;
  created_at:       string;
  artist: {
    display_name:    string;
    profile_picture: string | null;
  };
}

interface IFeedResponse {
  items: IRawFeedItem[];
}

// ── ADAPTER ───────────────────────────────────────────────────────────────────

function adaptFeedItemToTrack(raw: IRawFeedItem): ITrack {
  return {
    id:            raw.track_id,
    title:         raw.title,
    artist:        raw.artist?.display_name ?? "Unknown Artist",
    albumArt:      raw.cover_image_url ?? "/default-track-cover.png",
    genre:         raw.genre ?? undefined,
    description:   raw.description ?? undefined,
    url:           raw.stream_url ?? "",
    duration:      raw.duration_seconds ?? 0,
    likes:         raw.like_count,
    plays:         raw.play_count,
    commentsCount: raw.comment_count,
    isLiked:       raw.is_liked,
    createdAt:     raw.created_at,
    updatedAt:     raw.created_at,
  };
}

// ── SHARED FETCH ──────────────────────────────────────────────────────────────

async function getFollowingFeed(limit = 20): Promise<ITrack[]> {
  try {
    const res = await apiGet<IFeedResponse>(`/feed/following?limit=${limit}`);
    return (res?.items ?? []).map(adaptFeedItemToTrack);
  } catch {
    return [];
  }
}

// ── API FUNCTIONS ─────────────────────────────────────────────────────────────

export const getCuratedTracksAPI  = (): Promise<ITrack[]> => getFollowingFeed(20);
export const getEmergingTracksAPI = (): Promise<ITrack[]> => getFollowingFeed(20);
export const getPowerPlaylistsAPI = (): Promise<ITrack[]> => getFollowingFeed(20);