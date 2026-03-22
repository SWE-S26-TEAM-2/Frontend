/**
 * Formats a number into a compact human-readable string.
 * e.g. 312000 → "312.0K",  1500000 → "1.5M"
 * Replace with Intl.NumberFormat when i18n is needed.
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
}