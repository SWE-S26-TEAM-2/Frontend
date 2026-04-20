"use client";

import { useCallback, useEffect, useState } from "react";
import { playlistService } from "@/services/di";
import type { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";

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
  handleRemoveTrack: (trackId: string) => void;
}

export function usePlaylist(id: string): IUsePlaylistReturn {
  const [playlist, setPlaylist] = useState<IPlaylist | null>(null);
  const [tracks, setTracks] = useState<IPlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!id) {
      setPlaylist(null);
      setTracks([]);
      setHasError(true);
      setErrorMessage("Playlist ID is missing.");
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    void (async () => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      try {
        const data = await playlistService.getPlaylistById(id);

        if (isCancelled) {
          return;
        }

        setPlaylist(data);
        setTracks(data.tracks);
      } catch {
        if (isCancelled) {
          return;
        }

        setPlaylist(null);
        setTracks([]);
        setHasError(true);
        setErrorMessage("Failed to load playlist. Please try again.");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [id, retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount((previous) => {
      if (previous >= MAX_RETRIES) {
        return previous;
      }

      return previous + 1;
    });
  }, []);

  const handleRemoveTrack = useCallback((trackId: string) => {
    setTracks((previousTracks) =>
      previousTracks
        .filter((playlistTrack) => playlistTrack.track.id !== trackId)
        .map((playlistTrack, index) => ({
          ...playlistTrack,
          position: index + 1,
        }))
    );
  }, []);

  return {
    playlist,
    tracks,
    isLoading,
    hasError,
    errorMessage,
    retryCount,
    canRetry: retryCount < MAX_RETRIES,
    handleRetry,
    handleRemoveTrack,
  };
}
