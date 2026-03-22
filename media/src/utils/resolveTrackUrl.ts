/**
 * resolveTrackUrl — utility
 *
 * Maps a playlist track ID to a real audio file URL.
 *
 * WHY THIS EXISTS:
 * IPlaylistTrack.url is populated by the backend streaming endpoint.
 * In mock mode (NEXT_PUBLIC_USE_MOCK_API=true) all tracks have url: ""
 * because no backend is running. This utility fills that gap so the
 * audio player has something to play during local development.
 *
 * Strategy:
 *  1. Return the track's own url if it is already populated.
 *  2. Cycle through the two available local audio files
 *     (/tracks/song1.mp3, /tracks/song2.mp3) based on the track ID,
 *     so every track plays something and the player is fully testable.
 *
 * In production this function is a no-op — the backend provides real URLs
 * and condition 1 always applies.
 */

/** Local audio files available in public/tracks/ */
const LOCAL_AUDIO_FILES = [
  "/tracks/song1.mp3",
  "/tracks/song2.mp3",
] as const;

/**
 * Returns a playable audio URL for the given track.
 *
 * @param url   The track's own URL (may be empty string in mock mode)
 * @param id    The track ID — used to deterministically pick a local file
 */
export function resolveTrackUrl(url: string, id: string): string {
  // If the track already has a real URL, use it directly
  if (url && url.trim().length > 0) return url;

  // Cycle through available local files using the track ID
  // This is deterministic: the same ID always maps to the same file
  const numericHash = id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return LOCAL_AUDIO_FILES[numericHash % LOCAL_AUDIO_FILES.length];
}
