import { ENV } from "@/config/env";
import type { ITrack } from "@/types/track.types";
import type { IStation, IStationService } from "@/types/station.types";
import { apiGet } from "./apiClient";
import { apiPost, apiDelete } from "./apiClient";
const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

// ── RAW SHAPE (matches ListeningHistoryItem from /users/me/listening-history and /recently-played) ──
type IRawHistoryItem = {
  track_id?:         string;
  title?:            string;
  artist_name?:      string;   // was incorrectly "artist" / "display_name"
  cover_image_url?:  string;   // was incorrectly "cover_image"
  stream_url?:       string;   // was incorrectly "file_url"
  genre?:            string;
  duration_seconds?: number;
  play_count?:       number;
  played_at?:        string;
};

function adaptHistoryItemToStation(raw: IRawHistoryItem, index: number): IStation {
  const coverArt = raw.cover_image_url
    ? raw.cover_image_url.startsWith("http")
      ? raw.cover_image_url
      : `${BASE_URL}${raw.cover_image_url}`
    : "/cc.jpg";

  const url = raw.stream_url
    ? raw.stream_url.startsWith("http")
      ? raw.stream_url
      : `${BASE_URL}${raw.stream_url}`
    : "";

  const track: ITrack = {
    id:            raw.track_id ?? `station-${index}`,
    title:         raw.title ?? "Untitled",
    artist:        raw.artist_name ?? "Unknown Artist",
    albumArt:      coverArt,
    genre:         raw.genre ?? undefined,
    url,
    duration:      raw.duration_seconds ?? 0,
    likes:         0,
    plays:         raw.play_count ?? 0,
    commentsCount: 0,
    isLiked:       false,
    createdAt:     raw.played_at ?? new Date().toISOString(),
    updatedAt:     new Date().toISOString(),
  };

  return {
    id:         `station-${track.id}`,
    name:       `Based on ${track.title}`,
    artistName: `${track.artist} Station`,
    coverArt:   track.albumArt,
    seedTrack:  track,
    isLiked:    true,
    genre:      track.genre,
  };
}

function dedup(items: IRawHistoryItem[]): IRawHistoryItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = item.track_id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export const realStationService: IStationService = {
  async getLikedStations(): Promise<IStation[]> {
    try {
      const raw = await apiGet<IRawHistoryItem[]>(`${process.env.NEXT_PUBLIC_API_URL}/users/me/listening-history`);
      return dedup(raw ?? []).map(adaptHistoryItemToStation);
    } catch (error) {
      console.error("getLikedStations failed:", error);
      return [];
    }
  },

  async getDiscoverStations(): Promise<IStation[]> {
    try {
      const raw = await apiGet<IRawHistoryItem[]>("/users/me/recently-played?limit=20");
      return dedup(raw ?? []).map(adaptHistoryItemToStation);
    } catch (error) {
      console.warn("getDiscoverStations: /users/me/recently-played unavailable:", error);
      return [];
    }
  },

  async toggleLike(stationId: string, isLiked: boolean): Promise<void> {
  // stationId is "station-{track_id}" — extract the track_id
  const trackId = stationId.replace(/^station-/, "");
  try {
    if (isLiked) {
      await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/likes/tracks/${trackId}`);
    } else {
      await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/likes/tracks/${trackId}`);
    }
  } catch (error) {
    console.error("toggleLike failed:", error);
  }
},
};
