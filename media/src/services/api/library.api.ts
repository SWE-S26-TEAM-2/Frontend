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
    const response = await apiGet<{
      data?: { tracks?: Record<string, unknown>[] };
      tracks?: Record<string, unknown>[];
    }>(`${BASE}/users/${username}/liked-tracks`);

    const list = Array.isArray(response)
      ? response
      : (response.data?.tracks ?? response.tracks ?? []);

    const tracks: ILibraryTrack[] = list.map((t) => {
      const artist = t.artist as Record<string, unknown> | undefined;
      return {
        id:       String(t.track_id ?? ""),
        title:    String(t.title ?? ""),
        artist:   String(artist?.display_name ?? t.display_name ?? ""),
        coverUrl: resolveMediaUrl(t.cover_image_url),
        plays:    (t.play_count as number) ?? 0,
        likes:    0,
        reposts:  0,
        url:      resolveMediaUrl(t.stream_url) ?? undefined,
        duration: t.duration_seconds ? String(t.duration_seconds) : undefined,
        genre:    t.genre ? String(t.genre) : undefined,
      };
    });

    if (tracks.length === 0) return tracks;

    const summaries = await Promise.allSettled(
      tracks.map((t) =>
        apiGet<{
          like_count: number;
          repost_count: number;
          comment_count: number;
          liked_by_me: boolean;
          reposted_by_me: boolean;
        }>(`${BASE}/tracks/${t.id}/engagement-summary`)
      )
    );

    return tracks.map((t, i) => {
      const result = summaries[i];
      if (result.status === "fulfilled" && result.value) {
        const s = result.value as unknown as {
          like_count: number;
          repost_count: number;
          liked_by_me: boolean;
          reposted_by_me: boolean;
          comment_count: number;
        };
        return {
          ...t,
          likes:         s.like_count      ?? 0,
          reposts:       s.repost_count    ?? 0,
          isLiked:       s.liked_by_me     ?? true,
          isReposted:    s.reposted_by_me  ?? false,
          commentsCount: s.comment_count   ?? 0,
        };
      }
      return t;
    });
  },

  async getPlaylists(): Promise<ILibraryPlaylist[]> {
    const username = getUsername();
    if (!username) return [];
    const response = await apiGet<{
      data?: { playlists?: Record<string, unknown>[] };
      playlists?: Record<string, unknown>[];
    }>(`${BASE}/users/${username}/playlists`);

    const list = Array.isArray(response)
      ? response
      : (response.data?.playlists ?? response.playlists ?? []);

    return list.map((p) => ({
      id:         String(p.playlist_id ?? ""),
      title:      String(p.name ?? ""),
      trackCount: (p.track_count as number) ?? 0,
      coverUrl:   resolveMediaUrl(p.cover_photo_url),
      isPrivate:  Boolean(p.is_private ?? false),
    }));
  },

  async getFollowing(): Promise<ILibraryFollowing[]> {
    const username = getUsername();
    if (!username) return [];
    const response = await apiGet<{
      data?: { following?: Record<string, unknown>[] };
      following?: Record<string, unknown>[];
    }>(`${BASE}/users/${username}/following`);

    const list = Array.isArray(response)
      ? response
      : (response.data?.following ?? response.following ?? []);

    return list.map((f) => ({
      id:         String(f.user_id ?? ""),
      username:   String(f.username ?? f.display_name ?? ""),
      avatarUrl:  resolveMediaUrl(f.profile_picture),
      followers:  0,
      isVerified: Boolean(f.is_premium ?? false),
    }));
  },

async getRecentlyPlayed(): Promise<ILibraryRecentItem[]> {
  try {
    const token = typeof window !== "undefined"
      ? window.localStorage.getItem("auth_token")
      : null;

    if (!token) {
      return [];
    }
    const res = await fetch(`${BASE}/users/me/recently-played`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn("getRecentlyPlayed: API error", res.status);
      return [];
    }

    const raw = await res.json();
    const list: Record<string, unknown>[] =
      Array.isArray(raw)               ? raw :
      Array.isArray(raw?.data)         ? raw.data :
      Array.isArray(raw?.data?.history)? raw.data.history :
      Array.isArray(raw?.history)      ? raw.history :
      Array.isArray(raw?.data?.items)  ? raw.data.items :
      Array.isArray(raw?.items)        ? raw.items :
      [];

    return list.map((item) => {
      const track = (item.track as Record<string, unknown>) ?? item;
      const trackId = String(track.track_id ?? item.track_id ?? "");
      return {
        id:       trackId,
        type:     "track" as const,
        label:    String(track.title ?? item.title ?? ""),
        coverUrl: resolveMediaUrl(track.cover_image_url ?? item.cover_image_url),
        href:     `/track/${trackId}`,
      };
    });
  } catch (err) {
    console.error("getRecentlyPlayed failed:", err);
    return [];
  }
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