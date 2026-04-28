"use client";

/**
 * usePlaylistFormState — Hook 1 of 3
 *
 * Responsible ONLY for:
 *  - Form field state and all user-facing field handlers
 *  - Derived values (totalDuration, addedTrackIds, hasUnsavedChanges)
 *  - Lazy per-field validation (clears on change, runs on submit attempt)
 *  - Dirty tracking (isDirty / resetDirty)
 *  - Undo-remove (5s window, restores to original index)
 *
 * NOT responsible for: API calls, loading state, draft persistence.
 *
 * DI compliance:
 *  - No service calls in this hook (form state only)
 *  - Array helpers imported from "@/utils/playlistUtils" (pure utils)
 *  - NO imports from "@/services/mocks/*" or "@/services/api/*"
 *
 * Key design decisions:
 *  - All state initialised with safe defaults — nothing is ever undefined
 *  - hydrateFields batches all state sets without marking isDirty (system-driven)
 *  - undoTimerRef is a ref, not state — timer changes never trigger re-renders
 *  - validatePlaylistForm / hasFormErrors exported for use in usePlaylistPersistence
 */

import { useState, useCallback, useMemo, useRef } from "react";
import type {
  IPlaylistTrack,
  IPlaylistFormErrors,
  IPlaylistFormFields,
  IRemovedTrack,
  PlaylistGenre,
  PlaylistMood,
} from "@/types/playlist.types";
import {
  addTrackToList,
  removeTrackFromList,
  reorderTracks,
} from "@/utils/playlistUtils";
import {
  PLAYLIST_TITLE_MAX_LENGTH,
  PLAYLIST_MIN_TRACKS,
  PLAYLIST_FALLBACK_COVER,
  PLAYLIST_UNDO_WINDOW_MS,
} from "@/constants/playlist.constants";

// ── Validation helpers (pure, exported for usePlaylistPersistence) ─────────────

