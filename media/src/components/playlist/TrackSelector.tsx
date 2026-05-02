"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import type { IPlaylistTrack } from "@/types/playlist.types";
import { trackService } from "@/services";
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
  const [catalogue, setCatalogue] = useState<IPlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all tracks from backend on mount
  useEffect(() => {
    trackService.getAll().then((tracks) => {
      const normalized: IPlaylistTrack[] = tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        albumArt: t.albumArt,
        url: t.url,
        duration: t.duration,
      }));
      setCatalogue(normalized);
    }).catch(() => {
      setCatalogue([]);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalogue;
    return catalogue.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q)
    );
  }, [query, catalogue]);

  return (
    <div className={styles.tsPanel}>
      <div className={styles.tsPanel__header}>
        <h3 className={styles.tsPanel__title}>Add Tracks</h3>
        <p className={styles.tsPanel__subtitle}>
          Search your tracks and click + to add.
        </p>
      </div>

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

      {isLoading ? (
        <div className={styles.tsList__empty}>Loading tracks…</div>
      ) : (
        <ul className={styles.tsList} role="list" aria-label="Available tracks">
          {filteredTracks.length === 0 ? (
            <li className={styles.tsList__empty}>
              {catalogue.length === 0
                ? "No tracks found. Upload a track first."
                : "No tracks match your search."}
            </li>
          ) : (
            filteredTracks.map((track) => {
              const isAdded = addedTrackIds.has(track.id);
              return (
                <li
                  key={track.id}
                  className={[styles.tsItem, isAdded ? styles["tsItem--added"] : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {track.albumArt ? (
                    <Image
                      src={track.albumArt}
                      alt={`${track.title} artwork`}
                      width={40}
                      height={40}
                      className={styles.tsItem__cover}
                    />
                  ) : (
                    <div className={`${styles.tsItem__cover} ${styles["tsItem__cover--placeholder"] ?? ""}`} />
                  )}

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
                    aria-label={isAdded ? `${track.title} already added` : `Add ${track.title}`}
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
      )}
    </div>
  );
}
