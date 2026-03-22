"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PlaylistMetaForm from "./PlaylistMetaForm";
import TrackListEditor  from "./TrackListEditor";
import TrackSelector    from "./TrackSelector";
import SubmitActions    from "./SubmitActions";
import PlaylistSkeleton from "./PlaylistSkeleton";
import { usePlaylistForm } from "@/hooks/usePlaylistForm";

interface IPlaylistFormProps {
  mode: "create" | "edit";
  playlistId?: string;
}

export default function PlaylistForm({ mode, playlistId }: IPlaylistFormProps) {
  const router = useRouter();

  const {
    // Fields
    title, description, isPublic, coverArt, genre, mood,
    // Tracks + derived
    tracks, totalDuration, addedTrackIds, hasUnsavedChanges,
    // Validation
    validationErrors,
    // API state machine (PersistenceStatus — replaces isLoading/isSubmitting/etc.)
    status,
    // Undo-remove
    removedTrack,
    // Draft autosave
    hasDraft, draftSavedAt,
    // Field handlers
    handleTitleChange, handleDescriptionChange, handleTogglePublic,
    handleCoverArtChange, handleGenreChange, handleMoodChange,
    // Track handlers
    handleAddTrack, handleRemoveTrack, handleUndoRemove, handleReorderTracks,
    // Submit
    handleSubmit,
    // Draft handlers
    handleRestoreDraft, handleDiscardDraft,
  } = usePlaylistForm({ mode, playlistId });

  // ── Auto-redirect on success ───────────────────────────────────────────────
  useEffect(() => {
    if (status.kind !== "success") return;
    const timerId = setTimeout(
      () => router.push(`/playlist/${status.id}`),
      800
    );
    return () => clearTimeout(timerId);
  }, [status, router]);

  // ── Cancel guard ───────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    if (mode === "edit" && playlistId) {
      router.push(`/playlist/${playlistId}`);
    } else {
      router.back();
    }
  };

  const handleFormSubmit = () => { void handleSubmit(); };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (status.kind === "loading") return <PlaylistSkeleton />;

  // ── Load error in edit mode ────────────────────────────────────────────────
  if (mode === "edit" && status.kind === "error" && tracks.length === 0 && !title) {
    return (
      <div className="pf-page-wrapper">
        <div className="playlist-page__state" role="alert">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
            className="playlist-page__error-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8"  x2="12"   y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="playlist-page__state-text">{status.message}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button className="playlist-header__btn playlist-header__btn--ghost"
              onClick={() => router.back()}>Go back</button>
            <button className="playlist-header__btn playlist-header__btn--primary"
              onClick={() => router.push("/playlist/create")}>Create new playlist</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="pf-page-wrapper">
      <div className="pf-page">

        {/* Draft restore banner — create mode only */}
        {hasDraft && (
          <div className="pf-draft-banner" role="status">
            <div className="pf-draft-banner__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="pf-draft-banner__text">
              <strong>Unsaved draft found</strong>
              {draftSavedAt != null && (
                <span>
                  Last saved{" "}
                  {new Date(draftSavedAt).toLocaleTimeString([], {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div className="pf-draft-banner__actions">
              <button
                className="pf-draft-banner__btn pf-draft-banner__btn--restore"
                onClick={handleRestoreDraft}
              >
                Restore
              </button>
              <button
                className="pf-draft-banner__btn pf-draft-banner__btn--discard"
                onClick={handleDiscardDraft}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumb + heading */}
        <div className="pf-page__heading">
          <div className="pf-page__breadcrumb">
            <button className="pf-breadcrumb-btn" onClick={() => router.back()} aria-label="Go back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          </div>
          <h1 className="pf-page__title">
            {mode === "create" ? "Create Playlist" : "Edit Playlist"}
          </h1>
          <p className="pf-page__subtitle">
            {mode === "create"
              ? "Build a new playlist by adding tracks and setting details below."
              : "Update your playlist details and track order."}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="pf-layout">
          <div className="pf-layout__left">

            {/* PlaylistMetaForm — tier1 interface: genre + mood required */}
            <section className="pf-section" aria-label="Playlist details">
              <h2 className="pf-section__title">Details</h2>
              <PlaylistMetaForm
                title={title}
                description={description}
                isPublic={isPublic}
                coverArt={coverArt}
                genre={genre}
                mood={mood}
                validationErrors={validationErrors}
                onTitleChange={handleTitleChange}
                onDescriptionChange={handleDescriptionChange}
                onTogglePublic={handleTogglePublic}
                onCoverArtChange={handleCoverArtChange}
                onGenreChange={handleGenreChange}
                onMoodChange={handleMoodChange}
              />
            </section>

            {/* TrackListEditor — tier1 interface: removedTrack + onUndoRemove */}
            <section className="pf-section" aria-label="Playlist tracks">
              <h2 className="pf-section__title">Tracks</h2>
              <TrackListEditor
                tracks={tracks}
                totalDuration={totalDuration}
                validationErrors={validationErrors}
                removedTrack={removedTrack}
                onRemoveTrack={handleRemoveTrack}
                onReorderTracks={handleReorderTracks}
                onUndoRemove={handleUndoRemove}
              />
            </section>

            {/* SubmitActions — tier1 interface: status union (not booleans) */}
            <SubmitActions
              mode={mode}
              status={status}
              hasUnsavedChanges={hasUnsavedChanges}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
            />
          </div>

          <aside className="pf-layout__right" aria-label="Add tracks from catalogue">
            <TrackSelector
              addedTrackIds={addedTrackIds}
              onAddTrack={handleAddTrack}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
