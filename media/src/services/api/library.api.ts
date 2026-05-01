import { apiGet } from "@/services/api/apiClient";
import type {
  ILibraryService,
  ILibraryOverview,
  ILibraryTrack,
  ILibraryPlaylist,
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
    // API returns: { success, data: [{ track_id, title, artist: { display_name }, cover_image_url, ... }] }
    // Bug 2 fix: artist name is nested inside track.artist.display_name, not a flat display_name field.
    const data = await apiGet<{
      data?: Record<string, unknown>[];
      tracks?: Record<string, unknown>[];
    }>(`${BASE}/users/${username}/liked-tracks`);
    const list = Array.isArray(data)
      ? data
      : (data.data ?? data.tracks ?? []);
    return list.map((t) => {
      const artist = t.artist as Record<string, unknown> | undefined;
      return {
        id:       String(t.track_id ?? ""),
        title:    String(t.title ?? ""),
        artist:   String(artist?.display_name ?? ""),
        coverUrl: resolveMediaUrl(t.cover_image_url),
        plays:    (t.play_count as number) ?? 0,
        likes:    (t.like_count as number) ?? 0,
        reposts:  (t.repost_count as number) ?? 0,
        duration: t.duration_seconds ? String(t.duration_seconds) : undefined,
        genre:    t.genre ? String(t.genre) : undefined,
      };
    });
  },

  async getPlaylists(): Promise<ILibraryPlaylist[]> {
    const username = getUsername();
    if (!username) return [];
    // API returns: PlaylistListResponse = { success, data: [...] }
    // Bug 5 fix: the array lives at response.data, not at the response root.
    const response = await apiGet<{
      data?: Record<string, unknown>[];
    }>(`${BASE}/users/${username}/playlists`);
    const list = Array.isArray(response)
      ? response
      : (response.data ?? []);
    return list.map((p) => ({
      id:         String(p.playlist_id ?? ""),
      title:      String(p.name ?? ""),
      trackCount: (p.track_count as number) ?? 0,
      coverUrl:   resolveMediaUrl(p.cover_photo_url),
      isPrivate:  Boolean(p.is_private ?? false),
    }));
  },

  async getFollowing(): Promise<ILibraryFollowing[]> {
    // Bug 3 fix: the authenticated user's own following list is at
    // GET /users/me/following — NOT /users/{username}/following (that's for
    // viewing another user's list).
    // Response: FollowingListResponse = { success, data: { count, following: [...] } }
    const data = await apiGet<{
      data?: { following?: Record<string, unknown>[] };
      following?: Record<string, unknown>[];
    }>(`${BASE}/users/me/following`);
    const list = Array.isArray(data)
      ? data
      : (data.data?.following ?? data.following ?? []);
    return list.map((f) => ({
      id:         String(f.user_id ?? ""),
      username:   String(f.display_name ?? ""),
      avatarUrl:  resolveMediaUrl(f.profile_picture),
      followers:  0,
      isVerified: Boolean(f.is_premium ?? false),
    }));
  },

  async getRecentlyPlayed(): Promise<ILibraryRecentItem[]> {
    // API returns: ListeningHistoryResponse =
    //   { success, data: { items: [{ history_id, played_at, track: { track_id, title, cover_image_url, ... } }] } }
    // Bug 4 fix: track fields are nested inside item.track, not on the item root.
    const response = await apiGet<{
      data?: { items?: Record<string, unknown>[] };
      items?: Record<string, unknown>[];
    }>(`${BASE}/users/me/recently-played`);
    const list = Array.isArray(response)
      ? response
      : (response.data?.items ?? response.items ?? []);
    return list.map((item) => {
      const track = item.track as Record<string, unknown> | undefined;
      const trackId = String(track?.track_id ?? "");
      return {
        id:       trackId,
        type:     "track" as const,
        label:    String(track?.title ?? ""),
        coverUrl: resolveMediaUrl(track?.cover_image_url),
        href:     `/track/${trackId}`,
      };
    });
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