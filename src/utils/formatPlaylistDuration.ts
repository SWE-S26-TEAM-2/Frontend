/**
 * formatPlaylistDuration — Spotify-style total duration formatter
 *
 *   < 60 s   → "45 sec"
 *   < 1 hr   → "32 min 14 sec"
 *   >= 1 hr  → "1 hr 12 min"  (seconds omitted above one hour, matching Spotify)
 */
export function formatPlaylistDuration(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return "0 sec";

  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    const parts = [`${hours} hr`];
    if (minutes > 0) parts.push(`${minutes} min`);
    return parts.join(" ");
  }

  if (minutes > 0) {
    const parts = [`${minutes} min`];
    if (seconds > 0) parts.push(`${seconds} sec`);
    return parts.join(" ");
  }

  return `${seconds} sec`;
}
