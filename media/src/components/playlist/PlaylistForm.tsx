"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PlaylistMetaForm from "./PlaylistMetaForm";
import TrackListEditor  from "./TrackListEditor";
import TrackSelector    from "./TrackSelector";
import SubmitActions    from "./SubmitActions";
import PlaylistSkeleton from "./PlaylistSkeleton";
import { usePlaylistForm } from "@/hooks/usePlaylistForm";
import styles from "./PlaylistForm.module.css";
import headerStyles from "./PlaylistHeader.module.css";
import pageStyles from "./PlaylistPage.module.css";

interface IPlaylistFormProps {
  mode: "create" | "edit";
  playlistId?: string;
}

export default function PlaylistForm({ mode, playlistId }: IPlaylistFormProps) {
  const router = useRouter();

  const {
    title, description, isPublic, coverArt, genre, mood,
    tracks, totalDuration, addedTrackIds, hasUnsavedChanges,
    validationErrors,
    status,
    removedTrack,
    hasDraft, draftSavedAt,
    handleTitleChange, handleDescriptionChange, handleTogglePublic,
    handleCoverArtChange, handleGenreChange, handleMoodChange,
    handleAddTrack, handleRemoveTrack, handleUndoRemove, handleReorderTracks,
    handleSubmit,
    handleRestoreDraft, handleDiscardDraft,
  } = usePlaylistForm({ mode, playlistId });

  useEffect(() => {
    if (status.kind !== "success") return;
    const timerId = setTimeout(
      () => router.push(`/playlist/${status.id}`),
      800
    );
    return () => clearTimeout(timerId);
  }, [status, router]);

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

  if (status.kind === "loading") return <PlaylistSkeleton />;

  if (mode === "edit" && status.kind === "error" && tracks.length === 0 && !title) {
    return (
      <div className={styles.pfPageWrapper}>
        <div className={pageStyles.playlistPage__state} role="alert">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
            className={pageStyles.playlistPage__errorIcon}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8"  x2="12"   y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className={pageStyles.playlistPage__stateText}>{status.message}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              className={`${headerStyles.playlistHeader__btn} ${headerStyles["playlistHeader__btn--ghost"]}`}
              onClick={() => router.back()}
            >
              Go back
            </button>
            <button
              className={`${headerStyles.playlistHeader__btn} ${headerStyles["playlistHeader__btn--primary"]}`}
              onClick={() => router.push("/playlist/create")}
            >
              Create new playlist
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pfPageWrapper}>
      <div className={styles.pfPage}>

        {/* Draft restore banner */}
        {hasDraft && (
          <div className={styles.pfDraftBanner} role="status">
            <div className={styles.pfDraftBanner__icon} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className={styles.pfDraftBanner__text}>
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
            <div className={styles.pfDraftBanner__actions}>
              <button
                className={`${styles.pfDraftBanner__btn} ${styles["pfDraftBanner__btn--restore"]}`}
                onClick={handleRestoreDraft}
              >
                Restore
              </button>
              <button
                className={`${styles.pfDraftBanner__btn} ${styles["pfDraftBanner__btn--discard"]}`}
                onClick={handleDiscardDraft}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumb + heading */}
        <div className={styles.pfPage__heading}>
          <div className={styles.pfPage__breadcrumb}>
            <button className={styles.pfBreadcrumbBtn} onClick={() => router.back()} aria-label="Go back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          </div>
          <h1 className={styles.pfPage__title}>
            {mode === "create" ? "Create Playlist" : "Edit Playlist"}
          </h1>
          <p className={styles.pfPage__subtitle}>
            {mode === "create"
              ? "Build a new playlist by adding tracks and setting details below."
              : "Update your playlist details and track order."}
          </p>
        </div>

        {/* Two-column layout */}
        <div className={styles.pfLayout}>
          <div className={styles.pfLayout__left}>

            <section className={styles.pfSection} aria-label="Playlist details">
              <h2 className={styles.pfSection__title}>Details</h2>
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

            <section className={styles.pfSection} aria-label="Playlist tracks">
              <h2 className={styles.pfSection__title}>Tracks</h2>
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

            <SubmitActions
              mode={mode}
              status={status}
              hasUnsavedChanges={hasUnsavedChanges}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
            />
          </div>

          <aside className={styles.pfLayout__right} aria-label="Add tracks from catalogue">
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
