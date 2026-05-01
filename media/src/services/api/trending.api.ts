/**
 * Trending API Service
 * Uses /feed/discover — the curated discovery feed.
 * /tracks/curated, /tracks/emerging, /tracks/power do not exist in the backend;
 * all three sliders pull from the same discover feed for now.
 */

import { apiGet } from "./apiClient";
import type { ITrack } from "@/types/track.types";

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

async function getDiscoverFeed(limit = 20): Promise<ITrack[]> {
  try {
    const res = await apiGet<IFeedResponse>(`/feed/discover?limit=${limit}`);
    return (res?.items ?? []).map(adaptFeedItemToTrack);
  } catch {
    return [];
  }
}

export const getCuratedTracksAPI  = (): Promise<ITrack[]> => getDiscoverFeed(20);
export const getEmergingTracksAPI = (): Promise<ITrack[]> => getDiscoverFeed(20);
export const getPowerPlaylistsAPI = (): Promise<ITrack[]> => getDiscoverFeed(20);
