/**
 * Playlist feature — app-wide constants
 * Convention: UPPER_SNAKE_CASE
 */

import type { PlaylistGenre, PlaylistMood } from "@/types/playlist.types";

export const PLAYLIST_MOCK_DELAY_MS    = 800;
export const PLAYLIST_FALLBACK_COVER   = "/covers/song1.jpg";
export const PLAYLIST_MOCK_DEFAULT_ID  = "123";
export const PLAYLIST_TITLE_MAX_LENGTH = 100;
export const PLAYLIST_MIN_TRACKS       = 1;
export const PLAYLIST_MOCK_ID_PREFIX   = "mock-";

// ── Undo-remove ───────────────────────────────────────────────────────────────

export const PLAYLIST_UNDO_WINDOW_MS = 5000;

// ── Draft autosave ────────────────────────────────────────────────────────────

export const PLAYLIST_DRAFT_LS_KEY        = "sc_playlist_draft";
export const PLAYLIST_DRAFT_DEBOUNCE_MS   = 2000;

// ── Genre / Mood catalogues ───────────────────────────────────────────────────

export const PLAYLIST_GENRES: PlaylistGenre[] = [
  "Electronic",
  "Hip-Hop",
  "Pop",
  "Rock",
  "R&B",
  "Jazz",
  "Classical",
  "Ambient",
  "Country",
  "Latin",
  "Religious",
  "Other",
];

export const PLAYLIST_MOODS: PlaylistMood[] = [
  "Chill",
  "Focus",
  "Workout",
  "Party",
  "Sad",
  "Happy",
  "Romantic",
  "Sleep",
];
