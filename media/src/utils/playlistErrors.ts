/**
 * playlistErrors.ts
 *
 * Centralised error handling for all playlist operations.
 *
 * Goals:
 *  • Convert raw API / network errors into user-friendly messages
 *  • Provide structured context for logging
 *  • Expose retry semantics (retryable vs terminal)
 *  • Never leak internal stack traces to UI copy
 */

export type PlaylistErrorContext =
  | "create"
  | "update"
  | "delete"
  | "addTrack"
  | "removeTrack"
  | "uploadCover"
  | "like"
  | "unlike"
  | "fetch"
  | "fetchLiked"
  | "fetchUserPlaylists";

export interface IPlaylistError {
  /** Human-readable message safe to display in UI */
  message: string;
  /** Original error for logging / debugging */
  raw: unknown;
  /** Whether a retry is likely to succeed */
  retryable: boolean;
  context: PlaylistErrorContext;
}

const CONTEXT_MESSAGES: Record<PlaylistErrorContext, string> = {
  create: "Failed to create playlist",
  update: "Failed to save changes",
  delete: "Failed to delete playlist",
  addTrack: "Failed to add track",
  removeTrack: "Failed to remove track",
  uploadCover: "Failed to upload cover image",
  like: "Failed to like playlist",
  unlike: "Failed to unlike playlist",
  fetch: "Failed to load playlist",
  fetchLiked: "Failed to load liked playlists",
  fetchUserPlaylists: "Failed to load playlists",
};

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) return true;
  if (error instanceof Error && error.message.toLowerCase().includes("network"))
    return true;
  return false;
}

function getHttpStatus(error: unknown): number | null {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }
  return null;
}

/**
 * handleIPlaylistError
 *
 * Call at every catch boundary inside playlist hooks / services.
 * Returns a structured IPlaylistError. Side-effect: logs to console in dev.
 *
 * @example
 * try {
 *   await playlistService.create(...)
 * } catch (e) {
 *   const err = handleIPlaylistError(e, "create")
 *   setError(err.message)
 *   if (err.retryable) scheduleRetry(...)
 * }
 */
export function handleIPlaylistError(
  error: unknown,
  context: PlaylistErrorContext,
): IPlaylistError {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Playlist:${context}]`, error);
  }

  const status = getHttpStatus(error);
  const base = CONTEXT_MESSAGES[context];

  // 401 — session expired, not retryable (apiClient should have refreshed)
  if (status === 401) {
    return {
      message: "Session expired. Please sign in again.",
      raw: error,
      retryable: false,
      context,
    };
  }

  // 403 — permission denied
  if (status === 403) {
    return {
      message: "You don't have permission to do that.",
      raw: error,
      retryable: false,
      context,
    };
  }

  // 404 — resource gone
  if (status === 404) {
    return {
      message: `${base}: not found.`,
      raw: error,
      retryable: false,
      context,
    };
  }

  // 409 — conflict (e.g. duplicate track)
  if (status === 409) {
    return {
      message: `${base}: conflict with existing data.`,
      raw: error,
      retryable: false,
      context,
    };
  }

  // 5xx or network — retryable
  if (status && status >= 500) {
    return {
      message: `${base}. Server error — please try again.`,
      raw: error,
      retryable: true,
      context,
    };
  }

  if (isNetworkError(error)) {
    return {
      message: `${base}. Check your connection and try again.`,
      raw: error,
      retryable: true,
      context,
    };
  }

  // Generic fallback
  return {
    message: `${base}. Please try again.`,
    raw: error,
    retryable: true,
    context,
  };
}

/**
 * isPlaylistError — type guard
 */
export function isPlaylistError(e: unknown): e is IPlaylistError {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    "retryable" in e &&
    "context" in e
  );
}
