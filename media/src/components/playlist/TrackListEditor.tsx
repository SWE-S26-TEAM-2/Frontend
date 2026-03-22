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

interface ITrackListEditorProps {
  tracks: IPlaylistTrack[];
  totalDuration: number;
  validationErrors: IPlaylistFormErrors;
  /** May be null when there is nothing to undo */
  removedTrack?: IRemovedTrack | null;
  onRemoveTrack: (trackId: string) => void;
  onReorderTracks: (fromIndex: number, toIndex: number) => void;
  /** Optional — only needed when removedTrack is provided */
  onUndoRemove?: () => void;
}

// ── Undo toast with rAF-driven progress bar ───────────────────────────────────

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
    <div className="tle-undo-toast" role="status" aria-live="polite">
      <div
        className="tle-undo-toast__progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
      <div className="tle-undo-toast__body">
        <span className="tle-undo-toast__text">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          Removed <strong>{removedTrack.track.title}</strong>
        </span>
        <button
          className="tle-undo-toast__btn"
          onClick={onUndo}
          aria-label={`Undo removal of ${removedTrack.track.title}`}
        >
          Undo
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TrackListEditor({
  tracks,
  totalDuration,
  validationErrors,
  removedTrack = null,
  onRemoveTrack,
  onReorderTracks,
  onUndoRemove,
}: ITrackListEditorProps) {
  // Always treat tracks as an array — defensive against undefined prop
  const safeTracks = Array.isArray(tracks) ? tracks : [];

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragItem                  = useRef<number | null>(null);

  // ── Drag events ────────────────────────────────────────────────────────────

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
        <div className="tle-empty" role="status">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" className="tle-empty__icon">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <p className="tle-empty__text">No tracks yet.</p>
          <p className="tle-empty__hint">Search the catalogue on the right to add tracks.</p>
          {validationErrors?.tracks && (
            <span className="pf-error" role="alert" style={{ marginTop: 8 }}>
              {validationErrors.tracks}
            </span>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="tle">
      {/* Undo toast above list header */}
      {removedTrack && onUndoRemove && (
        <UndoToast removedTrack={removedTrack} onUndo={onUndoRemove} />
      )}

      <div className="tle__header">
        <span className="tle__count">
          {safeTracks.length} {safeTracks.length === 1 ? "track" : "tracks"}
          {" · "}
          <span className="tle__duration-total">{formatDuration(totalDuration ?? 0)}</span>
        </span>
        <span className="tle__hint">Drag rows or use ↑↓ to reorder</span>
      </div>

      {validationErrors?.tracks && (
        <span className="pf-error" role="alert" style={{ display: "block", marginBottom: 8 }}>
          {validationErrors.tracks}
        </span>
      )}

      <ol className="tle__list" role="list" aria-label="Playlist tracks">
        {safeTracks.map((track, index) => {
          const isDragging = dragIndex === index;
          const isOver     = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <li
              key={track.id}
              className={[
                "tle__item",
                isDragging ? "tle__item--dragging"  : "",
                isOver     ? "tle__item--drag-over" : "",
              ].filter(Boolean).join(" ")}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={(e) => handleDragLeave(e, index)}
              aria-label={`${track.title} by ${track.artist}, position ${index + 1} of ${safeTracks.length}`}
            >
              <span className="tle__drag-handle" aria-hidden="true" title="Drag to reorder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="9"  cy="5"  r="1.5" /><circle cx="15" cy="5"  r="1.5" />
                  <circle cx="9"  cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9"  cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                </svg>
              </span>

              <span className="tle__index" aria-hidden="true">{index + 1}</span>

              <Image src={track.albumArt} alt="" width={40} height={40} className="tle__cover" aria-hidden="true" />

              <div className="tle__info">
                <span className="tle__title">{track.title}</span>
                <span className="tle__artist">{track.artist}</span>
              </div>

              <span className="tle__duration">{formatDuration(track.duration ?? 0)}</span>

              <div className="tle__kbd-controls" aria-label={`Reorder ${track.title}`}>
                <button
                  className="tle__kbd-btn"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label={`Move ${track.title} up`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  className="tle__kbd-btn"
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
                className="tle__remove-btn"
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

      {/* Spotify-style summary banner */}
      <div className="tle__summary" aria-label="Playlist summary">
        <span className="tle__summary-count">
          {safeTracks.length} {safeTracks.length === 1 ? "song" : "songs"}
        </span>
        <span className="tle__summary-sep" aria-hidden="true">·</span>
        <span className="tle__summary-duration">
          {formatPlaylistDuration(totalDuration ?? 0)}
        </span>
      </div>
    </div>
  );
}
