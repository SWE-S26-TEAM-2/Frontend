"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  IPlaylistTrack,
  IPlaylistFormErrors,
  IRemovedTrack,
} from "@/types/playlist.types";
import { formatDuration } from "@/utils/formatDuration";
import { formatPlaylistDuration } from "@/utils/formatPlaylistDuration";
import { PLAYLIST_UNDO_WINDOW_MS } from "@/constants/playlist.constants";
import styles from "./TrackListEditor.module.css";
import formStyles from "./PlaylistForm.module.css";

interface ITrackListEditorProps {
  tracks: IPlaylistTrack[];
  totalDuration: number;
  validationErrors: IPlaylistFormErrors;
  removedTrack?: IRemovedTrack | null;
  onRemoveTrack: (trackId: string) => void;
  onReorderTracks: (fromIndex: number, toIndex: number) => void;
  onUndoRemove?: () => void;
}

// ── Undo toast ──────────────────────────────────────────────────────────────

function UndoToast({
  removedTrack,
  onUndo,
}: {
  removedTrack: IRemovedTrack;
  onUndo: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = removedTrack.removedAt;
    const tick = () => {
      const elapsed   = Date.now() - start;
      const remaining = Math.max(0, 1 - elapsed / PLAYLIST_UNDO_WINDOW_MS);
      setProgress(remaining * 100);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [removedTrack.removedAt]);

  return (
    <div className={styles.tleUndoToast} role="status" aria-live="polite">
      <div
        className={styles.tleUndoToast__progress}
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
      <div className={styles.tleUndoToast__body}>
        <span className={styles.tleUndoToast__text}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          Removed <strong>{removedTrack.track.title}</strong>
        </span>
        <button
          className={styles.tleUndoToast__btn}
          onClick={onUndo}
          aria-label={`Undo removal of ${removedTrack.track.title}`}
        >
          Undo
        </button>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function TrackListEditor({
  tracks,
  totalDuration,
  validationErrors,
  removedTrack = null,
  onRemoveTrack,
  onReorderTracks,
  onUndoRemove,
}: ITrackListEditorProps) {
  const safeTracks = Array.isArray(tracks) ? tracks : [];

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragItem                  = useRef<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index;
    setDragIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    setOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (
      dragItem.current !== null &&
      overIndex !== null &&
      dragItem.current !== overIndex
    ) {
      onReorderTracks(dragItem.current, overIndex);
    }
    dragItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  }, [overIndex, onReorderTracks]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDragLeave = useCallback(
    (e: React.DragEvent, index: number) => {
      const related = e.relatedTarget as Node | null;
      const list = e.currentTarget.closest("ol");
      if (list && related && list.contains(related)) return;
      if (overIndex === index) setOverIndex(null);
    },
    [overIndex]
  );

  const handleMoveUp = useCallback(
    (index: number) => { if (index > 0) onReorderTracks(index, index - 1); },
    [onReorderTracks]
  );

  const handleMoveDown = useCallback(
    (index: number) => { if (index < safeTracks.length - 1) onReorderTracks(index, index + 1); },
    [safeTracks.length, onReorderTracks]
  );

  // ── Empty state ────────────────────────────────────────────────────────────

  if (safeTracks.length === 0) {
    return (
      <>
        {removedTrack && onUndoRemove && (
          <UndoToast removedTrack={removedTrack} onUndo={onUndoRemove} />
        )}
        <div className={styles.tleEmpty} role="status">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" className={styles.tleEmpty__icon}>
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <p className={styles.tleEmpty__text}>No tracks yet.</p>
          <p className={styles.tleEmpty__hint}>Search the catalogue on the right to add tracks.</p>
          {validationErrors?.tracks && (
            <span className={formStyles.pfError} role="alert" style={{ marginTop: 8 }}>
              {validationErrors.tracks}
            </span>
          )}
        </div>
      </>
    );
  }

  return (
    <div className={styles.tle}>
      {removedTrack && onUndoRemove && (
        <UndoToast removedTrack={removedTrack} onUndo={onUndoRemove} />
      )}

      <div className={styles.tle__header}>
        <span className={styles.tle__count}>
          {safeTracks.length} {safeTracks.length === 1 ? "track" : "tracks"}
          {" · "}
          <span className={styles.tle__durationTotal}>{formatDuration(totalDuration ?? 0)}</span>
        </span>
        <span className={styles.tle__hint}>Drag rows or use ↑↓ to reorder</span>
      </div>

      {validationErrors?.tracks && (
        <span className={formStyles.pfError} role="alert" style={{ display: "block", marginBottom: 8 }}>
          {validationErrors.tracks}
        </span>
      )}

      <ol className={styles.tle__list} role="list" aria-label="Playlist tracks">
        {safeTracks.map((track, index) => {
          const isDragging = dragIndex === index;
          const isOver     = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <li
              key={track.id}
              className={[
                styles.tle__item,
                isDragging ? styles["tle__item--dragging"]  : "",
                isOver     ? styles["tle__item--dragOver"]  : "",
              ].filter(Boolean).join(" ")}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={(e) => handleDragLeave(e, index)}
              aria-label={`${track.title} by ${track.artist}, position ${index + 1} of ${safeTracks.length}`}
            >
              <span className={styles.tle__dragHandle} aria-hidden="true" title="Drag to reorder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="9"  cy="5"  r="1.5" /><circle cx="15" cy="5"  r="1.5" />
                  <circle cx="9"  cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9"  cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                </svg>
              </span>

              <span className={styles.tle__index} aria-hidden="true">{index + 1}</span>

              <Image src={track.albumArt} alt="" width={40} height={40} className={styles.tle__cover} aria-hidden="true" />

              <div className={styles.tle__info}>
                <span className={styles.tle__title}>{track.title}</span>
                <span className={styles.tle__artist}>{track.artist}</span>
              </div>

              <span className={styles.tle__duration}>{formatDuration(track.duration ?? 0)}</span>

              <div className={styles.tle__kbdControls} aria-label={`Reorder ${track.title}`}>
                <button
                  className={styles.tle__kbdBtn}
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label={`Move ${track.title} up`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  className={styles.tle__kbdBtn}
                  onClick={() => handleMoveDown(index)}
                  disabled={index === safeTracks.length - 1}
                  aria-label={`Move ${track.title} down`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              <button
                className={styles.tle__removeBtn}
                onClick={() => onRemoveTrack(track.id)}
                aria-label={`Remove ${track.title} from playlist`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6"  x2="6"  y2="18" />
                  <line x1="6"  y1="6"  x2="18" y2="18" />
                </svg>
              </button>
            </li>
          );
        })}
      </ol>

      <div className={styles.tle__summary} aria-label="Playlist summary">
        <span className={styles.tle__summaryCount}>
          {safeTracks.length} {safeTracks.length === 1 ? "song" : "songs"}
        </span>
        <span className={styles.tle__summarySep} aria-hidden="true">·</span>
        <span className={styles.tle__summaryDuration}>
          {formatPlaylistDuration(totalDuration ?? 0)}
        </span>
      </div>
    </div>
  );
}
