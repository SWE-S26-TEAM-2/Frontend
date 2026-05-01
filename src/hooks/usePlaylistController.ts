"use client";

/**
 * usePlaylistController.ts
 *
 * Single source of truth for all playlist mutations.
 * Orchestrates: state, tracks, cover, like, save status.
 * Serialises all mutations via MutationQueue to prevent race conditions.
 * Integrates with optimistic state, cache, and diff engine.
 *
 * Compatible with the actual realPlaylistService / IPlaylistService interface.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useOptimisticState } from "@/hooks/useOptimisticState";
import { createMutationQueue } from "@/utils/mutationQueue";
import {
  computeTrackDiff,
  assignPositions,
  sortByPosition,
  type ITrackedTrack,
} from "@/utils/trackDiff";
import { handleIPlaylistError, type IPlaylistError } from "@/utils/playlistErrors";
import { playlistCache, CacheKeys } from "@/utils/playlistCache";
import { createPlaylistServiceExtensions } from "@/services/api/playlist.service.extensions";
import type { IPlaylistService, IPlaylistTrack } from "@/types/playlist.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SaveStep =
  | "idle"
  | "creating"
  | "uploading-cover"
  | "syncing-tracks"
  | "updating"
  | "done"
  | "error";

export interface IPlaylistMetadata {
  name: string;
  description: string;
  coverUrl: string | null;
  coverArtLocal: string | null;
  coverFile: File | null;
}

export interface ILikeState {
  isLiked: boolean;
  isPending: boolean;
}

export interface IPlaylistControllerState {
  playlistId: string | null;
  metadata: IPlaylistMetadata;
  tracks: ITrackedTrack[];
  likeState: ILikeState;
  saveStep: SaveStep;
  saveStepLabel: string;
  error: IPlaylistError | null;
  canEdit: boolean;
  hasUnsavedChanges: boolean;
  pendingMutations: number;
}

export interface ICreatePlaylistInput {
  name: string;
  description: string;
  coverUrl?: string | null;
  coverFile?: File | null;
  /** coverDataUrl: a data: URL from FileReader — uploaded immediately after create */
  coverDataUrl?: string | null;
  tracks?: IPlaylistTrack[];
}

export interface IUpdatePlaylistInput {
  name?: string;
  description?: string;
  coverUrl?: string | null;
  coverFile?: File | null;
  coverDataUrl?: string | null;
  tracks?: IPlaylistTrack[];
}

const STEP_LABELS: Record<SaveStep, string> = {
  idle: "",
  creating: "Creating playlist…",
  "uploading-cover": "Uploading cover…",
  "syncing-tracks": "Adding tracks…",
  updating: "Saving changes…",
  done: "Saved!",
  error: "Something went wrong",
};

function resolveCanEdit(playlistUserId: string | null): boolean {
  if (!playlistUserId) return false;
  try {
    const storedId = localStorage.getItem("auth_user_id");
    const storedUsername = localStorage.getItem("auth_username");
    // Backend returns user_id — compare against both stored variants
    return (
      (!!storedId && storedId === playlistUserId) ||
      (!!storedUsername && storedUsername === playlistUserId)
    );
  } catch {
    return false;
  }
}

/** Convert IPlaylistTrack → ITrackedTrack */
function toITrackedTrack(t: IPlaylistTrack, index: number): ITrackedTrack {
  return {
    track_id: t.id,
    position: index,
    title: t.title,
    artist: t.artist,
    albumArt: t.albumArt,
    url: t.url,
    duration: t.duration,
    // preserve any extra fields
  };
}

