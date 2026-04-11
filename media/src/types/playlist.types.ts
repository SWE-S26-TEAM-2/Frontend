/**
 * Playlist feature — TypeScript types
 *
 * Conventions:
 *  - Interfaces prefixed with I
 *  - IPlaylistTrack extends ITrackBase (from track.types.ts)
 *    so it shares the minimum shape with ITrack without
 *    requiring fabricated stats fields (likes, plays, etc.)
 *  - coverArt is the playlist-level artwork URL
 *
 * Type hierarchy:
 *   ITrackBase <- ITrack         (full track with stats/timestamps)
 *   ITrackBase <- IPlaylistTrack (playlist track with playlist-context fields)
 *
 * Version history (CURRENT_DRAFT_VERSION):
 *   1 = initial
 *   2 = added genre + mood
 *   3 = IPlaylistTrack extends ITrackBase (addedAt, addedBy added as optional)
 */

import type { ITrackBase } from "@/types/track.types";
import type { IUser } from "@/types/auth.types";

// -- Genre / Mood ---------------------------------------------------------------

export type PlaylistGenre =
  | "Electronic"
  | "Hip-Hop"
  | "Pop"
  | "Rock"
  | "R&B"
  | "Jazz"
  | "Classical"
  | "Ambient"
  | "Country"
  | "Latin"
  | "Religious"
  | "Other";

export type PlaylistMood =
  | "Chill"
  | "Focus"
  | "Workout"
  | "Party"
  | "Sad"
  | "Happy"
  | "Romantic"
  | "Sleep";

// -- Core entities --------------------------------------------------------------

/**
 * A track as it exists inside a playlist.
 *
 * Extends ITrackBase so it is assignable to ITrackBase consumers
 * (e.g. usePlayerStore.setTrack) without fabricating stats fields.
 *
 * Playlist-context fields:
 *  - addedAt  -- ISO timestamp when this track was added to the playlist
 *  - addedBy  -- the user who added the track (optional: may be absent in mock data)
 */
export interface IPlaylistTrack extends ITrackBase {
  /** ISO timestamp when this track was added to the playlist */
  addedAt?: string;
  /** User who added this track to the playlist */
  addedBy?: Pick<IUser, "id" | "username">;
}

export interface IPlaylist {
  id: string;
  title: string;
  description: string;
  coverArt: string;
  creator: string;
  isPublic: boolean;
  genre?: PlaylistGenre;
  mood?: PlaylistMood;
  tracks: IPlaylistTrack[];
}

// -- Phase 1 state --------------------------------------------------------------

export interface IPlaylistState {
  playlist: IPlaylist | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  retryCount: number;
}

// -- Form fields ----------------------------------------------------------------

export interface IPlaylistFormFields {
  title: string;
  description: string;
  isPublic: boolean;
  coverArt: string;
  genre: PlaylistGenre | "";
  mood: PlaylistMood | "";
  tracks: IPlaylistTrack[];
}

export interface IPlaylistFormErrors {
  title?: string;
  tracks?: string;
}

// -- API payloads ---------------------------------------------------------------

export interface IPlaylistCreateInput {
  title: string;
  description: string;
  isPublic: boolean;
  coverArt: string;
  genre?: PlaylistGenre;
  mood?: PlaylistMood;
  tracks: IPlaylistTrack[];
}

export interface IPlaylistUpdateInput extends Partial<IPlaylistCreateInput> {
  id: string;
}

// -- Service interface ----------------------------------------------------------

/**
 * IPlaylistService -- contract for both real and mock implementations.
 * All methods match the DI registration in src/services/di.ts.
 * Both realPlaylistService and mockPlaylistService must satisfy this interface.
 */
export interface IPlaylistService {
  getById(id: string): Promise<IPlaylist | null>;
  getUserPlaylists(userId: string): Promise<IPlaylist[]>;
  create(input: IPlaylistCreateInput, creatorName: string): Promise<IPlaylist>;
  update(input: IPlaylistUpdateInput): Promise<IPlaylist>;
  deletePlaylist(id: string): Promise<void>;
  addTrackToPlaylist(playlistId: string, track: IPlaylistTrack): Promise<IPlaylist>;
  removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<IPlaylist>;
}

// -- Undo-remove ----------------------------------------------------------------

export interface IRemovedTrack {
  track: IPlaylistTrack;
  index: number;
  removedAt: number;
}

// -- Draft (versioned) ----------------------------------------------------------

/**
 * Increment CURRENT_DRAFT_VERSION whenever IPlaylistFormFields changes shape.
 * Version mismatch on hydration -> draft discarded (prevents runtime crashes
 * from stale field shapes stored in localStorage).
 *
 * History:
 *   1 = initial
 *   2 = added genre + mood
 *   3 = IPlaylistTrack extends ITrackBase (addedAt, addedBy added as optional)
 */
export const CURRENT_DRAFT_VERSION = 3;

export interface IPlaylistDraft {
  version: number;
  savedAt: number;
  data: IPlaylistFormFields;
}

// -- Persistence status ---------------------------------------------------------

/**
 * Discriminated union for the API round-trip.
 * Replaces boolean explosion (isLoading + isSubmitting + isSuccess + hasError).
 * Impossible combinations (e.g. loading + success) are unrepresentable.
 */
export type PersistenceStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "submitting" }
  | { kind: "success"; id: string }
  | { kind: "error"; message: string };
