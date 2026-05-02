/**
 * playlistUtils — pure array utility functions for playlist track management.
 *
 * These functions have NO side effects, NO I/O, and NO dependency on any
 * service layer. They operate solely on IPlaylistTrack arrays.
 *
 * Consumed by:
 *  - src/hooks/usePlaylist.ts
 *  - src/hooks/usePlaylistFormState.ts
 */

import type { IPlaylistTrack } from "@/types/playlist.types";

/**
 * Add a track to a playlist track array.
 * Deduplicates by track.id — if the track is already present, returns the
 * original array unchanged (referential equality preserved, no re-render).
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
