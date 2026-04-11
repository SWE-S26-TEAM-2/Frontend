"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { IPlaylistTrack } from "@/types/playlist.types";
import { AVAILABLE_TRACKS } from "@/utils/playlistUtils";
import { formatDuration } from "@/utils/formatDuration";
import styles from "./TrackSelector.module.css";

interface ITrackSelectorProps {
  addedTrackIds: Set<string>;
  onAddTrack: (track: IPlaylistTrack) => void;
}

export default function TrackSelector({
  addedTrackIds,
  onAddTrack,
}: ITrackSelectorProps) {
  const [query, setQuery] = useState("");

  const filteredTracks = useMemo(() => {
    const catalogue = Array.isArray(AVAILABLE_TRACKS) ? AVAILABLE_TRACKS : [];
    const q = query.trim().toLowerCase();
    if (!q) return catalogue;
    return catalogue.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className={styles.tsPanel}>
      <div className={styles.tsPanel__header}>
        <h3 className={styles.tsPanel__title}>Add Tracks</h3>
        <p className={styles.tsPanel__subtitle}>
          Search the catalogue and click + to add tracks.
        </p>
      </div>

      {/* Search */}
      <div className={styles.tsSearch}>
        <svg
          className={styles.tsSearch__icon}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          className={styles.tsSearch__input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or artist…"
          aria-label="Search tracks"
        />
      </div>

      {/* Track list */}
      <ul className={styles.tsList} role="list" aria-label="Available tracks">
        {filteredTracks.length === 0 ? (
          <li className={styles.tsList__empty}>No tracks match your search.</li>
        ) : (
          filteredTracks.map((track) => {
            const isAdded = addedTrackIds.has(track.id);
            return (
              <li
                key={track.id}
                className={[
                  styles.tsItem,
                  isAdded ? styles["tsItem--added"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Image
                  src={track.albumArt}
                  alt={`${track.title} artwork`}
                  width={40}
                  height={40}
                  className={styles.tsItem__cover}
                />

                <div className={styles.tsItem__info}>
                  <span className={styles.tsItem__title}>{track.title}</span>
                  <span className={styles.tsItem__artist}>{track.artist}</span>
                </div>

                <span className={styles.tsItem__duration}>
                  {formatDuration(track.duration)}
                </span>

                <button
                  className={styles.tsItem__btn}
                  onClick={() => !isAdded && onAddTrack(track)}
                  aria-label={
                    isAdded
                      ? `${track.title} already added`
                      : `Add ${track.title}`
                  }
                  aria-disabled={isAdded}
                  disabled={isAdded}
                >
                  {isAdded ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
