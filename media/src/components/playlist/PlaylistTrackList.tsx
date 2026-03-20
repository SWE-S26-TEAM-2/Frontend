"use client";

import { IPlaylistTrack } from "@/types/playlist.types";
import PlaylistTrackItem from "./PlaylistTrackItem";

interface IPlaylistTrackListProps {
  tracks: IPlaylistTrack[];
  /** Optional: called when a track's remove button is clicked */
  onRemoveTrack?: (trackId: string) => void;
}

export default function PlaylistTrackList({
  tracks,
  onRemoveTrack,
}: IPlaylistTrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="tracklist__empty">
        <p>No tracks in this playlist yet.</p>
      </div>
    );
  }

  return (
    <section className="tracklist" aria-label="Playlist tracks">
      {/* Column header row — 4 children to match grid-template-columns: 48px 48px 1fr auto */}
      <div className="tracklist__header" aria-hidden="true">
        <span className="tracklist__col-index">#</span>
        <span className="tracklist__col-cover" />
        <span className="tracklist__col-title">Title</span>
        <span className="tracklist__col-duration">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="Duration"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
      </div>

      <ol className="tracklist__list" role="list">
        {tracks.map((track, i) => (
          <PlaylistTrackItem
            key={track.id}
            track={track}
            index={i + 1}
            allTracks={tracks}
            onRemove={onRemoveTrack}
          />
        ))}
      </ol>
    </section>
  );
}
