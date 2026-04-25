"use client";

import Image from "next/image";
import { useState } from "react";
import { usePlayerStore } from "@/store/playerStore";
import type { IPlaylistTrack } from "@/types/playlist.types";
import { formatDuration } from "@/utils/formatDuration";

interface IPlaylistTrackItemProps {
  allTracks: IPlaylistTrack[];
  index: number;
  onRemove?: (trackId: string) => void;
  track: IPlaylistTrack;
}

function buildQueue(tracks: IPlaylistTrack[]) {
  return tracks.map((playlistTrack) => playlistTrack.track);
}

export default function PlaylistTrackItem({
  allTracks,
  index,
  onRemove,
  track,
}: IPlaylistTrackItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setTrack = usePlayerStore((state) => state.setTrack);
  const togglePlay = usePlayerStore((state) => state.togglePlay);

  const isActive = currentTrack?.id === track.track.id;
  const isActiveAndPlaying = isActive && isPlaying;

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
      return;
    }

    const queue = buildQueue(allTracks);
    setQueue(queue);
    setTrack(track.track);
  };

  return (
    <li
      className={`grid grid-cols-[40px_56px_minmax(0,1fr)_72px] items-center gap-3 rounded-2xl px-2 py-2 transition ${
        isActive ? "bg-orange-500/10" : "hover:bg-white/5"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center text-sm text-white/55">
        {isHovered || isActive ? (
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-orange-500"
            onClick={handlePlay}
            type="button"
          >
            {isActiveAndPlaying ? (
              <svg aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 5h3v14H7zm7 0h3v14h-3z" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        ) : (
          <span>{index}</span>
        )}
      </div>

      <div className="relative h-14 w-14 overflow-hidden rounded-xl">
        <Image
          alt={`${track.track.title} artwork`}
          className="h-full w-full object-cover"
          fill
          sizes="56px"
          src={track.track.albumArt || "/default.jpg"}
        />
      </div>

      <div className="min-w-0">
        <p className={`truncate text-sm font-medium ${isActive ? "text-orange-200" : "text-white"}`}>
          {track.track.title}
        </p>
        <p className="truncate text-xs text-white/55">{track.track.artist}</p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-white/55">{formatDuration(track.track.duration)}</span>
        {onRemove && isHovered ? (
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
            onClick={() => onRemove(track.track.id)}
            type="button"
          >
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m18 6-12 12M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </div>
    </li>
  );
}
