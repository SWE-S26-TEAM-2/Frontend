/**
 * Station Real API Service
 * Place at: services/api/stations.api.ts
 */

import axios from "axios";
import { ENV } from "@/config/env";
import type { ITrack } from "@/types/track.types";
import type { IStation, IStationService } from "@/types/station.types";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

// ── ADAPTER ───────────────────────────────────────────────────────────────────
// Stations are derived from listening history — each unique track in history
// becomes a station seeded by that track.
type IRawTrack = {
  track_id?: string;
  id?: string;
  title?: string;
  artist?: string;
  display_name?: string;
  cover_image?: string;
  genre?: string;
  description?: string;
  file_url?: string;
  duration_seconds?: number;
  play_count?: number;
  release_date?: string;
};



function adaptTrackToStation(raw: IRawTrack, index: number): IStation{
  const track: ITrack = {
    id:            raw.track_id   ?? raw.id ?? `station-${index}`,
    title:         raw.title      ?? "Untitled",
    artist:        raw.artist     ?? raw.display_name ?? "Unknown Artist",
    albumArt:      raw.cover_image
                     ? raw.cover_image.startsWith("http")
                       ? raw.cover_image
                       : `${BASE_URL}${raw.cover_image}`
                     : "/default-track-cover.png",
    genre:         raw.genre      ?? undefined,
    description:   raw.description ?? undefined,
    url:           raw.file_url
                     ? raw.file_url.startsWith("http")
                       ? raw.file_url
                       : `${BASE_URL}${raw.file_url}`
                     : "",
    duration:      raw.duration_seconds ?? 0,
    likes:         0,
    plays:         raw.play_count ?? 0,
    commentsCount: 0,
    isLiked:       false,
    createdAt:     raw.release_date ?? new Date().toISOString(),
    updatedAt:     new Date().toISOString(),
  
  
  
  };

  return {
    id:         `station-${track.id}`,
    name:       `Based on ${track.title}`,
    artistName: `${track.artist} Station`,
    coverArt:   track.albumArt,
    seedTrack:  track,
    isLiked:    true,  // all stations from history are considered liked
    genre:      track.genre,
  };
}

// ── REAL SERVICE ──────────────────────────────────────────────────────────────

export const realStationService: IStationService = {
  // Liked stations — derived from listening history
  async getLikedStations(): Promise<IStation[]> {
    try {
      const res = await axios.get(`${BASE_URL}/users/me/listening-history`);
const raw: IRawTrack[] = res.data?.data ?? [];
      // Deduplicate by track_id so we don't get duplicate stations
      const seen = new Set<string>();
      return raw
        .filter((item) => {
          const id = item.track_id ?? item.id;

if (!id) return false;
if (seen.has(id)) return false;

seen.add(id);
return true;
        })
        .map(adaptTrackToStation);
    } catch (error) {
      console.error("getLikedStations failed:", error);
      return [];
    }
  },

  // Discover stations for home page slider — also from history, genre-grouped
  async getDiscoverStations(): Promise<IStation[]> {
    try {
      const res = await axios.get(`${BASE_URL}/users/me/recently-played`);
const raw: IRawTrack[] = res.data?.data ?? [];
      const seen = new Set<string>();
      return raw
        .filter((item) => {
         const id = item.track_id ?? item.id;

if (!id) return false;
if (seen.has(id)) return false;

seen.add(id);
return true;
        })
        .map(adaptTrackToStation);
    } catch (error) {
      console.error("getDiscoverStations failed:", error);
      return [];
    }
  },

  async toggleLike(_stationId: string): Promise<void> {
    // TODO: add like/unlike station endpoint when backend supports it
  },
};

// ── DI EXPORT ─────────────────────────────────────────────────────────────────
// Add to services/index.ts:
//   import { mockStationService } from "./mocks/stations.mock";
//   import { realStationService } from "./api/stations.api";
//   export const stationService = ENV.USE_MOCK_API ? mockStationService : realStationService;

