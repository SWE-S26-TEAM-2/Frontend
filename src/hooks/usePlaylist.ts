/**
 * usePlaylist — custom hook
 *
 * Responsibilities (Playlists & Interactions domain):
 *  - Fetch playlist by ID via DI-aware playlistService
 *  - Skeleton loading state (isLoading starts true — skeleton renders immediately)
 *  - Error state with human-readable message
 *  - Retry mechanism (up to MAX_RETRIES attempts)
 *  - Managing arrays of tracks: add / remove / reorder
 *
 * React Compiler note:
 *   Uses inline async IIFE inside useEffect to satisfy the
 *   react-hooks/set-state-in-effect rule enforced by Next.js 16 +
 *   reactCompiler:true. All setState calls happen inside the async
 *   boundary, not synchronously in the effect body.
 */

import { useEffect, useState, useCallback } from "react";
import { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";
import { playlistService } from "@/services";
import {
  addTrackToList,
  removeTrackFromList,
  reorderTracks,
} from "@/services/mocks/playlistMockData";

const MAX_RETRIES = 3;

interface IUsePlaylistReturn {
  playlist: IPlaylist | null;
  tracks: IPlaylistTrack[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  retryCount: number;
  canRetry: boolean;
  handleRetry: () => void;
  handleAddTrack: (track: IPlaylistTrack) => void;
  handleRemoveTrack: (trackId: string) => void;
  handleReorderTracks: (fromIndex: number, toIndex: number) => void;
}

export function usePlaylist(id: string): IUsePlaylistReturn {
  // isLoading initialises to true so the skeleton renders on the very
  // first paint — before the effect even runs.
  const [playlist, setPlaylist]         = useState<IPlaylist | null>(null);
  const [tracks, setTracks]             = useState<IPlaylistTrack[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [hasError, setHasError]         = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount]     = useState(0);

  useEffect(() => {
    if (!id) return;

    // Inline async IIFE — satisfies react-hooks/set-state-in-effect.
    void (async () => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      try {
        const data = await playlistService.getById(id);
        if (!data) {
          setHasError(true);
          setErrorMessage("Playlist not found.");
        } else {
          setPlaylist(data);
          setTracks(data.tracks);
        }
      } catch {
        setHasError(true);
        setErrorMessage(
          "Failed to load playlist. Please check your connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, retryCount]);

  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) return;
    setRetryCount((prev) => prev + 1);
  }, [retryCount]);

  // ── Track array management ─────────────────────────────────────────────────
  // Each handler uses the functional setState form to guarantee it always
  // operates on the latest state, avoiding stale-closure bugs.

  const handleAddTrack = useCallback((track: IPlaylistTrack) => {
    setTracks((prev) => addTrackToList(prev, track));
  }, []);

  const handleRemoveTrack = useCallback((trackId: string) => {
    setTracks((prev) => removeTrackFromList(prev, trackId));
  }, []);

  const handleReorderTracks = useCallback(
    (fromIndex: number, toIndex: number) => {
      setTracks((prev) => reorderTracks(prev, fromIndex, toIndex));
    },
    []
  );

  return {
    playlist,
    tracks,
    isLoading,
    hasError,
    errorMessage,
    retryCount,
    canRetry: retryCount < MAX_RETRIES,
    handleRetry,
    handleAddTrack,
    handleRemoveTrack,
    handleReorderTracks,
  };
}
