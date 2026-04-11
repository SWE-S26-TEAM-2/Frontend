/**
 * Mock playlist service for development / testing.
 *
 * Implements IPlaylistService (from @/types/playlist.types).
 * Pattern mirrors src/services/mocks/trackService.ts (mockTrackService).
 *
 * All read/write operations delegate to playlistMockData.ts which uses
 * localStorage so state survives HMR and page navigation during development.
 *
 * getUserPlaylists, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist
 * are implemented using existing playlistMockData helpers — no new
 * dependencies introduced.
 */

import type {
  IPlaylist,
  IPlaylistTrack,
  IPlaylistCreateInput,
  IPlaylistUpdateInput,
  IPlaylistService,
} from "@/types/playlist.types";
import {
  getMockPlaylistById,
  getMockAllPlaylists,
  createMockPlaylist,
  updateMockPlaylist,
} from "@/services/mocks/playlistMockData";
import {
  addTrackToList,
  removeTrackFromList,
} from "@/utils/playlistUtils";
import { PLAYLIST_MOCK_DELAY_MS } from "@/constants/playlist.constants";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockPlaylistService: IPlaylistService = {
  // ── Read ──────────────────────────────────────────────────────────────────

  /**
   * Fetch a single playlist by ID.
   * Returns null for unknown IDs — triggers error state in usePlaylist hook.
   */
  async getById(id: string): Promise<IPlaylist | null> {
    await delay(PLAYLIST_MOCK_DELAY_MS);
    if (!id) return null;
    return getMockPlaylistById(id);
  },

  /**
   * Return all playlists in the mock store.
   * In production, this would filter by userId. In development,
   * all seed playlists are returned regardless of userId.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserPlaylists(_userId: string): Promise<IPlaylist[]> {
    await delay(PLAYLIST_MOCK_DELAY_MS);
    return getMockAllPlaylists();
  },

  // ── Write ─────────────────────────────────────────────────────────────────

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

  /**
   * Delete a playlist from the mock store.
   * Seed playlists ("123", "456", "789") are not in localStorage,
   * so deletion is a no-op for them — they reappear on next page load.
   */
  async deletePlaylist(id: string): Promise<void> {
    await delay(PLAYLIST_MOCK_DELAY_MS);
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("sc_mock_playlists");
      if (!raw) return;
      const store = JSON.parse(raw) as Record<string, IPlaylist>;
      delete store[id];
      window.localStorage.setItem("sc_mock_playlists", JSON.stringify(store));
    } catch {
      // localStorage unavailable — fail silently
    }
  },

  // ── Track mutations ───────────────────────────────────────────────────────

  /**
   * Add a track to an existing playlist.
   * Uses addTrackToList helper which deduplicates by track.id.
   */
  async addTrackToPlaylist(
    playlistId: string,
    track: IPlaylistTrack
  ): Promise<IPlaylist> {
    await delay(PLAYLIST_MOCK_DELAY_MS);
    const existing = getMockPlaylistById(playlistId);
    if (!existing) {
      throw new Error(`Playlist "${playlistId}" not found.`);
    }
    const updatedTracks = addTrackToList(existing.tracks, track);
    return updateMockPlaylist({ id: playlistId, tracks: updatedTracks });
  },

  /**
   * Remove a track from an existing playlist.
   * Returns the updated playlist.
   */
  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string
  ): Promise<IPlaylist> {
    await delay(PLAYLIST_MOCK_DELAY_MS);
    const existing = getMockPlaylistById(playlistId);
    if (!existing) {
      throw new Error(`Playlist "${playlistId}" not found.`);
    }
    const updatedTracks = removeTrackFromList(existing.tracks, trackId);
    return updateMockPlaylist({ id: playlistId, tracks: updatedTracks });
  },
};
