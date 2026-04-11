/**
 * playlistUtils — pure array utility functions and static data for playlist track management.
 *
 * These functions have NO side effects, NO I/O, and NO dependency on any
 * service or mock layer. They operate solely on IPlaylistTrack arrays.
 *
 * Extracted from src/services/mocks/playlistMockData.ts so that hooks and
 * components can import them without violating the DI rule
 * (no imports from @/services/mocks/* or @/services/api/*).
 *
 * Consumed by:
 *  - src/hooks/usePlaylist.ts
 *  - src/hooks/usePlaylistFormState.ts
 *  - src/components/playlist/TrackSelector.tsx
 *  - src/services/mocks/playlist.mock.ts (internal helper)
 */

import type { IPlaylistTrack } from "@/types/playlist.types";

/**
 * Add a track to a playlist track array.
 * Deduplicates by track.id — if the track is already present, returns the
 * original array unchanged (referential equality preserved, no re-render).
 *
 * @param tracks - Current track array (may be non-array; treated as [])
 * @param track  - Track to add
 * @returns New array with track appended, or original if already present
 */
export function addTrackToList(
  tracks: IPlaylistTrack[],
  track: IPlaylistTrack
): IPlaylistTrack[] {
  const safeArr = Array.isArray(tracks) ? tracks : [];
  if (safeArr.some((t) => t.id === track.id)) return safeArr;
  return [...safeArr, track];
}

/**
 * Remove a track from a playlist track array by id.
 *
 * @param tracks  - Current track array (may be non-array; treated as [])
 * @param trackId - ID of the track to remove
 * @returns New array with the matching track excluded
 */
export function removeTrackFromList(
  tracks: IPlaylistTrack[],
  trackId: string
): IPlaylistTrack[] {
  return (Array.isArray(tracks) ? tracks : []).filter((t) => t.id !== trackId);
}

/**
 * Move a track from one position to another within a playlist track array.
 * Returns the original array unchanged if either index is out of bounds
 * or if fromIndex === toIndex.
 *
 * @param tracks    - Current track array (may be non-array; treated as [])
 * @param fromIndex - 0-based index of the track to move
 * @param toIndex   - 0-based destination index
 * @returns New array with the track moved, or original if no move needed
 */
export function reorderTracks(
  tracks: IPlaylistTrack[],
  fromIndex: number,
  toIndex: number
): IPlaylistTrack[] {
  const safeArr = Array.isArray(tracks) ? tracks : [];
  if (
    fromIndex < 0 || toIndex < 0 ||
    fromIndex >= safeArr.length || toIndex >= safeArr.length ||
    fromIndex === toIndex
  ) return safeArr;
  const result = [...safeArr];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

/**
 * Static catalogue of available tracks for the track selector.
 *
 * In development (mock mode) this is the full browseable catalogue.
 * In production, TrackSelector will receive tracks via props from a
 * real API call — this constant serves as the mock fallback.
 *
 * Moved here from @/services/mocks/playlistMockData so that
 * TrackSelector does not import from the mock service layer.
 */
export const AVAILABLE_TRACKS: IPlaylistTrack[] = [
  { id: "t1", title: "Neon Drift",        artist: "HΛLOGEN",           albumArt: "/covers/song1.jpg", duration: 214, url: "/tracks/song1.mp3" },
  { id: "t2", title: "Subzero Bloom",     artist: "Crestfallen",       albumArt: "/covers/song2.jpg", duration: 187, url: "/tracks/song2.mp3" },
  { id: "t3", title: "Glass Meridian",    artist: "Faulkner & Mist",   albumArt: "/covers/song1.jpg", duration: 302, url: "/tracks/song1.mp3" },
  { id: "t4", title: "Ultraviolet Shore", artist: "HΛLOGEN",           albumArt: "/covers/song2.jpg", duration: 245, url: "/tracks/song2.mp3" },
  { id: "t5", title: "Signal Loss",       artist: "The Static Garden", albumArt: "/covers/song1.jpg", duration: 198, url: "/tracks/song1.mp3" },
  { id: "t6", title: "Phantom Latitude",  artist: "Crestfallen",       albumArt: "/covers/song2.jpg", duration: 273, url: "/tracks/song2.mp3" },
  { id: "t7", title: "Ember Protocol",    artist: "Faulkner & Mist",   albumArt: "/covers/song1.jpg", duration: 221, url: "/tracks/song1.mp3" },
  { id: "s1", title: "Golden Hour",       artist: "The Coasts",        albumArt: "/covers/song2.jpg", duration: 203, url: "/tracks/song2.mp3" },
  { id: "s2", title: "Drift",             artist: "Pale Sun",          albumArt: "/covers/song1.jpg", duration: 178, url: "/tracks/song1.mp3" },
  { id: "s3", title: "Salt & Sky",        artist: "The Coasts",        albumArt: "/covers/song2.jpg", duration: 241, url: "/tracks/song2.mp3" },
  { id: "s4", title: "Barefoot Radio",    artist: "Oceanside",         albumArt: "/covers/song1.jpg", duration: 195, url: "/tracks/song1.mp3" },
  { id: "s5", title: "Sundowner",         artist: "Pale Sun",          albumArt: "/covers/song2.jpg", duration: 260, url: "/tracks/song2.mp3" },
  { id: "f1", title: "Clarity",           artist: "Null Space",        albumArt: "/covers/song1.jpg", duration: 360, url: "/tracks/song1.mp3" },
  { id: "f2", title: "White Walls",       artist: "Monochrome",        albumArt: "/covers/song2.jpg", duration: 420, url: "/tracks/song2.mp3" },
  { id: "f3", title: "Low Tide",          artist: "Null Space",        albumArt: "/covers/song1.jpg", duration: 311, url: "/tracks/song1.mp3" },
  { id: "x1", title: "Afterglow",         artist: "Vessel",            albumArt: "/covers/song2.jpg", duration: 232, url: "/tracks/song2.mp3" },
  { id: "x2", title: "Cascade",           artist: "Vessel",            albumArt: "/covers/song2.jpg", duration: 198, url: "/tracks/song2.mp3" },
  { id: "x3", title: "Iron Sky",          artist: "Meridian Arc",      albumArt: "/covers/song1.jpg", duration: 285, url: "/tracks/song1.mp3" },
  { id: "x4", title: "Hollow Point",      artist: "Meridian Arc",      albumArt: "/covers/song2.jpg", duration: 263, url: "/tracks/song2.mp3" },
  { id: "x5", title: "Prismatic",         artist: "Solstice",          albumArt: "/covers/song1.jpg", duration: 312, url: "/tracks/song1.mp3" },
];
