"use client";

import type { IPlaylistTrack } from "@/types/playlist.types";
import PlaylistTrackItem from "./PlaylistTrackItem";

interface IPlaylistTrackListProps {
  onRemoveTrack?: (trackId: string) => void;
  tracks: IPlaylistTrack[];
}

export default function PlaylistTrackList({
  onRemoveTrack,
  tracks,
}: IPlaylistTrackListProps) {
  if (!tracks.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-950/50 px-6 py-12 text-center text-white/60">
        No tracks in this playlist yet.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-neutral-950/60 p-4 text-white md:p-6">
      <div className="mb-4 grid grid-cols-[40px_56px_minmax(0,1fr)_72px] gap-3 border-b border-white/10 pb-3 text-xs uppercase tracking-[0.18em] text-white/45">
        <span>#</span>
        <span />
        <span>Title</span>
        <span className="text-right">Time</span>
      </div>

      <ol className="space-y-1">
        {tracks.map((track, index) => (
          <PlaylistTrackItem
            allTracks={tracks}
            index={index + 1}
            key={track.track.id}
            onRemove={onRemoveTrack}
            track={track}
          />
        ))}
      </ol>
    </section>
  );
}
