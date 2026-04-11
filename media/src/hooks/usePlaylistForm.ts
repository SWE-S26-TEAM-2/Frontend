/**
 * usePlaylistForm — composition hook
 *
 * Wires the three focused hooks into one public interface.
 * PlaylistForm.tsx imports from this path — unchanged from before.
 *
 * Composition:
 *   usePlaylistFormState   → fields, validation, dirty, undo-remove
 *   usePlaylistPersistence → API calls, PersistenceStatus machine
 *   usePlaylistDraft       → debounced autosave, versioned restore
 *
 * This hook owns zero state. It is a pure composition boundary.
 * Adding future hooks (usePlaylistCollaborators, etc.) means one line here.
 */

import { usePlaylistFormState }   from "@/hooks/usePlaylistFormState";
import { usePlaylistPersistence } from "@/hooks/usePlaylistPersistence";
import { usePlaylistDraft }       from "@/hooks/usePlaylistDraft";
import type {
  IPlaylistFormErrors,
  IPlaylistFormFields,
  IRemovedTrack,
  PersistenceStatus,
  PlaylistGenre,
  PlaylistMood,
  IPlaylistTrack,
} from "@/types/playlist.types";

type PlaylistFormMode = "create" | "edit";

interface IUsePlaylistFormOptions {
  mode: PlaylistFormMode;
  playlistId?: string;
  creatorName?: string;
}

export interface IUsePlaylistFormReturn {
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

  // Validation
  validationErrors: IPlaylistFormErrors;

  // API state (replaces boolean explosion)
  status: PersistenceStatus;

  // Undo
  removedTrack: IRemovedTrack | null;

  // Draft
  hasDraft: boolean;
  draftSavedAt: number | null;

  // Mode
  mode: PlaylistFormMode;

  // Field handlers
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

  // Submit
  handleSubmit: () => Promise<string | null>;

  // Draft handlers
  handleRestoreDraft: () => void;
  handleDiscardDraft: () => void;
}

export function usePlaylistForm({
  mode,
  playlistId,
  creatorName = "You",
}: IUsePlaylistFormOptions): IUsePlaylistFormReturn {
  // ── Hook 1: field state ────────────────────────────────────────────────────
  const formState = usePlaylistFormState();

  // ── Build current fields snapshot for the draft watcher ───────────────────
  const currentFields: IPlaylistFormFields = {
    title:       formState.title,
    description: formState.description,
    isPublic:    formState.isPublic,
    coverArt:    formState.coverArt,
    genre:       formState.genre,
    mood:        formState.mood,
    tracks:      formState.tracks,
  };

  // ── Hook 3: draft (before persistence so handleDiscardDraft is available) ──
  const draft = usePlaylistDraft({
    isActive:      mode === "create",
    fields:        currentFields,
    isDirty:       formState.isDirty,
    hydrateFields: formState.hydrateFields,
  });

  // ── Hook 2: persistence ────────────────────────────────────────────────────
  const persistence = usePlaylistPersistence({
    mode,
    playlistId,
    creatorName,
    formState: {
      title:               formState.title,
      description:         formState.description,
      isPublic:            formState.isPublic,
      coverArt:            formState.coverArt,
      genre:               formState.genre,
      mood:                formState.mood,
      tracks:              formState.tracks,
      setValidationErrors: formState.setValidationErrors,
      hydrateFields:       formState.hydrateFields,
      resetDirty:          formState.resetDirty,
    },
    // Clear localStorage draft on successful submit
    onSuccess: draft.handleDiscardDraft,
  });

  return {
    // Fields
    title:       formState.title,
    description: formState.description,
    isPublic:    formState.isPublic,
    coverArt:    formState.coverArt,
    genre:       formState.genre,
    mood:        formState.mood,
    tracks:      formState.tracks,

    // Derived
    totalDuration:     formState.totalDuration,
    addedTrackIds:     formState.addedTrackIds,
    hasUnsavedChanges: formState.hasUnsavedChanges,

    // Validation
    validationErrors: formState.validationErrors,

    // API status
    status: persistence.status,

    // Undo
    removedTrack: formState.removedTrack,

    // Draft
    hasDraft:     draft.hasDraft,
    draftSavedAt: draft.draftSavedAt,

    // Mode
    mode,

    // Handlers
    handleTitleChange:       formState.handleTitleChange,
    handleDescriptionChange: formState.handleDescriptionChange,
    handleTogglePublic:      formState.handleTogglePublic,
    handleCoverArtChange:    formState.handleCoverArtChange,
    handleGenreChange:       formState.handleGenreChange,
    handleMoodChange:        formState.handleMoodChange,
    handleAddTrack:          formState.handleAddTrack,
    handleRemoveTrack:       formState.handleRemoveTrack,
    handleUndoRemove:        formState.handleUndoRemove,
    handleReorderTracks:     formState.handleReorderTracks,
    handleSubmit:            persistence.submit,

    // Draft handlers
    handleRestoreDraft: draft.handleRestoreDraft,
    handleDiscardDraft: draft.handleDiscardDraft,
  };
}
