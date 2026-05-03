/**
 * Real playlist API service.
 *
 * Implements IPlaylistService (from @/types/playlist.types).
 *
 * Backend response shapes (FastAPI):
 *   POST /playlists/      → { success, data: { playlist_id, name, description, cover_photo_url } }
 *   GET  /playlists/:id   → { success, data: { playlist_id, user_id, name, description, cover_photo_url, tracks: [...] } }
 *   PATCH /playlists/:id  → { success, message, data: { playlist_id, name, description } }
 *   DELETE /playlists/:id → { success, message }
 *   POST /playlists/:id/tracks        → { success, message }
 *   DELETE /playlists/:id/tracks/:tid → { success, message }
 *
 * Backend track shape inside GET /playlists/:id:
 *   { track_id, user_id, title, description, genre, stream_url, cover_image_url, duration_seconds, ... }
 *
 * All requests carry a Bearer token via apiClient (injected automatically).
 */

import { ENV } from "@/config/env";
import { apiGet, apiPost, apiPatch, apiDelete } from "./apiClient";
import type {
  IPlaylist,
  IPlaylistTrack,
  IPlaylistCreateInput,
  IPlaylistUpdateInput,
  IPlaylistService,
} from "@/types/playlist.types";

// ── Backend response shapes ───────────────────────────────────────────────────

interface IBackendPlaylist {
  playlist_id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  cover_photo_url?: string | null;
  tracks?: IBackendTrack[];
}

interface IBackendTrack {
  track_id: string;
  user_id?: string | null;
  title: string;
  description?: string | null;
  genre?: string | null;
  stream_url?: string | null;
  cover_image_url?: string | null;
  duration_seconds?: number | null;
  play_count?: number | null;
}

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeTrack(t: IBackendTrack, index = 0): IPlaylistTrack {
  return {
    id: t.track_id,
    title: t.title,
    artist: t.user_id ?? "",
    albumArt: t.cover_image_url ?? "",
    url: t.stream_url ?? "",
    duration: t.duration_seconds ?? 0,
    position: index + 1,
  };
}

function normalizePlaylist(d: IBackendPlaylist): IPlaylist {
  return {
    id: d.playlist_id,
    title: d.name,
    description: d.description ?? "",
    coverArt: d.cover_photo_url ?? "",
    creator: d.user_id ?? "",
    isPublic: true,
    tracks: Array.isArray(d.tracks) ? d.tracks.map((t, i) => normalizeTrack(t, i)) : [],
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const realPlaylistService: IPlaylistService = {
  /** GET /playlists/:id — returns null on 404 or auth error */
  async getById(id: string): Promise<IPlaylist | null> {
    try {
      const data = await apiGet<IBackendPlaylist>(
        `${ENV.API_BASE_URL}/playlists/${id}`
      );
      return normalizePlaylist(data);
    } catch {
      return null;
    }
  },

  /** Not a dedicated backend endpoint — returns empty array gracefully */

  async getUserPlaylists(_userId: string): Promise<IPlaylist[]> {
    return [];
  },

  /**
   * POST /playlists/
   * Body: { name, description }
   * _creatorName is not sent — backend derives creator from JWT.
   */
  async create(
    input: IPlaylistCreateInput,
    _creatorName: string
  ): Promise<IPlaylist> {
    const data = await apiPost<IBackendPlaylist>(
      `${ENV.API_BASE_URL}/playlists/`,
      {
        name: input.title,
        description: input.description ?? "",
      }
    );
    // Backend only returns id/name/description on create — attach the input
    // tracks so the frontend can navigate to the new playlist page immediately.
    const playlist = normalizePlaylist(data);
    playlist.tracks = input.tracks ?? [];
    return playlist;
  },

  /**
   * PATCH /playlists/:id
   * Body: { name?, description? }
   * Backend may return partial data — re-fetch to get full playlist.
   */
  async update(input: IPlaylistUpdateInput): Promise<IPlaylist> {
    const { id, title, description } = input;
    const body: Record<string, string> = {};
    if (title !== undefined) body.name = title;
    if (description !== undefined) body.description = description;

    try {
      const data = await apiPatch<IBackendPlaylist>(
        `${ENV.API_BASE_URL}/playlists/${id}`,
        body
      );
      // If backend returned full playlist data use it; otherwise re-fetch
      if (data && data.playlist_id) {
        const normalized = normalizePlaylist(data);
        // Preserve tracks from input since PATCH may not return them
        if (!normalized.tracks || normalized.tracks.length === 0) {
          normalized.tracks = input.tracks ?? [];
        }
        return normalized;
      }
    } catch {
      // If PATCH fails, try to get the current state
    }

    // Fallback: re-fetch the playlist
    const updated = await realPlaylistService.getById(id);
    if (!updated) throw new Error('Failed to fetch playlist after update');
    // Merge in the new track list from input (track order changes are local)
    if (input.tracks) updated.tracks = input.tracks;
    return updated;
  },

  /** DELETE /playlists/:id */
  async deletePlaylist(id: string): Promise<void> {
    await apiDelete(`${ENV.API_BASE_URL}/playlists/${id}`);
  },

  /**
   * POST /playlists/:id/tracks
   * Body: { track_id }
   * Backend confirms but doesn't return the full updated playlist — re-fetch.
   */
  async addTrackToPlaylist(
    playlistId: string,
    track: IPlaylistTrack
  ): Promise<IPlaylist> {
    await apiPost(`${ENV.API_BASE_URL}/playlists/${playlistId}/tracks`, {
      track_id: track.id,
    });
    const updated = await realPlaylistService.getById(playlistId);
    if (!updated) throw new Error("Failed to fetch playlist after adding track");
    return updated;
  },

  /** DELETE /playlists/:id/tracks/:trackId — re-fetch after success */
  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string
  ): Promise<IPlaylist> {
    await apiDelete(
      `${ENV.API_BASE_URL}/playlists/${playlistId}/tracks/${trackId}`
    );
    const updated = await realPlaylistService.getById(playlistId);
    if (!updated)
      throw new Error("Failed to fetch playlist after removing track");
    return updated;
  },

  /** POST /playlists/ with just a title */
  async createPlaylist(title: string): Promise<IPlaylist> {
    const data = await apiPost<IBackendPlaylist>(
      `${ENV.API_BASE_URL}/playlists/`,
      { name: title, description: "" }
    );
    return normalizePlaylist(data);
  },

  /** GET /playlists/liked — returns playlists liked by the authenticated user */
  async getLikedPlaylists(): Promise<IPlaylist[]> {
    try {
      const data = await apiGet<IBackendPlaylist[]>(
        `${ENV.API_BASE_URL}/playlists/liked`
      );
      return Array.isArray(data) ? data.map(normalizePlaylist) : [];
    } catch {
      return [];
    }
  },

  /** POST /playlists/:id/like */
  async likePlaylist(playlistId: string): Promise<void> {
    await apiPost(`${ENV.API_BASE_URL}/playlists/${playlistId}/like`, {});
  },

  /** DELETE /playlists/:id/like */
  async unlikePlaylist(playlistId: string): Promise<void> {
    await apiDelete(`${ENV.API_BASE_URL}/playlists/${playlistId}/like`);
  },
};
