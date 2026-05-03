'use client';

/**
 * src/components/messaging/TrackPicker.tsx
 *
 * Floating track-selection panel.
 *
 * Uses position:fixed (not absolute) so it is never clipped by any
 * overflow:hidden/auto ancestor (scroll containers, flex pages, etc.).
 * The anchor element ref is passed in so we can calculate position from
 * its getBoundingClientRect on open and on window resize.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  RefObject,
} from 'react';
import Image from 'next/image';
import styles from './TrackPicker.module.css';
import { formatTrackDuration } from '@/utils/messagingUtils';
import type { ITrack } from '@/types/track.types';

export interface ITrackPickerProps {
  /** Ref to the 🎵 button — used to calculate panel position */
  anchorRef: RefObject<HTMLButtonElement | null>;
  tracks: ITrack[];
  isLoading: boolean;
  onSelect: (track: ITrack) => void;
  onClose: () => void;
}

export function TrackPicker({ anchorRef, tracks, isLoading, onSelect, onClose }: ITrackPickerProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Position calculation ─────────────────────────────────────────────────────

  const [pos, setPos] = useState({ bottom: 80, left: 12 });

  const recalcPos = useCallback(() => {
    const btn = anchorRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    // Panel sits above the button with 10px gap
    const bottom = window.innerHeight - rect.top + 10;
    const left = Math.min(rect.left, window.innerWidth - 312); // 300px + 12px margin
    setPos({ bottom, left: Math.max(8, left) });
  }, [anchorRef]);

  useEffect(() => {
    recalcPos();
    window.addEventListener('resize', recalcPos);
    return () => window.removeEventListener('resize', recalcPos);
  }, [recalcPos]);

  // ── Focus search input ───────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // ── Close on Escape / click outside ─────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleMouseDown = (e: MouseEvent) => {
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      const target = e.target as Node;
      // Don't close if clicking the panel itself or the anchor button
      if (panel?.contains(target) || anchor?.contains(target)) return;
      onClose();
    };

    document.addEventListener('keydown', handleKey);
    // Delay so the button's own click that opened us doesn't immediately close us
    const t = setTimeout(() => {
      document.addEventListener('mousedown', handleMouseDown);
    }, 120);

    return () => {
      document.removeEventListener('keydown', handleKey);
      clearTimeout(t);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose, anchorRef]);

  // ── Filter ───────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tracks;
    return tracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [tracks, query]);

  // ── Select handler ───────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (track: ITrack) => {
      onSelect(track);
      onClose();
    },
    [onSelect, onClose]
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      style={
        {
          '--picker-bottom': `${pos.bottom}px`,
          '--picker-left': `${pos.left}px`,
        } as React.CSSProperties
      }
    >
      <div className={styles.header}>
        <span className={styles.title}>Share a Track</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close picker">
          ×
        </button>
      </div>

      <div className={styles.searchWrap}>
        <input
          ref={inputRef}
          className={styles.searchInput}
          type="text"
          placeholder="Search tracks…"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {isLoading && (
          <div className={styles.loading}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                <div className={styles.skeletonCover} />
                <div className={styles.skeletonText}>
                  <div className={`${styles.skeletonLine} ${styles.short}`} />
                  <div className={`${styles.skeletonLine} ${styles.shorter}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className={styles.empty}>No tracks found</div>
        )}

        {!isLoading &&
          filtered.map((track: ITrack) => (
            <button
              key={track.id}
              className={styles.trackRow}
              onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
              onClick={() => handleSelect(track)}
            >
              <Image
                src={track.albumArt}
                alt={track.title}
                width={38}
                height={38}
                className={styles.cover}
                unoptimized
              />
              <div className={styles.trackInfo}>
                <div className={styles.trackTitle}>{track.title}</div>
                <div className={styles.trackArtist}>{track.artist}</div>
              </div>
              <span className={styles.duration}>{formatTrackDuration(track.duration)}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
