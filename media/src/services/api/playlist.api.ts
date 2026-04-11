/**
 * Real playlist API service.
 *
 * Implements IPlaylistService (from @/types/playlist.types).
 * Pattern mirrors src/services/api/trackService.ts (realTrackService).
 *
 * Backend contracts:
 *   GET    /api/playlists/:id                      → IPlaylist
 *   POST   /api/playlists                          → IPlaylist (created)
 *   PATCH  /api/playlists/:id                      → IPlaylist (updated)
 *   DELETE /api/playlists/:id                      → 204 No Content
 *   GET    /api/users/:userId/playlists             → IPlaylist[]
 *   POST   /api/playlists/:id/tracks               → IPlaylist (track added)
 *   DELETE /api/playlists/:id/tracks/:trackId      → IPlaylist (track removed)
 *
 * getUserPlaylists, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist
 * are full implementations ready for the backend. They fulfil the IPlaylistService
 * contract so future hooks can use them without any service changes.
 */

import { ENV } from "@/config/env";
import type {
  IPlaylist,
  IPlaylistTrack,
  IPlaylistCreateInput,
  IPlaylistUpdateInput,
  IPlaylistService,
} from "@/types/playlist.types";

export const realPlaylistService: IPlaylistService = {
  // ── Read ──────────────────────────────────────────────────────────────────

  /** Fetch a single playlist by ID. Returns null on 404 or any network error. */
  async getById(id: string): Promise<IPlaylist | null> {
    const res = await fetch(`${ENV.API_BASE_URL}/playlists/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.playlist ?? data) as IPlaylist;
  },

  /** Fetch all playlists belonging to a user. Returns [] on any error. */
  async getUserPlaylists(userId: string): Promise<IPlaylist[]> {
    const res = await fetch(
      `${ENV.API_BASE_URL}/users/${userId}/playlists`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? data) as IPlaylist[];
  },

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Create a new playlist.
   * _creatorName is accepted for mock-layer API compatibility but not sent to
   * the real backend — the server derives the creator from the auth token.
   */
  async create(
    input: IPlaylistCreateInput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _creatorName: string
  ): Promise<IPlaylist> {
    const res = await fetch(`${ENV.API_BASE_URL}/playlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { message?: string }).message ?? "Failed to create playlist"
      );
    }
    const data = await res.json();
    return (data.playlist ?? data) as IPlaylist;
  },

  /** Update an existing playlist. Sends only changed fields via PATCH. */
  async update(input: IPlaylistUpdateInput): Promise<IPlaylist> {
    const { id, ...fields } = input;
    const res = await fetch(`${ENV.API_BASE_URL}/playlists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { message?: string }).message ?? "Failed to update playlist"
      );
    }
    const data = await res.json();
    return (data.playlist ?? data) as IPlaylist;
  },

  /** Permanently delete a playlist. */
  async deletePlaylist(id: string): Promise<void> {
    const res = await fetch(`${ENV.API_BASE_URL}/playlists/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { message?: string }).message ?? "Failed to delete playlist"
      );
    }
  },

  // ── Track mutations ───────────────────────────────────────────────────────

  /** Add a track to an existing playlist. Returns the updated playlist. */
  async addTrackToPlaylist(
    playlistId: string,
    track: IPlaylistTrack
  ): Promise<IPlaylist> {
    const res = await fetch(
      `${ENV.API_BASE_URL}/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { message?: string }).message ??
          "Failed to add track to playlist"
      );
    }
    const data = await res.json();
    return (data.playlist ?? data) as IPlaylist;
  },

  /** Remove a track from an existing playlist. Returns the updated playlist. */
  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string
  ): Promise<IPlaylist> {
    const res = await fetch(
      `${ENV.API_BASE_URL}/playlists/${playlistId}/tracks/${trackId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { message?: string }).message ??
          "Failed to remove track from playlist"
      );
    }
    const data = await res.json();
    return (data.playlist ?? data) as IPlaylist;
  },
};
