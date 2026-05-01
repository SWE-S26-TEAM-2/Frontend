"use client";

/**
 * usePlaylistSubscription.ts
 *
 * Simulates real-time updates via polling until a WebSocket/SSE backend exists.
 * Skips polls when tab is hidden. Does NOT overwrite local optimistic changes.
 * Plug-in ready: replace internals with WebSocket/SSE without touching consumers.
 */

import { useEffect, useRef, useCallback, useState, useLayoutEffect } from "react";
import { mergeServerTracks, type ITrackedTrack } from "@/utils/trackDiff";
import { playlistCache, CacheKeys } from "@/utils/playlistCache";
import type { IPlaylist, IPlaylistService } from "@/types/playlist.types";

export interface IUsePlaylistSubscriptionReturn {
  hasRemoteChanges: boolean;
  acknowledgeChanges: () => void;
  poll: () => void;
}

export interface IPlaylistSubscriptionOptions {
  intervalMs?: number;
  hasLocalChanges?: boolean;
  onUpdate?: (snapshot: IPlaylist, updatedTracks: ITrackedTrack[]) => void;
}

function playlistHash(p: IPlaylist): string {
  const trackIds = (p.tracks ?? []).map((t) => t.id).join(",");
  return `${p.title}|${p.description}|${p.coverArt}|${trackIds}`;
}

export function usePlaylistSubscription(
  playlistId: string | null,
  service: IPlaylistService,
  localTracks: ITrackedTrack[],
  options: IPlaylistSubscriptionOptions = {},
): IUsePlaylistSubscriptionReturn {
  const { intervalMs = 8_000, hasLocalChanges = false, onUpdate } = options;

  const [hasRemoteChanges, setHasRemoteChanges] = useState(false);
  const lastHashRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localTracksRef = useRef(localTracks);
  const hasLocalChangesRef = useRef(hasLocalChanges);

  useLayoutEffect(() => {
    localTracksRef.current = localTracks;
    hasLocalChangesRef.current = hasLocalChanges;
  });

  const doPoll = useCallback(async () => {
    if (!playlistId) return;

    try {
      const snapshot = await service.getById(playlistId);
      if (!snapshot) return;

      const hash = playlistHash(snapshot);

      if (lastHashRef.current === null) {
        lastHashRef.current = hash;
        playlistCache.set(CacheKeys.playlist(playlistId), snapshot, 60_000);
        return;
      }

      if (hash !== lastHashRef.current) {
        lastHashRef.current = hash;
        playlistCache.set(CacheKeys.playlist(playlistId), snapshot, 60_000);

        const serverTracks: ITrackedTrack[] = (snapshot.tracks ?? []).map((t, i) => ({
          track_id: t.id,
          position: i,
          title: t.title,
          artist: t.artist,
          albumArt: t.albumArt,
          url: t.url,
          duration: t.duration,
        }));

        const merged = mergeServerTracks(
          localTracksRef.current,
          serverTracks,
          hasLocalChangesRef.current,
        );

        setHasRemoteChanges(true);
        onUpdate?.(snapshot, merged);
      }
    } catch {
      // Silent — polling errors never surface to UI
    }
  }, [playlistId, service, onUpdate]);

  const poll = useCallback(() => { doPoll(); }, [doPoll]);

  useEffect(() => {
    if (!playlistId) return;

    // Defer initial poll to avoid synchronous setState within effect body
    const initialPoll = setTimeout(() => { doPoll(); }, 0);

    timerRef.current = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      doPoll();
    }, intervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") doPoll();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(initialPoll);
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [playlistId, intervalMs, doPoll]);

  const acknowledgeChanges = useCallback(() => {
    setHasRemoteChanges(false);
  }, []);

  return { hasRemoteChanges, acknowledgeChanges, poll };
}