export function validatePlaylistForm(
  title: string,
  tracks: IPlaylistTrack[]
): IPlaylistFormErrors {
  const errors: IPlaylistFormErrors = {};
  const trimmed = title.trim();

  if (!trimmed) {
    errors.title = "Playlist title is required.";
  } else if (trimmed.length > PLAYLIST_TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${PLAYLIST_TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (!Array.isArray(tracks) || tracks.length < PLAYLIST_MIN_TRACKS) {
    errors.tracks = `Add at least ${PLAYLIST_MIN_TRACKS} track to save the playlist.`;
  }

  return errors;
}

export function hasFormErrors(errors: IPlaylistFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

// ── Return shape ──────────────────────────────────────────────────────────────

export interface IUsePlaylistFormStateReturn {
  // Fields
  title: string;
  description: string;
  isPublic: boolean;
  coverArt: string;
  genre: PlaylistGenre | "";
  mood: PlaylistMood | "";
  tracks: IPlaylistTrack[];

  // Derived
  totalDuration: number;
  addedTrackIds: Set<string>;
  hasUnsavedChanges: boolean;
  isDirty: boolean;

  // Validation
  validationErrors: IPlaylistFormErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<IPlaylistFormErrors>>;

  // Undo
  removedTrack: IRemovedTrack | null;

  // Lifecycle
  resetDirty: () => void;
  hydrateFields: (fields: IPlaylistFormFields) => void;

  // User handlers
  handleTitleChange: (value: string) => void;
  handleDescriptionChange: (value: string) => void;
  handleTogglePublic: () => void;
  handleCoverArtChange: (url: string) => void;
  handleGenreChange: (value: PlaylistGenre | "") => void;
  handleMoodChange: (value: PlaylistMood | "") => void;
  handleAddTrack: (track: IPlaylistTrack) => void;
  handleRemoveTrack: (trackId: string) => void;
  handleUndoRemove: () => void;
  handleReorderTracks: (fromIndex: number, toIndex: number) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePlaylistFormState(): IUsePlaylistFormStateReturn {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic]       = useState(true);
  const [coverArt, setCoverArt]       = useState(PLAYLIST_FALLBACK_COVER);
  const [genre, setGenre]             = useState<PlaylistGenre | "">("");
  const [mood, setMood]               = useState<PlaylistMood | "">("");
  const [tracks, setTracks]           = useState<IPlaylistTrack[]>([]);
  const [isDirty, setIsDirty]         = useState(false);
  const [validationErrors, setValidationErrors] =
    useState<IPlaylistFormErrors>({});
  const [removedTrack, setRemovedTrack] = useState<IRemovedTrack | null>(null);

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalDuration = useMemo(
    () => tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0),
    [tracks]
  );

  const addedTrackIds = useMemo(
    () => new Set(tracks.map((t) => t.id)),
    [tracks]
  );

  const hasUnsavedChanges = isDirty;

  // ── Hydration (does NOT mark isDirty) ─────────────────────────────────────

  const hydrateFields = useCallback((fields: IPlaylistFormFields) => {
    setTitle(fields.title ?? "");
    setDescription(fields.description ?? "");
    setIsPublic(fields.isPublic ?? true);
    setCoverArt(fields.coverArt || PLAYLIST_FALLBACK_COVER);
    setGenre(fields.genre ?? "");
    setMood(fields.mood ?? "");
    setTracks(Array.isArray(fields.tracks) ? fields.tracks : []);
    // Intentionally NOT marking dirty — hydration is system-driven
  }, []);

  const resetDirty = useCallback(() => setIsDirty(false), []);

  // ── Field handlers ─────────────────────────────────────────────────────────

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    setIsDirty(true);
    setValidationErrors((prev) => {
      if (!prev.title) return prev;
      const { title: omittedTitle, ...rest } = prev;
      void omittedTitle;
      return rest;
    });
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    setIsDirty(true);
  }, []);

  const handleTogglePublic = useCallback(() => {
    setIsPublic((prev) => !prev);
    setIsDirty(true);
  }, []);

  const handleCoverArtChange = useCallback((url: string) => {
    setCoverArt(url);
    setIsDirty(true);
  }, []);

  const handleGenreChange = useCallback((value: PlaylistGenre | "") => {
    setGenre(value);
    setIsDirty(true);
  }, []);

  const handleMoodChange = useCallback((value: PlaylistMood | "") => {
    setMood(value);
    setIsDirty(true);
  }, []);

  const handleAddTrack = useCallback((track: IPlaylistTrack) => {
    setTracks((prev) => addTrackToList(prev, track));
    setIsDirty(true);
    setValidationErrors((prev) => {
      if (!prev.tracks) return prev;
      const { tracks: omittedTracks, ...rest } = prev;
      void omittedTracks;
      return rest;
    });
  }, []);

  // ── Undo-remove ────────────────────────────────────────────────────────────

  const handleRemoveTrack = useCallback((trackId: string) => {
    setTracks((prev) => {
      const safeArr = Array.isArray(prev) ? prev : [];
      const index = safeArr.findIndex((t) => t.id === trackId);
      if (index === -1) return safeArr;

      setRemovedTrack({
        track: safeArr[index],
        index,
        removedAt: Date.now(),
      });

      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setRemovedTrack((cur) => (cur?.track.id === trackId ? null : cur));
      }, PLAYLIST_UNDO_WINDOW_MS);

      return removeTrackFromList(safeArr, trackId);
    });
    setIsDirty(true);
  }, []);

  const handleUndoRemove = useCallback(() => {
    if (!removedTrack) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    setTracks((prev) => {
      const safeArr = Array.isArray(prev) ? prev : [];
      const at = Math.min(removedTrack.index, safeArr.length);
      const result = [...safeArr];
      result.splice(at, 0, removedTrack.track);
      return result;
    });
    setRemovedTrack(null);
    setIsDirty(true);
  }, [removedTrack]);

  const handleReorderTracks = useCallback(
    (fromIndex: number, toIndex: number) => {
      setTracks((prev) =>
        reorderTracks(Array.isArray(prev) ? prev : [], fromIndex, toIndex)
      );
      setIsDirty(true);
    },
    []
  );

  return {
    title, description, isPublic, coverArt, genre, mood, tracks,
    totalDuration, addedTrackIds, hasUnsavedChanges, isDirty,
    validationErrors, setValidationErrors,
    removedTrack,
    resetDirty, hydrateFields,
    handleTitleChange, handleDescriptionChange, handleTogglePublic,
    handleCoverArtChange, handleGenreChange, handleMoodChange,
    handleAddTrack, handleRemoveTrack, handleUndoRemove, handleReorderTracks,
  };
}
