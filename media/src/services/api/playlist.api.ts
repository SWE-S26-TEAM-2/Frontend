import { ENV } from "@/config/env";
import { apiGet, apiPost, apiPatch, apiDelete } from "./apiClient";
import type { IPlaylist, IPlaylistService, IPlaylistTrack } from "@/types/playlist.types";
import type { ITrack } from "@/types/track.types";
import { mockPlaylistService } from "../mocks/playlist.mock";

// ── Normalizer ───────────────────────────────────────────────────────────────

interface BackendTrack {
  track_id: string;
  title: string;
  file_url?: string;
  description?: string;
  user_id?: string;
}

interface BackendPlaylist {
  playlist_id: string;
  user_id: string;
  name: string;
  description?: string | null;
  tracks?: BackendTrack[];
}

function normalizeTrack(t: BackendTrack, index: number): IPlaylistTrack {
  const track: ITrack = {
    id: t.track_id,
    title: t.title,
    artist: t.user_id ?? "",
    albumArt: "",
    url: t.file_url ?? "",
    duration: 0,
    likes: 0,
    plays: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { position: index + 1, track };
}

function normalizePlaylist(d: BackendPlaylist): IPlaylist {
  const tracks = (d.tracks ?? []).map(normalizeTrack);
  return {
    id: d.playlist_id,
    playlistId: d.playlist_id,
    slug: d.name.toLowerCase().replace(/\s+/g, "-"),
    title: d.name,
    type: "playlist",
    owner: { id: d.user_id, username: "", avatarUrl: "" },
    artworkUrl: "",
    description: d.description ?? undefined,
    isPrivate: false,
    trackCount: tracks.length,
    totalDuration: 0,
    tracks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

export const realPlaylistService: IPlaylistService = {
  // GET /playlists/{id} — real backend
  getPlaylistById: async (playlistId: string): Promise<IPlaylist> => {
    const data = await apiGet<BackendPlaylist>(`${ENV.API_BASE_URL}/playlists/${playlistId}`);
    return normalizePlaylist(data);
  },

  // POST /playlists/ — real backend
  createPlaylist: async (name: string, description?: string): Promise<IPlaylist> => {
    const data = await apiPost<BackendPlaylist>(`${ENV.API_BASE_URL}/playlists/`, {
      name,
      ...(description ? { description } : {}),
    });
    return normalizePlaylist(data);
  },

  // POST /playlists/{id}/tracks — real backend
  addTrackToPlaylist: async (playlistId: string, trackId: string): Promise<void> => {
    await apiPost(`${ENV.API_BASE_URL}/playlists/${playlistId}/tracks`, { track_id: trackId });
  },

  // DELETE /playlists/{id}/tracks/{trackId} — real backend
  removeTrackFromPlaylist: async (playlistId: string, trackId: string): Promise<void> => {
    await apiDelete(`${ENV.API_BASE_URL}/playlists/${playlistId}/tracks/${trackId}`);
  },

  // Not implemented on backend — fall back to mock
  getPlaylist: async (username: string, slug: string): Promise<IPlaylist> => {
    console.warn("[playlistService] getPlaylist(username, slug) not implemented on backend — using mock");
    return mockPlaylistService.getPlaylist(username, slug);
  },

  getUserPlaylists: async (username: string): Promise<IPlaylist[]> => {
    console.warn("[playlistService] getUserPlaylists() not implemented on backend — using mock");
    return mockPlaylistService.getUserPlaylists(username);
  },

  search: async (query: string): Promise<IPlaylist[]> => {
    console.warn("[playlistService] search() not implemented on backend — using mock");
    return mockPlaylistService.search(query);
  },
};
