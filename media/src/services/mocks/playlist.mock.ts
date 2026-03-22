/**
 * Mock playlist service for development / testing.
 * Pattern mirrors src/services/mocks/trackService.ts (mockTrackService).
 *
 * Delegates all persistence to playlistMockData.ts which uses
 * localStorage so created/updated playlists survive HMR and navigation.
 */

import {
  IPlaylist,
  IPlaylistCreateInput,
  IPlaylistUpdateInput,
} from "@/types/playlist.types";
import {
  getMockPlaylistById,
  createMockPlaylist,
  updateMockPlaylist,
} from "@/services/mocks/playlistMockData";
import { PLAYLIST_MOCK_DELAY_MS } from "@/constants/playlist.constants";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const mockPlaylistService = {
  /**
   * Fetch a single playlist by ID.
   * Returns null for unknown IDs — triggers error state in the hook.
   */
  async getById(id: string): Promise<IPlaylist | null> {
    await delay(PLAYLIST_MOCK_DELAY_MS);
    if (!id) return null;
    return getMockPlaylistById(id);
  },

  /**
   * Create a new playlist and persist it to localStorage.
   * Returns the created playlist with its generated mock ID.
   */
  async create(
    input: IPlaylistCreateInput,
    creatorName: string
  ): Promise<IPlaylist> {
    return createMockPlaylist(input, creatorName);
  },

  /**
   * Update an existing playlist and persist changes to localStorage.
   * Throws if the playlist ID is not found.
   */
  async update(input: IPlaylistUpdateInput): Promise<IPlaylist> {
    return updateMockPlaylist(input);
  },
};
