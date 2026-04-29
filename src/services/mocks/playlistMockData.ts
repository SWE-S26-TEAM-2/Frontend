/**
 * Mock playlist data for development / testing.
 *
 * Supports multiple playlists keyed by string ID.
 * Uses local /covers/ assets — no external hostnames needed in next.config.ts.
 * Pattern mirrors src/services/mocks/mockData.ts (MOCK_TRACKS).
 */

import { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";

// ── Multiple mock playlists ───────────────────────────────────────────────────

const MOCK_PLAYLISTS: Record<string, IPlaylist> = {
  "123": {
    id: "123",
    title: "Midnight Frequencies",
    description:
      "A curated journey through late-night electronic sounds and ambient textures.",
    coverArt: "/covers/song1.jpg",
    creator: "Aurora Vex",
    tracks: [
      { id: "t1", title: "Neon Drift",        artist: "HΛLOGEN",           albumArt: "/covers/song1.jpg", duration: 214 },
      { id: "t2", title: "Subzero Bloom",     artist: "Crestfallen",       albumArt: "/covers/song2.jpg", duration: 187 },
      { id: "t3", title: "Glass Meridian",    artist: "Faulkner & Mist",   albumArt: "/covers/song1.jpg", duration: 302 },
      { id: "t4", title: "Ultraviolet Shore", artist: "HΛLOGEN",           albumArt: "/covers/song2.jpg", duration: 245 },
      { id: "t5", title: "Signal Loss",       artist: "The Static Garden", albumArt: "/covers/song1.jpg", duration: 198 },
      { id: "t6", title: "Phantom Latitude",  artist: "Crestfallen",       albumArt: "/covers/song2.jpg", duration: 273 },
      { id: "t7", title: "Ember Protocol",    artist: "Faulkner & Mist",   albumArt: "/covers/song1.jpg", duration: 221 },
    ],
  },

  "456": {
    id: "456",
    title: "Solar Bloom",
    description: "Warm, sun-drenched indie tracks for long summer drives.",
    coverArt: "/covers/song2.jpg",
    creator: "Dune Walker",
    tracks: [
      { id: "s1", title: "Golden Hour",    artist: "The Coasts",     albumArt: "/covers/song2.jpg", duration: 203 },
      { id: "s2", title: "Drift",          artist: "Pale Sun",       albumArt: "/covers/song1.jpg", duration: 178 },
      { id: "s3", title: "Salt & Sky",     artist: "The Coasts",     albumArt: "/covers/song2.jpg", duration: 241 },
      { id: "s4", title: "Barefoot Radio", artist: "Oceanside",      albumArt: "/covers/song1.jpg", duration: 195 },
      { id: "s5", title: "Sundowner",      artist: "Pale Sun",       albumArt: "/covers/song2.jpg", duration: 260 },
    ],
  },

  "789": {
    id: "789",
    title: "Deep Focus",
    description: "Minimal, instrumental music engineered for concentration.",
    coverArt: "/covers/song1.jpg",
    creator: "Flowstate",
    tracks: [
      { id: "f1", title: "Clarity",        artist: "Null Space",     albumArt: "/covers/song1.jpg", duration: 360 },
      { id: "f2", title: "White Walls",    artist: "Monochrome",     albumArt: "/covers/song2.jpg", duration: 420 },
      { id: "f3", title: "Low Tide",       artist: "Null Space",     albumArt: "/covers/song1.jpg", duration: 311 },
    ],
  },
};

/**
 * Fetch a mock playlist by ID.
 * Returns null if the ID is not found — this is intentional so the
 * error state ("Playlist not found") can be tested with any unknown ID.
 */
export function getMockPlaylistById(id: string): IPlaylist | null {
  return MOCK_PLAYLISTS[id] ?? null;
}

// ── Track array management helpers ────────────────────────────────────────────
// Pure functions — return new arrays, never mutate the input.

/**
 * Returns a new tracks array with the given track appended.
 * No-op if a track with the same id already exists.
 */
export function addTrackToList(
  tracks: IPlaylistTrack[],
  track: IPlaylistTrack
): IPlaylistTrack[] {
  if (tracks.some((t) => t.id === track.id)) return tracks;
  return [...tracks, track];
}

/**
 * Returns a new tracks array with the track matching `trackId` removed.
 */
export function removeTrackFromList(
  tracks: IPlaylistTrack[],
  trackId: string
): IPlaylistTrack[] {
  return tracks.filter((t) => t.id !== trackId);
}

/**
 * Returns a new tracks array with the item at `fromIndex` moved to `toIndex`.
 * Returns the original array unchanged if either index is out of bounds
 * or if `fromIndex === toIndex`.
 */
export function reorderTracks(
  tracks: IPlaylistTrack[],
  fromIndex: number,
  toIndex: number
): IPlaylistTrack[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= tracks.length ||
    toIndex >= tracks.length ||
    fromIndex === toIndex
  ) {
    return tracks;
  }
  const result = [...tracks];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}
