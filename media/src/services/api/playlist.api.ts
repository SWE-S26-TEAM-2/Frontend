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

interface BackendPlaylist {
  playlist_id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  cover_photo_url?: string | null;
  tracks?: BackendTrack[];
}

interface BackendTrack {
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

function normalizeTrack(t: BackendTrack): IPlaylistTrack {
  return {
    id: t.track_id,
    title: t.title,
    artist: t.user_id ?? "",
    albumArt: t.cover_image_url ?? "",
    url: t.stream_url ?? "",
    duration: t.duration_seconds ?? 0,
  };
}

function normalizePlaylist(d: BackendPlaylist): IPlaylist {
  return {
    id: d.playlist_id,
    title: d.name,
    description: d.description ?? "",
    coverArt: d.cover_photo_url ?? "",
    creator: d.user_id ?? "",
    isPublic: true,
    tracks: Array.isArray(d.tracks) ? d.tracks.map(normalizeTrack) : [],
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const realPlaylistService: IPlaylistService = {
  /** GET /playlists/:id — returns null on 404 or auth error */
  async getById(id: string): Promise<IPlaylist | null> {
    try {
      const data = await apiGet<BackendPlaylist>(
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _creatorName: string
  ): Promise<IPlaylist> {
    const data = await apiPost<BackendPlaylist>(
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
   */
  async update(input: IPlaylistUpdateInput): Promise<IPlaylist> {
    const { id, title, description } = input;
    const body: Record<string, string> = {};
    if (title !== undefined) body.name = title;
    if (description !== undefined) body.description = description;

    const data = await apiPatch<BackendPlaylist>(
      `${ENV.API_BASE_URL}/playlists/${id}`,
      body
    );
    return normalizePlaylist(data);
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
};
