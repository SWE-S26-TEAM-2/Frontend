"use client";

import type { PersistenceStatus } from "@/types/playlist.types";
import styles from "./PlaylistForm.module.css";
import headerStyles from "./PlaylistHeader.module.css";

interface ISubmitActionsProps {
  mode: "create" | "edit";
  status: PersistenceStatus;
  hasUnsavedChanges: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function SubmitActions({
  mode,
  status,
  hasUnsavedChanges,
  onSubmit,
  onCancel,
}: ISubmitActionsProps) {
  const isSubmitting = status.kind === "submitting";
  const isSuccess    = status.kind === "success";
  const hasError     = status.kind === "error";
  const errorMessage = status.kind === "error" ? status.message : "";

  const submitLabel     = mode === "create" ? "Create Playlist" : "Save Changes";
  const submittingLabel = mode === "create" ? "Creating…"       : "Saving…";

  return (
    <div className={styles.pfActions}>
      {hasError && (
        <div className={styles.pfActions__error} role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8"   x2="12"    y2="12" />
            <line x1="12" y1="16"  x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {isSuccess && (
        <div className={styles.pfActions__success} role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            {mode === "create" ? "Playlist created! Redirecting…" : "Changes saved! Redirecting…"}
          </span>
        </div>
      )}

      {hasUnsavedChanges && !isSuccess && (
        <p className={styles.pfActions__unsaved} aria-live="polite">
          You have unsaved changes.
        </p>
      )}

      <div className={styles.pfActions__buttons}>
        <button
          type="button"
          className={`${headerStyles.playlistHeader__btn} ${headerStyles["playlistHeader__btn--ghost"]}`}
          onClick={onCancel}
          disabled={isSubmitting}
          aria-label="Cancel and go back"
        >
          Cancel
        </button>

        <button
          type="button"
          className={`${headerStyles.playlistHeader__btn} ${headerStyles["playlistHeader__btn--primary"]}`}
          onClick={onSubmit}
          disabled={isSubmitting || isSuccess}
          aria-label={isSubmitting ? submittingLabel : submitLabel}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.pfSpinner} aria-hidden="true" />
              {submittingLabel}
            </>
          ) : isSuccess ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Done
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
