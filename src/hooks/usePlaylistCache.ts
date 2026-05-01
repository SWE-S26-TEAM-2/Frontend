"use client";

/**
 * usePlaylistCache.ts
 *
 * React hook interface to the playlist cache.
 * Useful for components that want to pre-warm or invalidate cache entries.
 */

import { useCallback } from "react";
import { playlistCache, CacheKeys } from "@/utils/playlistCache";
import type { IPlaylist } from "@/types/playlist.types";

export interface IUsePlaylistCacheReturn {
  getPlaylist: (id: string) => IPlaylist | null;
  setPlaylist: (id: string, playlist: IPlaylist, ttlMs?: number) => void;
  invalidatePlaylist: (id: string) => void;
  getUserPlaylists: (username: string) => IPlaylist[] | null;
  setUserPlaylists: (username: string, playlists: IPlaylist[], ttlMs?: number) => void;
  invalidateUserPlaylists: (username: string) => void;
  invalidateAll: () => void;
}

export function usePlaylistCache(): IUsePlaylistCacheReturn {
  const getPlaylist = useCallback((id: string): IPlaylist | null => {
    const result = playlistCache.get<IPlaylist>(CacheKeys.playlist(id));
    return result ? result.data : null;
  }, []);

  const setPlaylist = useCallback((id: string, playlist: IPlaylist, ttlMs = 60_000) => {
    playlistCache.set(CacheKeys.playlist(id), playlist, ttlMs);
  }, []);

  const invalidatePlaylist = useCallback((id: string) => {
    playlistCache.invalidate(CacheKeys.playlist(id));
  }, []);

  const getUserPlaylists = useCallback((username: string): IPlaylist[] | null => {
    const result = playlistCache.get<IPlaylist[]>(CacheKeys.userPlaylists(username));
    return result ? result.data : null;
  }, []);

  const setUserPlaylists = useCallback(
    (username: string, playlists: IPlaylist[], ttlMs = 30_000) => {
      playlistCache.set(CacheKeys.userPlaylists(username), playlists, ttlMs);
    },
    [],
  );

  const invalidateUserPlaylists = useCallback((username: string) => {
    playlistCache.invalidate(CacheKeys.userPlaylists(username));
  }, []);

  const invalidateAll = useCallback(() => {
    playlistCache.clear();
  }, []);

  return {
    getPlaylist,
    setPlaylist,
    invalidatePlaylist,
    getUserPlaylists,
    setUserPlaylists,
    invalidateUserPlaylists,
    invalidateAll,
  };
}
