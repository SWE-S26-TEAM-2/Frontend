/**
 * Playlist feature — TypeScript types
 *
 * Conventions:
 *  - Interfaces prefixed with I (ESLint @typescript-eslint/naming-convention)
 *  - `albumArt` mirrors ITrack.albumArt in track.types.ts
 *  - `coverArt`  is the playlist-level artwork URL
 *
 * Tier 1 additions:
 *  - PlaylistGenre / PlaylistMood  — union types (not enums — JSON-serialisable)
 *  - IPlaylist.genre / IPlaylist.mood
 *  - IPlaylistFormFields extended with genre + mood
 *  - IRemovedTrack                 — undo-remove snapshot
 *  - IPlaylistDraft                — versioned localStorage schema
 *  - CURRENT_DRAFT_VERSION         — increment when IPlaylistFormFields changes
 *  - PersistenceStatus             — discriminated union replaces boolean explosion
 */

// ── Genre / Mood ──────────────────────────────────────────────────────────────

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

// ── Core entities ─────────────────────────────────────────────────────────────

export interface IPlaylistTrack {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  url: string;
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

// ── Phase 1 state (unchanged) ─────────────────────────────────────────────────

export interface IPlaylistState {
  playlist: IPlaylist | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  retryCount: number;
}

// ── Form fields ───────────────────────────────────────────────────────────────

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

// ── API payloads ──────────────────────────────────────────────────────────────

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

// ── Undo-remove ───────────────────────────────────────────────────────────────

export interface IRemovedTrack {
  track: IPlaylistTrack;
  index: number;
  removedAt: number;
}

// ── Draft (versioned) ─────────────────────────────────────────────────────────

/**
 * Increment CURRENT_DRAFT_VERSION whenever IPlaylistFormFields changes shape.
 * On hydration, version mismatch → draft discarded (prevents runtime crashes
 * from stale field shapes, e.g. tracks being undefined in an old draft).
 *
 * History: 1 = initial, 2 = added genre + mood
 */
export const CURRENT_DRAFT_VERSION = 2;

export interface IPlaylistDraft {
  version: number;
  savedAt: number;
  data: IPlaylistFormFields;
}

// ── Persistence status — replaces boolean explosion ───────────────────────────

/**
 * Discriminated union for the API round-trip.
 * Replaces: isLoading + isSubmitting + isSuccess + hasError + errorMessage.
 * Each variant carries only the data that makes sense for it.
 * Impossible combinations (e.g. loading + success simultaneously) are unrepresentable.
 */
export type PersistenceStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "submitting" }
  | { kind: "success"; id: string }
  | { kind: "error"; message: string };
