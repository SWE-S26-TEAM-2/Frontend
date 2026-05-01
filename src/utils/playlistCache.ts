/**
 * playlistCache.ts
 *
 * Two-tier cache for playlist data:
 *   L1 — in-memory Map (process lifetime, instant reads)
 *   L2 — localStorage (survives page refresh, JSON-serialised)
 *
 * Cache keys:
 *   playlist:{id}          — IPlaylist detail
 *   userPlaylists:{username} — IPlaylist[]
 *   likedIds               — Set<string> of liked playlist IDs
 *
 * TTL: configurable per entry; defaults 60 s for detail, 30 s for lists.
 * Stale entries are served immediately while a fresh fetch is triggered
 * by the consumer (stale-while-revalidate pattern).
 */

interface ICacheEntry<T> {
  data: T;
  /** Unix timestamp ms when entry was written */
  timestamp: number;
  /** TTL in ms */
  ttl: number;
}

function isExpired<T>(entry: ICacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const memoryCache = new Map<string, ICacheEntry<any>>();

const LS_PREFIX = "sc_playlist_cache_";

function lsRead<T>(key: string): ICacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as ICacheEntry<T>;
  } catch {
    return null;
  }
}

function lsWrite<T>(key: string, entry: ICacheEntry<T>): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or SSR — silently ignore
  }
}

function lsDelete(key: string): void {
  try {
    localStorage.removeItem(LS_PREFIX + key);
  } catch {
    // ignore
  }
}

export const playlistCache = {
  /**
   * set — write to L1 + L2
   */
  set<T>(key: string, data: T, ttlMs = 60_000): void {
    const entry: ICacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlMs };
    memoryCache.set(key, entry);
    lsWrite(key, entry);
  },

  /**
   * get — read from L1 first, fall back to L2.
   * Returns { data, stale } — stale=true means TTL expired but data present.
   * Returns null if nothing cached.
   */
  get<T>(key: string): { data: T; stale: boolean } | null {
    // L1
    const memEntry = memoryCache.get(key) as ICacheEntry<T> | undefined;
    if (memEntry) {
      return { data: memEntry.data, stale: isExpired(memEntry) };
    }

    // L2
    const lsEntry = lsRead<T>(key);
    if (lsEntry) {
      // Warm L1 from L2
      memoryCache.set(key, lsEntry);
      return { data: lsEntry.data, stale: isExpired(lsEntry) };
    }

    return null;
  },

  /**
   * invalidate — remove from both tiers
   */
  invalidate(key: string): void {
    memoryCache.delete(key);
    lsDelete(key);
  },

  /**
   * invalidatePrefix — bulk invalidation (e.g. all user playlists)
   */
  invalidatePrefix(prefix: string): void {
    // L1
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
    // L2 — enumerate known keys
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX + prefix)) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },

  clear(): void {
    memoryCache.clear();
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },
};

// ─── Semantic key helpers ────────────────────────────────────────────────────

export const CacheKeys = {
  playlist: (id: string) => `playlist:${id}`,
  userPlaylists: (username: string) => `userPlaylists:${username}`,
  likedIds: () => `likedIds`,
} as const;
