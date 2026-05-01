/**
 * trackDiff.ts
 * Pure utility — no framework dependencies.
 *
 * Computes the minimal set of API operations needed to transition
 * a playlist's track list from one state to another.
 *
 * Backend constraints (from progress doc):
 *   • POST /playlists/{id}/tracks         { track_id }  — add one
 *   • DELETE /playlists/{id}/tracks/{id}               — remove one
 *   • No bulk / reorder endpoint exists
 *
 * This engine is the single source of truth for diffing used by
 * usePlaylistController, usePlaylistPersistence, and any future
 * batch layer.
 */

export interface ITrackedTrack {
  track_id: string;
  /** Local-only field — never sent to backend */
  position: number;
  // any other backend fields (title, stream_url, etc.) may be present
  [key: string]: unknown;
}

export interface ITrackDiffResult {
  /** Tracks present in next but not prev */
  added: ITrackedTrack[];
  /** Tracks present in prev but not next */
  removed: ITrackedTrack[];
  /**
   * True when the relative order of *shared* tracks differs between
   * prev and next. Purely informational for the controller; the backend
   * has no reorder endpoint so this flag drives local-only re-render.
   */
  reordered: boolean;
}

/**
 * computeTrackDiff
 *
 * @param prevTracks  — track list before the user's edits (server truth)
 * @param nextTracks  — track list after the user's edits (local state)
 */
export function computeTrackDiff(
  prevTracks: ITrackedTrack[],
  nextTracks: ITrackedTrack[],
): ITrackDiffResult {
  const prevIds = new Set(prevTracks.map((t) => t.track_id));
  const nextIds = new Set(nextTracks.map((t) => t.track_id));

  const added = nextTracks.filter((t) => !prevIds.has(t.track_id));
  const removed = prevTracks.filter((t) => !nextIds.has(t.track_id));

  // Detect reorder among tracks that exist in both snapshots
  const sharedPrev = prevTracks.filter((t) => nextIds.has(t.track_id));
  const sharedNext = nextTracks.filter((t) => prevIds.has(t.track_id));
  const reordered = sharedPrev.some(
    (t, i) => sharedNext[i]?.track_id !== t.track_id,
  );

  return { added, removed, reordered };
}

/**
 * assignPositions
 *
 * Stamps a local `position` field onto each track in array order.
 * Call this whenever the in-memory list is mutated so position is
 * always consistent with rendering index.
 */
export function assignPositions(tracks: ITrackedTrack[]): ITrackedTrack[] {
  return tracks.map((t, i) => ({ ...t, position: i }));
}

/**
 * sortByPosition
 *
 * Sorts an unsorted array of tracks by their local `position` field.
 * Deterministic — used on every render to guarantee stable ordering.
 */
export function sortByPosition(tracks: ITrackedTrack[]): ITrackedTrack[] {
  return [...tracks].sort((a, b) => a.position - b.position);
}

/**
 * mergeServerTracks
 *
 * Merges a fresh server snapshot into an existing local list while
 * preserving user-authored local order. New tracks from server are
 * appended at the end; removed tracks are dropped; existing tracks
 * keep their local position.
 *
 * Used by usePlaylistSubscription to apply polling updates without
 * clobbering optimistic state.
 */
export function mergeServerTracks(
  localTracks: ITrackedTrack[],
  serverTracks: ITrackedTrack[],
  hasLocalChanges: boolean,
): ITrackedTrack[] {
  if (hasLocalChanges) {
    // Don't overwrite unsaved local edits; just update metadata fields
    return localTracks.map((local) => {
      const fresh = serverTracks.find((s) => s.track_id === local.track_id);
      return fresh ? { ...fresh, position: local.position } : local;
    });
  }

  // No local changes — safe to take server order
  return assignPositions(
    serverTracks.map((t, i) => ({ ...t, position: i })),
  );
}
