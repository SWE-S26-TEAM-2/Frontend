/**
 * src/utils/messagingUtils.ts
 *
 * Pure utility functions for the messaging feature.
 * No side effects, no imports from other project files.
 */

/**
 * Format a timestamp for display in the conversation inbox.
 * - Today: "2:34 PM"
 * - This week: "Mon"
 * - Older: "Apr 3"
 */
export function formatConversationTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 1 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Format a timestamp for display inside a message bubble.
 * Always returns "2:34 PM" style.
 */
export function formatMessageTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format seconds into "m:ss" display (e.g. 193 → "3:13").
 */
export function formatTrackDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Group consecutive messages from the same sender together.
 * Returns an array of group arrays.
 */
export function groupMessagesBySender<T extends { senderId: string }>(
  messages: T[]
): T[][] {
  const groups: T[][] = [];
  let current: T[] = [];

  for (const msg of messages) {
    if (current.length === 0 || current[current.length - 1].senderId === msg.senderId) {
      current.push(msg);
    } else {
      groups.push(current);
      current = [msg];
    }
  }

  if (current.length > 0) groups.push(current);
  return groups;
}
