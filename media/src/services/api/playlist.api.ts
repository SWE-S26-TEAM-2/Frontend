import { ENV } from "@/config/env";
import { apiDelete, apiGet, apiPost } from "./apiClient";
import { unsupportedApiFeature } from "./apiMode";
import type { IPlaylist, IPlaylistService, IPlaylistTrack } from "@/types/playlist.types";
import type { ITrack } from "@/types/track.types";

interface IBackendTrack {
  track_id: string;
  title: string;
  file_url?: string;
  description?: string;
  user_id?: string;
}

interface IBackendPlaylist {
  playlist_id: string;
  user_id: string;
  name: string;
  description?: string | null;
  cover_photo_url?: string | null;
  tracks?: IBackendTrack[];
}

function normalizeTrack(t: IBackendTrack, index: number): IPlaylistTrack {
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

function normalizePlaylist(d: IBackendPlaylist): IPlaylist {
  const tracks = (d.tracks ?? []).map(normalizeTrack);
  return {
    id: d.playlist_id,
    playlistId: d.playlist_id,
    slug: d.name.toLowerCase().replace(/\s+/g, "-"),
    title: d.name,
    type: "playlist",
    owner: { id: d.user_id, username: "", avatarUrl: "" },
    artworkUrl: d.cover_photo_url ?? "",
    description: d.description ?? undefined,
    isPrivate: false,
    trackCount: tracks.length,
    totalDuration: 0,
    tracks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const realPlaylistService: IPlaylistService = {
  getPlaylistById: async (playlistId: string): Promise<IPlaylist> => {
    const data = await apiGet<IBackendPlaylist>(`${ENV.API_BASE_URL}/playlists/${playlistId}`);
    return normalizePlaylist(data);
  },

  createPlaylist: async (name: string, description?: string): Promise<IPlaylist> => {
    const data = await apiPost<IBackendPlaylist>(`${ENV.API_BASE_URL}/playlists/`, {
      name,
      ...(description ? { description } : {}),
    });
    return normalizePlaylist(data);
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string): Promise<void> => {
    await apiPost(`${ENV.API_BASE_URL}/playlists/${playlistId}/tracks`, { track_id: trackId });
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string): Promise<void> => {
    await apiDelete(`${ENV.API_BASE_URL}/playlists/${playlistId}/tracks/${trackId}`);
  },

  getPlaylist: async (username: string, slug: string): Promise<IPlaylist> => {
    void username;
    void slug;
    unsupportedApiFeature("playlistService.getPlaylist(username, slug)");
  },

  getUserPlaylists: async (username: string): Promise<IPlaylist[]> => {
    void username;
    unsupportedApiFeature("playlistService.getUserPlaylists()");
  },

  search: async (query: string): Promise<IPlaylist[]> => {
    void query;
    unsupportedApiFeature("playlistService.search()");
  },
};
