/**
 * usePlaylistPersistence — Hook 2 of 3
 *
 * Responsible ONLY for:
 *  - API calls (load existing playlist in edit mode, create, update)
 *  - PersistenceStatus state machine (replaces boolean explosion)
 *  - Hydrating form state after a successful load
 *  - Notifying the draft hook to clear on success
 *
 * NOT responsible for: field state, dirty tracking, draft persistence.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IPlaylistFormFields,
  IPlaylistCreateInput,
  IPlaylistUpdateInput,
  IPlaylistTrack,
  PersistenceStatus,
} from "@/types/playlist.types";
import { playlistService } from "@/services";
import { PLAYLIST_FALLBACK_COVER } from "@/constants/playlist.constants";
import {
  validatePlaylistForm,
  hasFormErrors,
} from "@/hooks/usePlaylistFormState";
import { computeTrackDiff } from "@/utils/trackDiff";
import { createPlaylistServiceExtensions } from "@/services/api/playlist.service.extensions";
import type { IUsePlaylistFormStateReturn } from "@/hooks/usePlaylistFormState";

type PlaylistFormMode = "create" | "edit";

interface IUsePlaylistPersistenceOptions {
  mode: PlaylistFormMode;
  playlistId?: string;
  creatorName?: string;
  formState: Pick<
    IUsePlaylistFormStateReturn,
    | "title"
    | "description"
    | "isPublic"
    | "coverArt"
    | "genre"
    | "mood"
    | "tracks"
    | "setValidationErrors"
    | "hydrateFields"
    | "resetDirty"
  >;
  onSuccess?: () => void;
}

export interface IUsePlaylistPersistenceReturn {
  status: PersistenceStatus;
  stepLabel: string;
  submit: () => Promise<string | null>;
}

export function usePlaylistPersistence({
  mode,
  playlistId,
  creatorName = "You",
  formState,
  onSuccess,
}: IUsePlaylistPersistenceOptions): IUsePlaylistPersistenceReturn {
  const [stepLabel, setStepLabel] = useState<string>("");
  const extRef = useRef(createPlaylistServiceExtensions(playlistService));
  const [status, setStatus] = useState<PersistenceStatus>(
    mode === "edit" && !!playlistId
      ? { kind: "loading" }
      : { kind: "idle" }
  );

  // Track IDs that existed when the playlist was first loaded (for diff on edit save)
  const originalTrackIdsRef = useRef<Set<string>>(new Set());

  const {
    title, description, isPublic, coverArt, genre, mood, tracks,
    setValidationErrors, hydrateFields, resetDirty,
  } = formState;

  // ── Load (edit mode) ──────────────────────────────────────────────────────

  useEffect(() => {
    if (mode !== "edit" || !playlistId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus({ kind: "idle" });
      return;
    }

    void (async () => {
      setStatus({ kind: "loading" });

      try {
        const data = await playlistService.getById(playlistId);

        if (!data) {
          setStatus({
            kind: "error",
            message: "Playlist not found. It may have been deleted or the ID is incorrect.",
          });
          return;
        }

        const safeFields: IPlaylistFormFields = {
          title:       data.title       ?? "",
          description: data.description ?? "",
          isPublic:    data.isPublic     ?? true,
          coverArt:    data.coverArt     || PLAYLIST_FALLBACK_COVER,
          genre:       data.genre        ?? "",
          mood:        data.mood         ?? "",
          tracks:      Array.isArray(data.tracks) ? data.tracks : [],
        };

        // Record original track IDs so we can diff on save
        originalTrackIdsRef.current = new Set(safeFields.tracks.map((t: IPlaylistTrack) => t.id));

        hydrateFields(safeFields);
        setStatus({ kind: "idle" });
      } catch (err) {
        setStatus({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Failed to load playlist. Please check your connection and try again.",
        });
      }
    })();
  // hydrateFields is stable (useCallback with empty deps)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, playlistId]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const submit = useCallback(async (): Promise<string | null> => {
    if (status.kind === "submitting" || status.kind === "loading") return null;

    const safeTracks = Array.isArray(tracks) ? tracks : [];
    const errors = validatePlaylistForm(title, safeTracks);
    if (hasFormErrors(errors)) {
      setValidationErrors(errors);
      return null;
    }

    setStepLabel("Creating playlist…");
    setStatus({ kind: "submitting" });

    try {
      let resultId: string;

      if (mode === "create") {
        const input: IPlaylistCreateInput = {
          title:       title.trim(),
          description: description.trim(),
          isPublic,
          coverArt:    coverArt || PLAYLIST_FALLBACK_COVER,
          genre:       genre    || undefined,
          mood:        mood     || undefined,
          tracks:      safeTracks,
        };
        const result = await playlistService.create(input, creatorName);
        resultId = result.id;

        // If cover was selected as a file (data URL), upload it now
        if (coverArt && coverArt.startsWith("data:")) {
          setStepLabel("Uploading cover…");
          try {
            const res = await fetch(coverArt);
            const blob = await res.blob();
            const file = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
            await extRef.current.uploadCoverWithRetry(resultId, file);
          } catch {
            // Non-critical: playlist created without cover
          }
        }

        // Sync tracks using batching with retry + partial failure handling
        if (safeTracks.length > 0) {
          setStepLabel("Adding tracks…");
          try {
            await extRef.current.batchAddTracks(resultId, safeTracks.map((t) => ({
              track_id: t.id,
              title: t.title,
              artist: t.artist,
              albumArt: t.albumArt,
              url: t.url,
              duration: t.duration,
            })));
          } catch {
            // Non-critical: playlist created, tracks partially synced
          }
        }
      } else {
        if (!playlistId) throw new Error("Playlist ID is required for update.");
        const input: IPlaylistUpdateInput = {
          id:          playlistId,
          title:       title.trim(),
          description: description.trim(),
          isPublic,
          coverArt:    coverArt || PLAYLIST_FALLBACK_COVER,
          genre:       genre    || undefined,
          mood:        mood     || undefined,
          tracks:      safeTracks,
        };
        const result = await playlistService.update(input);
        resultId = result.id;

        // Diff tracks using computeTrackDiff engine
        const prevTracked = Array.from(originalTrackIdsRef.current).map((id, i) => ({
          track_id: id, position: i,
        }));
        const nextTracked = safeTracks.map((t, i) => ({ track_id: t.id, position: i }));
        const { added: addedTracks, removed: removedTracks } = computeTrackDiff(prevTracked, nextTracked);

        if (addedTracks.length > 0 || removedTracks.length > 0) {
          setStepLabel("Syncing tracks…");
          try {
            await extRef.current.batchUpdateTracks(
              resultId,
              addedTracks.map((t) => {
                const full = safeTracks.find((s) => s.id === t.track_id);
                return {
                  track_id: t.track_id,
                  title: full?.title ?? "",
                  artist: full?.artist ?? "",
                  albumArt: full?.albumArt ?? "",
                  url: full?.url ?? "",
                  duration: full?.duration ?? 0,
                };
              }),
              removedTracks,
            );
          } catch {
            // Non-critical: continue
          }
        }

        // Update original refs to reflect saved state
        originalTrackIdsRef.current = new Set(safeTracks.map((t: IPlaylistTrack) => t.id));
      }

      resetDirty();
      setStatus({ kind: "success", id: resultId });
      onSuccess?.();
      return resultId;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setStatus({ kind: "error", message });
      return null;
    }
  }, [
    status.kind,
    title, description, isPublic, coverArt, genre, mood, tracks,
    mode, playlistId, creatorName,
    setValidationErrors, resetDirty, onSuccess,
  ]);

  return { status, stepLabel, submit };
}
