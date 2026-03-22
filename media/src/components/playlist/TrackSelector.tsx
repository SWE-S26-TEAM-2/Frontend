"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { IPlaylistTrack } from "@/types/playlist.types";
import { AVAILABLE_TRACKS } from "@/services/mocks/playlistMockData";
import { formatDuration } from "@/utils/formatDuration";

interface ITrackSelectorProps {
  /** IDs of tracks already in the playlist — used to mark added tracks */
  addedTrackIds: Set<string>;
  onAddTrack: (track: IPlaylistTrack) => void;
}

export default function TrackSelector({
  addedTrackIds,
  onAddTrack,
}: ITrackSelectorProps) {
  const [query, setQuery] = useState("");

  const filteredTracks = useMemo(() => {
    // Defensive: AVAILABLE_TRACKS could be undefined during module initialisation
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
    <div className="ts-panel">
      <div className="ts-panel__header">
        <h3 className="ts-panel__title">Add Tracks</h3>
        <p className="ts-panel__subtitle">
          Search the catalogue and click + to add tracks.
        </p>
      </div>

      {/* Search */}
      <div className="ts-search">
        <svg
          className="ts-search__icon"
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
          className="ts-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or artist…"
          aria-label="Search tracks"
        />
        {query && (
          <button
            className="ts-search__clear"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Track list */}
      <ul className="ts-list" role="list" aria-label="Available tracks">
        {(Array.isArray(filteredTracks) ? filteredTracks : []).length === 0 ? (
          <li className="ts-list__empty">No tracks match your search.</li>
        ) : (
          (Array.isArray(filteredTracks) ? filteredTracks : []).map((track) => {
            const isAdded = addedTrackIds.has(track.id);
            return (
              <li key={track.id} className={`ts-item${isAdded ? " ts-item--added" : ""}`}>
                <Image
                  src={track.albumArt}
                  alt={`${track.title} artwork`}
                  width={40}
                  height={40}
                  className="ts-item__cover"
                />

                <div className="ts-item__info">
                  <span className="ts-item__title">{track.title}</span>
                  <span className="ts-item__artist">{track.artist}</span>
                </div>

                <span className="ts-item__duration">
                  {formatDuration(track.duration)}
                </span>

                <button
                  className="ts-item__btn"
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
