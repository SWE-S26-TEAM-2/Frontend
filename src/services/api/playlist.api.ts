/**
 * Real playlist API service.
 * Pattern mirrors src/services/api/trackService.ts (realTrackService).
 *
 * Backend contract expected:
 *   GET /api/playlists/:id
 *   Response: IPlaylist | { playlist: IPlaylist }
 */

import { ENV } from "@/config/env";
import { IPlaylist } from "@/types/playlist.types";

export const realPlaylistService = {
  async getById(id: string): Promise<IPlaylist | null> {
    const response = await fetch(`${ENV.API_BASE_URL}/playlists/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    // Support both { playlist: IPlaylist } and bare IPlaylist shapes
    return (data.playlist ?? data) as IPlaylist;
  },
};
