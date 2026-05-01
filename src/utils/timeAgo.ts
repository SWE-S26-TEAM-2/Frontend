/**
 * Converts an ISO 8601 timestamp to a relative "X minutes ago" string.
 * Replace with a proper library (e.g. date-fns or dayjs) when i18n is needed.
 */
export function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60)    return `${diff} seconds ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}