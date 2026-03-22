"use client";

import { useMemo } from "react";
import { IPlaylistTrack } from "@/types/playlist.types";
import PlaylistTrackItem from "./PlaylistTrackItem";
import { formatPlaylistDuration } from "@/utils/formatPlaylistDuration";

interface IPlaylistTrackListProps {
  tracks: IPlaylistTrack[];
  onRemoveTrack?: (trackId: string) => void;
}

export default function PlaylistTrackList({
  tracks,
  onRemoveTrack,
}: IPlaylistTrackListProps) {
  // Memoised together so safeTracks is a stable reference — not recreated
  // on every render — and the useMemo dependency array is always stable.
  const { safeTracks, totalDuration } = useMemo(() => {
    const safe = Array.isArray(tracks) ? tracks : [];
    return {
      safeTracks:    safe,
      totalDuration: safe.reduce((sum, t) => sum + (t.duration ?? 0), 0),
    };
  }, [tracks]);

  if (safeTracks.length === 0) {
    return (
      <div className="tracklist__empty">
        <p>No tracks in this playlist yet.</p>
      </div>
    );
  }

  return (
    <section className="tracklist" aria-label="Playlist tracks">
      <div className="tracklist__header" aria-hidden="true">
        <span className="tracklist__col-index">#</span>
        <span className="tracklist__col-cover" />
        <span className="tracklist__col-title">Title</span>
        <span className="tracklist__col-duration">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Duration">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
      </div>

      <ol className="tracklist__list" role="list">
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

      {/* Spotify-style summary banner */}
      <div className="tracklist__summary" aria-label="Playlist summary">
        <span className="tracklist__summary-count">
          {safeTracks.length} {safeTracks.length === 1 ? "song" : "songs"}
        </span>
        <span className="tracklist__summary-sep" aria-hidden="true">·</span>
        <span className="tracklist__summary-duration">
          {formatPlaylistDuration(totalDuration)}
        </span>
      </div>
    </section>
  );
}
