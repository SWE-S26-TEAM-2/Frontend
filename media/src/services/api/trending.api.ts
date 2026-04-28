/**
 * Trending API Service
 * Place at: services/api/trending.api.ts
 *
 * NOTE: The backend does not yet have dedicated trending endpoints.
 * These functions currently fall back to the mock data via di.ts wiring.
 * TODO: Replace with real endpoints once backend ships:
 *   - GET /tracks/curated
 *   - GET /tracks/emerging
 *   - GET /tracks/power (or /playlists/featured)
 */

import { ENV } from "@/config/env";
import type { ITrack } from "@/types/track.types";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  const json: { success: boolean; data: T } = await res.json();
  return json.data;
}

/**
 * TODO: Replace with real curated endpoint when backend ships it.
 * Currently falls back to mock via di.ts — ENV.USE_MOCK_API controls the switch.
 */
export const getCuratedTracksAPI = async (): Promise<ITrack[]> => {
  const data = await apiFetch<{ tracks: ITrack[] }>("/tracks?sort=curated&limit=20");
  return data.tracks ?? [];
};

/**
 * TODO: Replace with real emerging endpoint when backend ships it.
 * Currently falls back to mock via di.ts — ENV.USE_MOCK_API controls the switch.
 */
export const getEmergingTracksAPI = async (): Promise<ITrack[]> => {
  const data = await apiFetch<{ tracks: ITrack[] }>("/tracks?sort=emerging&limit=20");
  return data.tracks ?? [];
};

/**
 * TODO: Replace with real power playlists endpoint when backend ships it.
 * Currently falls back to mock via di.ts — ENV.USE_MOCK_API controls the switch.
 */
export const getPowerPlaylistsAPI = async (): Promise<ITrack[]> => {
  const data = await apiFetch<{ tracks: ITrack[] }>("/tracks?sort=popular&limit=20");
  return data.tracks ?? [];
};