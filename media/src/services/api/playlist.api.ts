/**
 * Real playlist API service.
 * Pattern mirrors src/services/api/track.api.ts (realTrackService).
 *
 * Phase 2: added create() and update() methods.
 *
 * Backend contracts expected:
 *   GET   /api/playlists/:id           → IPlaylist
 *   POST  /api/playlists               → IPlaylist (created)
 *   PATCH /api/playlists/:id           → IPlaylist (updated)
 */

import { ENV } from "@/config/env";
import {
  IPlaylist,
  IPlaylistCreateInput,
  IPlaylistUpdateInput,
} from "@/types/playlist.types";

export const realPlaylistService = {
  /** Fetch a single playlist by ID. Returns null on 404 / any error. */
  async getById(id: string): Promise<IPlaylist | null> {
    const response = await fetch(`${ENV.API_BASE_URL}/playlists/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return (data.playlist ?? data) as IPlaylist;
  },

  /**
   * Create a new playlist.
   * Sends the full payload to POST /api/playlists.
   * creatorName is passed separately — the backend derives it from the token,
   * but we include it here for the mock layer's compatibility.
   */
  async create(
    input: IPlaylistCreateInput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _creatorName: string
  ): Promise<IPlaylist> {
    const response = await fetch(`${ENV.API_BASE_URL}/playlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Failed to create playlist");
    }
    const data = await response.json();
    return (data.playlist ?? data) as IPlaylist;
  },

  /**
   * Update an existing playlist.
   * Sends partial fields to PATCH /api/playlists/:id.
   */
  async update(input: IPlaylistUpdateInput): Promise<IPlaylist> {
    const { id, ...fields } = input;
    const response = await fetch(`${ENV.API_BASE_URL}/playlists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Failed to update playlist");
    }
    const data = await response.json();
    return (data.playlist ?? data) as IPlaylist;
  },
};
