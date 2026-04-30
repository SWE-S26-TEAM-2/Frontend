import { apiGet } from "@/services/api/apiClient";
import type {
  ILibraryService,
  ILibraryOverview,
  ILibraryTrack,
  ILibraryPlaylist,
  ILibraryAlbum,
  ILibraryStation,
  ILibraryFollowing,
  ILibraryRecentItem
} from "@/types/library.types";
import { ENV } from "@/config/env";
import { mockLibraryService } from "@/services/mocks/library.mock";

const BASE = ENV.API_BASE_URL;

const getUsername = (): string =>
  typeof window !== "undefined"
    ? window.localStorage.getItem("auth_username") ?? ""
    : "";

  const resolveMediaUrl = (value: unknown): string | null => {
  if (!value || typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const origin = ENV.API_BASE_URL.replace(/\/api$/, "");
  return raw.startsWith("/") ? `${origin}${raw}` : `${origin}/${raw}`;
};

export const realLibraryService: ILibraryService = {

async getLikes(): Promise<ILibraryTrack[]> {
  const username = getUsername();
  if (!username) return [];
  const data = await apiGet<{ tracks?: Record<string, unknown>[] }>(
    `${BASE}/users/${username}/liked-tracks`,
  );
  const list = Array.isArray(data) ? data : (data.tracks ?? []);
  return list.map((t) => ({
    id:       String(t.track_id ?? ""),
    title:    String(t.title ?? ""),
    artist:   String(t.display_name ?? ""),
    coverUrl: resolveMediaUrl(t.cover_image_url),
    plays:    (t.play_count as number) ?? 0,
    likes:    0,   // not returned by this endpoint
    reposts:  0,   // not returned by this endpoint
    duration: t.duration_seconds ? String(t.duration_seconds) : undefined,
    genre:    t.genre ? String(t.genre) : undefined,
  }));
},
  async getPlaylists(): Promise<ILibraryPlaylist[]> {
    const username = getUsername();
    if (!username) return [];
    const data = await apiGet<Record<string, unknown>[]>(
      `${BASE}/users/${username}/playlists`,
    );
    const list = Array.isArray(data) ? data : [];
    return list.map((p) => ({
      id:         String(p.playlist_id ?? ""),
      title:      String(p.name ?? ""),
      trackCount: 0,        // not returned by API
      coverUrl:   resolveMediaUrl(p.cover_photo_url),
      isPrivate:  false,    // not returned by API
    }));
  },

  async getFollowing(): Promise<ILibraryFollowing[]> {
    const username = getUsername();
    if (!username) return [];
    const data = await apiGet<{ following?: Record<string, unknown>[] }>(
      `${BASE}/users/${username}/following`,
    );
    const list = Array.isArray(data) ? data : (data.following ?? []);
    return list.map((f) => ({
      id:        String(f.user_id ?? ""),
      username:  String(f.display_name ?? ""),
      avatarUrl: resolveMediaUrl(f.profile_picture),
      followers:  0,
      isVerified: (f.is_premium as boolean) ?? false,
    }));
  },

  async getRecentlyPlayed(): Promise<ILibraryRecentItem[]> {
    const data = await apiGet<{ items?: Record<string, unknown>[] }>(
      `${BASE}/users/me/recently-played`,
    );
    const list = Array.isArray(data) ? data : (data.items ?? []);
    return list.map((t) => ({
      id:       String(t.track_id ?? ""),
      type:     "track" as const,
      label:    String(t.title ?? ""),
      coverUrl: resolveMediaUrl(t.cover_image_url),
      href:     `/track/${t.track_id}`,
    }));
  },

  async getOverview(): Promise<ILibraryOverview> {
    const mockOverview = await mockLibraryService.getOverview();

    const [likes, playlists, following, recentlyPlayed] = await Promise.allSettled([
      realLibraryService.getLikes(),
      realLibraryService.getPlaylists(),
      realLibraryService.getFollowing(),
      realLibraryService.getRecentlyPlayed(),
    ]);

    return {
      recentlyPlayed: recentlyPlayed.status === "fulfilled"
        ? (recentlyPlayed.value as ILibraryRecentItem[])
        : mockOverview.recentlyPlayed,
      likes:     likes.status     === "fulfilled" ? likes.value     : mockOverview.likes,
      playlists: playlists.status === "fulfilled" ? playlists.value : mockOverview.playlists,
      albums:    mockOverview.albums,
      stations:  mockOverview.stations,
      following: following.status === "fulfilled" ? following.value : mockOverview.following,
    };
  },

  getAlbums:    () => mockLibraryService.getAlbums(),
  getStations:  () => mockLibraryService.getStations(),
  clearHistory: () => mockLibraryService.clearHistory(),
};