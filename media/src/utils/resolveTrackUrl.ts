/**
 * resolveTrackUrl — utility
 *
 * Returns a playable audio URL for a track.
 *
 * Strategy:
 *  1. Return the track's own url if it is populated by the backend.
 *  2. Fall back to cycling through local audio files (for tracks where
 *     the backend streaming URL hasn't resolved yet or is empty).
 *     Uses track ID for deterministic, stable assignment.
 */

/** Local audio files available in public/tracks/ */
const LOCAL_AUDIO_FILES = [
  "/tracks/song1.mp3",
  "/tracks/song2.mp3",
] as const;

/**
 * Returns a playable audio URL for the given track.
 *
 * @param url   The track's own URL (from the backend streaming endpoint)
 * @param id    The track ID — used to deterministically pick a local fallback
 */
export function resolveTrackUrl(url: string, id: string): string {
  if (url && url.trim().length > 0) return url;

  const numericHash = id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return LOCAL_AUDIO_FILES[numericHash % LOCAL_AUDIO_FILES.length];
}
