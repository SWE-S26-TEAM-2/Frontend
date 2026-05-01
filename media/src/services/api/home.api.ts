/**
 * Home Real API Service
 * Place at: services/api/home.api.ts
 */

import { ENV } from "@/config/env";
import type { IHomeService, IHomePageData, IArtist } from "@/types/home.types";
import type { ITrack } from "@/types/track.types";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

// ── HELPER ────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  const json: { success: boolean; data: T } = await res.json();
  return json.data;
}

// ── ADAPTER ───────────────────────────────────────────────────────────────────

function adaptTrack(raw: Record<string, unknown>): ITrack {
  return {
    id:            String(raw.track_id ?? raw.id ?? ""),
    title:         String(raw.title ?? "Untitled"),
    artist:        String(raw.display_name ?? raw.artist ?? "Unknown Artist"),
    albumArt:      "/default-track-cover.png",
    genre:         raw.genre ? String(raw.genre) : undefined,
    description:   raw.description ? String(raw.description) : undefined,
    url:           raw.file_url
                     ? String(raw.file_url).startsWith("http")
                       ? String(raw.file_url)
                       : `${BASE_URL}${raw.file_url}`
                     : "",
    duration:      Number(raw.duration_seconds ?? raw.duration ?? 0),
    likes:         Number(raw.likes ?? 0),
    plays:         Number(raw.play_count ?? raw.plays ?? 0),
    commentsCount: Number(raw.commentsCount ?? 0),
    isLiked:       Boolean(raw.isLiked ?? false),
    createdAt:     String(raw.release_date ?? raw.createdAt ?? new Date().toISOString()),
    updatedAt:     String(raw.updatedAt ?? new Date().toISOString()),
  };
}

function adaptUser(raw: Record<string, unknown>): IArtist {
  const pic = raw.profile_picture ? String(raw.profile_picture) : "";
  return {
    id:          String(raw.user_id ?? ""),
    name:        String(raw.display_name ?? ""),
    followers:   Number(raw.follower_count ?? 0).toLocaleString(),
    tracksCount: Number(raw.track_count ?? 0),
    imageUrl:    pic
                   ? pic.startsWith("http") ? pic : `${BASE_URL}${pic}`
                   : "/default-avatar.png",
    type: "artist",
  };
}

// ── REAL SERVICE ──────────────────────────────────────────────────────────────

export const realHomeService: IHomeService = {
  getHomePageData: async (): Promise<IHomePageData> => {
    try {
      const [historyRaw, recentRaw] = await Promise.all([
        apiFetch<Record<string, unknown>[]>("/users/me/listening-history").catch(() => []),
        apiFetch<Record<string, unknown>[]>("/users/me/recently-played").catch(() => []),
      ]);

      return {
        moreOfWhatYouLike: [],
        recentlyPlayed: recentRaw.map(raw => ({
          ...adaptTrack(raw),
          type: "track" as const,
          playedAt: raw.played_at ? String(raw.played_at) : undefined,
        })),
        mixedForUser:      [],
        discoverStations:  [],
        followSuggestions: [],
        listeningHistory:  historyRaw.slice(0, 3).map(adaptTrack),
      };
    } catch (error) {
      console.error("Home service failed:", error);
      return {
        moreOfWhatYouLike: [],
        recentlyPlayed:    [],
        mixedForUser:      [],
        discoverStations:  [],
        followSuggestions: [],
        listeningHistory:  [],
      };
    }
  },

  // ✅ add this
  refreshFollowSuggestions: async (): Promise<IArtist[]> => {
    try {
      const data = await apiFetch<{ users: Record<string, unknown>[] }>(
        "/search/users?keyword="
      );
      return (data?.users ?? []).slice(0, 4).map(adaptUser);
    } catch (error) {
      console.error("Refresh suggestions failed:", error);
      return [];
    }
  },
};