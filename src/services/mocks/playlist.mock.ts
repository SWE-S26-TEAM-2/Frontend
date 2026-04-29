/**
 * Mock playlist service for development / testing.
 * Pattern mirrors src/services/mocks/trackService.ts (mockTrackService).
 *
 * Returns the correct playlist for each ID, and null for unknown IDs
 * so the error state is exercisable from the browser.
 */

import { IPlaylist } from "@/types/playlist.types";
import { getMockPlaylistById } from "@/services/mocks/playlistMockData";
import { PLAYLIST_MOCK_DELAY_MS } from "@/constants/playlist.constants";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const mockPlaylistService = {
  async getById(id: string): Promise<IPlaylist | null> {
    await delay(PLAYLIST_MOCK_DELAY_MS);
    if (!id) return null;
    return getMockPlaylistById(id);
  },
};
