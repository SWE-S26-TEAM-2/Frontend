/**
 * playlistCache.ts
 *
 * Lightweight in-memory TTL cache for playlist-related data.
 * Used by useLikedPlaylists to avoid redundant API calls
 * across component mounts within the same session.
 */

interface ICacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface ICacheResult<T> {
  data: T;
  /** true when the entry exists but has passed its TTL (serve stale, revalidate) */
  stale: boolean;
}

class PlaylistCache {
  private store = new Map<string, ICacheEntry<unknown>>();

  /**
   * Store a value under `key` for `ttlMs` milliseconds.
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      data: value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Retrieve a cached value.
   * Returns null if the key was never set.
   * Returns { data, stale: true } when the entry is past its TTL but still present
   * (callers can serve stale and trigger a background refresh).
   */
  get<T>(key: string): ICacheResult<T> | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return {
      data: entry.data as T,
      stale: Date.now() > entry.expiresAt,
    };
  }

  /**
   * Remove a single key so the next read triggers a fresh fetch.
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear the entire cache (e.g. on logout).
   */
  clear(): void {
    this.store.clear();
  }
}

/** Singleton shared across the app for the lifetime of the tab. */
export const playlistCache = new PlaylistCache();

/** Centralised key builders — prevents typo-driven cache misses. */
export const CacheKeys = {
  likedIds: () => "liked-playlist-ids",
  playlist: (id: string) => `playlist:${id}`,
  userPlaylists: (userId: string) => `user-playlists:${userId}`,
} as const;
