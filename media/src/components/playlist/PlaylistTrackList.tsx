"use client";

import { useMemo } from "react";
import { IPlaylistTrack } from "@/types/playlist.types";
import PlaylistTrackItem from "./PlaylistTrackItem";
import { formatPlaylistDuration } from "@/utils/formatPlaylistDuration";
import styles from "./TrackList.module.css";

interface IPlaylistTrackListProps {
  tracks: IPlaylistTrack[];
  onRemoveTrack?: (trackId: string) => void;
}

export default function PlaylistTrackList({
  tracks,
  onRemoveTrack,
}: IPlaylistTrackListProps) {
  const { safeTracks, totalDuration } = useMemo(() => {
    const safe = Array.isArray(tracks) ? tracks : [];
    return {
      safeTracks:    safe,
      totalDuration: safe.reduce((sum, t) => sum + (t.duration ?? 0), 0),
    };
  }, [tracks]);

  if (safeTracks.length === 0) {
    return (
      <div className={styles.tracklist__empty}>
        <p>No tracks in this playlist yet.</p>
      </div>
    );
  }

  return (
    <section className={styles.tracklist} aria-label="Playlist tracks">
      <div className={styles.tracklist__header} aria-hidden="true">
        <span className={styles.tracklist__colIndex}>#</span>
        <span className={styles.tracklist__colCover} />
        <span className={styles.tracklist__colTitle}>Title</span>
        <span className={styles.tracklist__colDuration}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Duration">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
      </div>

      <ol className={styles.tracklist__list} role="list">
        {safeTracks.map((track, i) => (
          <PlaylistTrackItem
            key={track.id}
            track={track}
            index={i + 1}
            allTracks={safeTracks}
            onRemove={onRemoveTrack}
          />
        ))}
      </ol>

      <div className={styles.tracklist__summary} aria-label="Playlist summary">
        <span className={styles.tracklist__summaryCount}>
          {safeTracks.length} {safeTracks.length === 1 ? "song" : "songs"}
        </span>
        <span className={styles.tracklist__summarySep} aria-hidden="true">·</span>
        <span className={styles.tracklist__summaryDuration}>
          {formatPlaylistDuration(totalDuration)}
        </span>
      </div>
    </section>
  );
}
