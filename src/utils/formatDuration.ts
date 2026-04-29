/**
 * Formats a duration in seconds to M:SS display format.
 * Matches the formatTime() pattern used in Footer/Footer.tsx.
 *
 * @example formatDuration(214) => "3:34"
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