/** Convert ITrackedTrack → IPlaylistTrack */
function fromITrackedTrack(t: ITrackedTrack): IPlaylistTrack {
  return {
    id: t.track_id,
    title: (t.title as string) ?? "",
    artist: (t.artist as string) ?? "",
    albumArt: (t.albumArt as string) ?? "",
    url: (t.url as string) ?? "",
    duration: (t.duration as number) ?? 0,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlaylistController(service: IPlaylistService) {
  const queueRef = useRef(createMutationQueue());
  const extRef = useRef(createPlaylistServiceExtensions(service));

  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [playlistUserId, setPlaylistUserId] = useState<string | null>(null);
  const [saveStep, setSaveStep] = useState<SaveStep>("idle");
  const [error, setError] = useState<IPlaylistError | null>(null);
  const [pendingMutations, setPendingMutations] = useState(0);

  const {
    state: metadata,
    mutate: mutateMeta,
    forceSet: forceSetMeta,
  } = useOptimisticState<IPlaylistMetadata>({
    name: "",
    description: "",
    coverUrl: null,
    coverArtLocal: null,
    coverFile: null,
  });

  const {
    state: tracks,
    mutate: mutateTracks,
    forceSet: forceSetTracks,
  } = useOptimisticState<ITrackedTrack[]>([]);

  const {
    state: likeState,
    mutate: mutateLike,
    forceSet: forceSetLike,
  } = useOptimisticState<ILikeState>({ isLiked: false, isPending: false });

  const serverTracksRef = useRef<ITrackedTrack[]>([]);
  const hasUnsavedChangesRef = useRef(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Keep ref and state in sync for mutation handlers
  const setHasUnsaved = (value: boolean) => {
    hasUnsavedChangesRef.current = value;
    setHasUnsavedChanges(value);
  };

  const setStep = (step: SaveStep) => setSaveStep(step);

  const trackPending = useCallback((delta: number) => {
    setPendingMutations((n) => Math.max(0, n + delta));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ── hydrate ──────────────────────────────────────────────────────────────────

  const hydrate = useCallback(
    async (id: string) => {
      setStep("idle");
      setError(null);

      const cacheKey = CacheKeys.playlist(id);
      const cached = playlistCache.get<ReturnType<typeof service.getById> extends Promise<infer R> ? NonNullable<R> : never>(cacheKey);

      const applyData = (data: NonNullable<Awaited<ReturnType<typeof service.getById>>>) => {
        setPlaylistId(data.id);
        setPlaylistUserId(data.creator ?? null);
        forceSetMeta({
          name: data.title,
          description: data.description ?? "",
          coverUrl: data.coverArt ?? null,
          coverArtLocal: null,
          coverFile: null,
        });
        const positioned = assignPositions(
          (data.tracks ?? []).map((t, i) => toITrackedTrack(t, i)),
        );
        forceSetTracks(positioned);
        serverTracksRef.current = positioned;
        setHasUnsaved(false);
      };

      if (cached) {
        applyData(cached.data);
        if (!cached.stale) return;
      }

      try {
        const fresh = await service.getById(id);
        if (fresh) {
          playlistCache.set(cacheKey, fresh, 60_000);
          applyData(fresh);
        }
      } catch (err) {
        const structured = handleIPlaylistError(err, "fetch");
        setError(structured);
      }
    },
    [service, forceSetMeta, forceSetTracks],
  );

  // ── createPlaylist ───────────────────────────────────────────────────────────

  const createPlaylist = useCallback(
    async (input: ICreatePlaylistInput): Promise<string | null> => {
      setError(null);

      return queueRef.current.enqueue(async () => {
        try {
          setStep("creating");
          const creatorName =
            typeof localStorage !== "undefined"
              ? (localStorage.getItem("auth_username") ?? "user")
              : "user";

          const result = await service.create(
            {
              title: input.name,
              description: input.description,
              isPublic: true,
              coverArt: input.coverUrl ?? "",
              tracks: input.tracks ?? [],
            },
            creatorName,
          );
          const newId = result.id;
          setPlaylistId(newId);

          // Step 2: Cover upload
          if (input.coverFile) {
            setStep("uploading-cover");
            try {
              const url = await extRef.current.uploadCoverWithRetry(newId, input.coverFile);
              forceSetMeta((prev: IPlaylistMetadata) => ({ ...prev, coverUrl: url, coverFile: null }));
            } catch (err) {
              console.warn("[PlaylistController] Cover upload failed:", err);
            }
          } else if (input.coverDataUrl) {
            setStep("uploading-cover");
            try {
              const res = await fetch(input.coverDataUrl);
              const blob = await res.blob();
              const file = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
              const url = await extRef.current.uploadCoverWithRetry(newId, file);
              forceSetMeta((prev: IPlaylistMetadata) => ({ ...prev, coverUrl: url, coverFile: null }));
            } catch (err) {
              console.warn("[PlaylistController] Cover (data URL) upload failed:", err);
            }
          }

          // Step 3: Tracks
          if (input.tracks && input.tracks.length > 0) {
            setStep("syncing-tracks");
            const tracked = input.tracks.map((t, i) => toITrackedTrack(t, i));
            const { failed } = await extRef.current.batchAddTracks(newId, tracked);
            if (failed.length > 0) {
              console.warn(`[PlaylistController] ${failed.length} track(s) failed to add`, failed);
            }
            forceSetTracks(assignPositions(tracked));
            serverTracksRef.current = assignPositions(tracked);
          }

          // Invalidate user playlist cache
          try {
            const un = localStorage.getItem("auth_username");
            if (un) playlistCache.invalidate(CacheKeys.userPlaylists(un));
          } catch {/* ignore */}

          setStep("done");
          setHasUnsaved(false);
          return newId;
        } catch (err) {
          const structured = handleIPlaylistError(err, "create");
          setError(structured);
          setStep("error");
          return null;
        }
      });
    },
    [service, forceSetMeta, forceSetTracks],
  );

  // ── updatePlaylist ───────────────────────────────────────────────────────────

  const updatePlaylist = useCallback(
    async (input: IUpdatePlaylistInput): Promise<boolean> => {
      if (!playlistId) return false;
      setError(null);

      return queueRef.current.enqueue(async () => {
        try {
          setStep("updating");

          // 1. Metadata
          const updatePayload: Parameters<typeof service.update>[0] = { id: playlistId };
          if (input.name !== undefined) updatePayload.title = input.name;
          if (input.description !== undefined) updatePayload.description = input.description;
          if (input.coverUrl !== undefined) updatePayload.coverArt = input.coverUrl ?? undefined;

          await service.update(updatePayload);

          // 2. Cover file
          if (input.coverFile) {
            setStep("uploading-cover");
            try {
              const url = await extRef.current.uploadCoverWithRetry(playlistId, input.coverFile);
              forceSetMeta((prev: IPlaylistMetadata) => ({ ...prev, coverUrl: url, coverFile: null }));
            } catch (err) {
              console.warn("[PlaylistController] Cover upload failed:", err);
            }
          } else if (input.coverDataUrl) {
            setStep("uploading-cover");
            try {
              const res = await fetch(input.coverDataUrl);
              const blob = await res.blob();
              const file = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
              const url = await extRef.current.uploadCoverWithRetry(playlistId, file);
              forceSetMeta((prev: IPlaylistMetadata) => ({ ...prev, coverUrl: url, coverFile: null }));
            } catch (err) {
              console.warn("[PlaylistController] Cover upload failed:", err);
            }
          }

          // 3. Track diff + sync
          if (input.tracks !== undefined) {
            setStep("syncing-tracks");
            const nextTracked = input.tracks.map((t, i) => toITrackedTrack(t, i));
            const { added, removed } = computeTrackDiff(
              serverTracksRef.current,
              sortByPosition(nextTracked),
            );

            if (added.length > 0 || removed.length > 0) {
              const { failed } = await extRef.current.batchUpdateTracks(
                playlistId,
                added,
                removed,
              );
              if (failed.length > 0) {
                console.warn(
                  `[PlaylistController] ${failed.length} track operation(s) failed`,
                  failed,
                );
              }
            }

            const next = assignPositions(sortByPosition(nextTracked));
            forceSetTracks(next);
            serverTracksRef.current = next;
          }

          // Invalidate caches
          playlistCache.invalidate(CacheKeys.playlist(playlistId));
          try {
            const un = localStorage.getItem("auth_username");
            if (un) playlistCache.invalidate(CacheKeys.userPlaylists(un));
          } catch {/* ignore */}

          setStep("done");
          setHasUnsaved(false);
          return true;
        } catch (err) {
          const structured = handleIPlaylistError(err, "update");
          setError(structured);
          setStep("error");
          return false;
        }
      });
    },
    [playlistId, service, forceSetMeta, forceSetTracks],
  );

  // ── addTracks ────────────────────────────────────────────────────────────────

  const addTracks = useCallback(
    async (newTracks: IPlaylistTrack[]): Promise<void> => {
      if (!playlistId) return;
      trackPending(newTracks.length);

      const newTracked = newTracks.map((t, i) =>
        toITrackedTrack(t, serverTracksRef.current.length + i),
      );

      await mutateTracks(
        (prev) => assignPositions([...prev, ...newTracked]),
        async () => {
          await queueRef.current.enqueue(async () => {
            const { failed } = await extRef.current.batchAddTracks(playlistId, newTracked);
            if (failed.length) throw new Error(failed[0].error);
          });
        },
      );

      setHasUnsaved(true);
      trackPending(-newTracks.length);
    },
    [playlistId, mutateTracks, trackPending],
  );

  // ── removeTracks ─────────────────────────────────────────────────────────────

  const removeTracks = useCallback(
    async (trackIds: string[]): Promise<void> => {
      if (!playlistId) return;
      trackPending(trackIds.length);

      const idSet = new Set(trackIds);
      await mutateTracks(
        (prev) => assignPositions(prev.filter((t) => !idSet.has(t.track_id))),
        async () => {
          await queueRef.current.enqueue(async () => {
            const { failed } = await extRef.current.batchRemoveTracks(playlistId, trackIds);
            if (failed.length) throw new Error(failed[0].error);
          });
        },
      );

      setHasUnsaved(true);
      trackPending(-trackIds.length);
    },
    [playlistId, mutateTracks, trackPending],
  );

  // ── reorderTracks (local only) ───────────────────────────────────────────────

  const reorderTracks = useCallback(
    (fromIndex: number, toIndex: number): void => {
      forceSetTracks((prev: ITrackedTrack[]) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return assignPositions(next);
      });
      setHasUnsaved(true);
    },
    [forceSetTracks],
  );

  // ── toggleLike ────────────────────────────────────────────────────────────────

  const toggleLike = useCallback(async (): Promise<void> => {
    if (!playlistId || likeState.isPending) return;
    const wasLiked = likeState.isLiked;

    await mutateLike(
      (prev) => ({ isLiked: !prev.isLiked, isPending: true }),
      async () => {
        try {
          if (wasLiked) {
            await service.unlikePlaylist(playlistId);
          } else {
            await service.likePlaylist(playlistId);
          }
          extRef.current.invalidateLikedCache();
        } finally {
          forceSetLike((prev: ILikeState) => ({ ...prev, isPending: false }));
        }
      },
    );
  }, [playlistId, likeState, mutateLike, forceSetLike, service]);

  // ── setLikeState (from useLikedPlaylists hydration) ─────────────────────────

  const setLikeState = useCallback(
    (isLiked: boolean) => {
      forceSetLike({ isLiked, isPending: false });
    },
    [forceSetLike],
  );

  // ── uploadCover ───────────────────────────────────────────────────────────────

  const uploadCover = useCallback(
    async (file: File): Promise<void> => {
      if (!playlistId) return;

      await queueRef.current.enqueue(async () => {
        try {
          const url = await extRef.current.uploadCoverWithRetry(playlistId, file);
          forceSetMeta((prev: IPlaylistMetadata) => ({ ...prev, coverUrl: url, coverFile: null }));
          playlistCache.invalidate(CacheKeys.playlist(playlistId));
        } catch (err) {
          const structured = handleIPlaylistError(err, "uploadCover");
          setError(structured);
        }
      });
    },
    [playlistId, forceSetMeta],
  );

  // ── deletePlaylist ────────────────────────────────────────────────────────────

  const deletePlaylist = useCallback(async (): Promise<boolean> => {
    if (!playlistId) return false;

    return queueRef.current.enqueue(async () => {
      try {
        await service.deletePlaylist(playlistId);
        playlistCache.invalidate(CacheKeys.playlist(playlistId));
        try {
          const un = localStorage.getItem("auth_username");
          if (un) playlistCache.invalidate(CacheKeys.userPlaylists(un));
        } catch {/* ignore */}
        return true;
      } catch (err) {
        const structured = handleIPlaylistError(err, "delete");
        setError(structured);
        return false;
      }
    });
  }, [playlistId, service]);

  // ── Track queue depth ─────────────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingMutations(queueRef.current.size);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const canEdit = resolveCanEdit(playlistUserId);

  const state: IPlaylistControllerState = {
    playlistId,
    metadata,
    tracks: sortByPosition(tracks),
    likeState,
    saveStep,
    saveStepLabel: STEP_LABELS[saveStep],
    error,
    canEdit,
    hasUnsavedChanges,
    pendingMutations,
  };

  const actions = {
    hydrate,
    createPlaylist,
    updatePlaylist,
    addTracks,
    removeTracks,
    reorderTracks,
    toggleLike,
    setLikeState,
    uploadCover,
    deletePlaylist,
    clearError,
  };

  /** Helper to convert ITrackedTrack[] back to IPlaylistTrack[] for existing hooks */
  const tracksAsPlaylistTracks: IPlaylistTrack[] = state.tracks.map(fromITrackedTrack);

  return { state, actions, tracksAsPlaylistTracks };
}
