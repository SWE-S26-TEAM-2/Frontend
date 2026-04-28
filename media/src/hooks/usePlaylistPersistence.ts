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

import { useState, useEffect, useCallback } from "react";
import {
  IPlaylistFormFields,
  IPlaylistCreateInput,
  IPlaylistUpdateInput,
  PersistenceStatus,
} from "@/types/playlist.types";
import { playlistService } from "@/services";
import { PLAYLIST_FALLBACK_COVER } from "@/constants/playlist.constants";
import {
  validatePlaylistForm,
  hasFormErrors,
} from "@/hooks/usePlaylistFormState";
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
  submit: () => Promise<string | null>;
}

export function usePlaylistPersistence({
  mode,
  playlistId,
  creatorName = "You",
  formState,
  onSuccess,
}: IUsePlaylistPersistenceOptions): IUsePlaylistPersistenceReturn {
  const [status, setStatus] = useState<PersistenceStatus>(
    mode === "edit" && !!playlistId
      ? { kind: "loading" }
      : { kind: "idle" }
  );

  const {
    title, description, isPublic, coverArt, genre, mood, tracks,
    setValidationErrors, hydrateFields, resetDirty,
  } = formState;

  // ── Load (edit mode) ──────────────────────────────────────────────────────

  useEffect(() => {
    if (mode !== "edit" || !playlistId) {
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

  return { status, submit };
}
