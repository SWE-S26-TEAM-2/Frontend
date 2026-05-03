"use client";

/**
 * useLikedPlaylists.ts
 *
 * Hydrates and caches the current user's liked playlist IDs.
 * Used by PlaylistHeader to initialise the like button correctly on load.
 *
 * Module-level singleton so multiple components share the same state
 * without a Context Provider — safe for the playlist view use-case.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { playlistCache, CacheKeys } from "@/utils/playlistCache";
import type { IPlaylistService } from "@/types/playlist.types";

let sharedIds: Set<string> = new Set();
let initialized = false;
let initPromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((cb) => cb());
}

async function fetchFresh(service: IPlaylistService): Promise<void> {
  try {
    const liked = await service.getLikedPlaylists();
    // getLikedPlaylists returns IPlaylist[] — each has .id
    const ids = liked.map((p) => p.id).filter(Boolean);
    sharedIds = new Set(ids);
    initialized = true;
    playlistCache.set(CacheKeys.likedIds(), ids, 30_000);
    notify();
  } catch {
    // Non-fatal — user may not be authenticated
    initialized = true;
  }
}

async function initLikedIds(service: IPlaylistService): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const cacheKey = CacheKeys.likedIds();
    const cached = playlistCache.get<string[]>(cacheKey);
    if (cached) {
      sharedIds = new Set(cached.data);
      initialized = true;
      notify();
      if (cached.stale) {
        fetchFresh(service).catch(() => {/* silent */});
      }
      return;
    }
    await fetchFresh(service);
  })();

  return initPromise;
}

export interface IUseLikedPlaylistsReturn {
  isLiked: (playlistId: string) => boolean;
  toggleLike: (playlistId: string, currentLiked: boolean) => Promise<void>;
  likedIds: Set<string>;
  isLoading: boolean;
}

export function useLikedPlaylists(service: IPlaylistService): IUseLikedPlaylistsReturn {
  const [, forceRender] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialized);
  const pendingToggle = useRef<string | null>(null);

  useEffect(() => {
    const cb = () => {
      forceRender((n) => n + 1);
      setIsLoading(false);
    };
    subscribers.add(cb);

    if (!initialized) {
      initLikedIds(service).finally(() => setIsLoading(false));
    } else {
      // Defer to avoid synchronous setState within effect body
      Promise.resolve().then(() => setIsLoading(false));
    }

    return () => {
      subscribers.delete(cb);
    };
  }, [service]);

  const isLiked = useCallback(
    (playlistId: string) => sharedIds.has(playlistId),
    [],
  );

  const toggleLike = useCallback(
    async (playlistId: string, currentLiked: boolean): Promise<void> => {
      if (pendingToggle.current === playlistId) return;
      pendingToggle.current = playlistId;

      // Optimistic
      if (currentLiked) {
        sharedIds.delete(playlistId);
      } else {
        sharedIds.add(playlistId);
      }
      notify();

      try {
        if (currentLiked) {
          await service.unlikePlaylist(playlistId);
        } else {
          await service.likePlaylist(playlistId);
        }
        playlistCache.invalidate(CacheKeys.likedIds());
      } catch {
        // Rollback
        if (currentLiked) {
          sharedIds.add(playlistId);
        } else {
          sharedIds.delete(playlistId);
        }
        notify();
      } finally {
        pendingToggle.current = null;
      }
    },
    [service],
  );

  return { isLiked, toggleLike, likedIds: sharedIds, isLoading };
}

export function resetLikedPlaylistsState(): void {
  sharedIds = new Set();
  initialized = false;
  initPromise = null;
  playlistCache.invalidate(CacheKeys.likedIds());
}
