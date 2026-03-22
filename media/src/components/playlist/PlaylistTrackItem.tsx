"use client";

import { useState } from "react";
import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";
import { IPlaylistTrack } from "@/types/playlist.types";
import { formatDuration } from "@/utils/formatDuration";
import { resolveTrackUrl } from "@/utils/resolveTrackUrl";

interface IPlaylistTrackItemProps {
  track: IPlaylistTrack;
  /** 1-based display index */
  index: number;
  /** Full live track list — sets the complete queue when a track is clicked */
  allTracks: IPlaylistTrack[];
  /** Optional: called when the remove button is clicked */
  onRemove?: (trackId: string) => void;
}

/** Converts IPlaylistTrack to the ITrack shape that usePlayerStore expects */
function toPlayerTrack(track: IPlaylistTrack) {
  return {
    id:       track.id,
    title:    track.title,
    artist:   track.artist,
    albumArt: track.albumArt,
    duration: track.duration,
    // resolveTrackUrl ensures a real audio file is used even in mock mode
    url:      resolveTrackUrl(track.url, track.id),
  };
}

export default function PlaylistTrackItem({
  track,
  index,
  allTracks,
  onRemove,
}: IPlaylistTrackItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const currentTrack  = usePlayerStore((s) => s.currentTrack);
  const isPlaying     = usePlayerStore((s) => s.isPlaying);
  const setTrack      = usePlayerStore((s) => s.setTrack);
  const setQueue      = usePlayerStore((s) => s.setQueue);
  const togglePlay    = usePlayerStore((s) => s.togglePlay);

  const isActiveTrack      = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isActiveTrack && isPlaying;
  const showPlayControl    = isHovered || isActiveTrack;

  const handlePlay = () => {
    if (isActiveTrack) {
      togglePlay();
      return;
    }
    // Set the full playlist as the queue with resolved audio URLs
    const playerTracks = allTracks.map(toPlayerTrack);
    setQueue(playerTracks);
    setTrack(toPlayerTrack(track));
  };

  const handleRemove = () => {
    onRemove?.(track.id);
  };

  return (
    <li
      className={`track-item${isActiveTrack ? " track-item--playing" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Index / play control ── */}
      <div className="track-item__index">
        {showPlayControl ? (
          <button
            className="track-item__play-btn"
            onClick={handlePlay}
            aria-label={isCurrentlyPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          >
            {isCurrentlyPlaying ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        ) : (
          <span aria-hidden="true">{index}</span>
        )}
      </div>

      {/* ── Cover + equalizer overlay ── */}
      <div className="track-item__cover-wrap">
        <Image
          src={track.albumArt}
          alt={`${track.title} artwork`}
          width={48}
          height={48}
          className="track-item__cover"
        />
        {isCurrentlyPlaying && (
          <div className="track-item__equalizer" aria-hidden="true">
            <span /><span /><span />
          </div>
        )}
      </div>

      {/* ── Track info ── */}
      <div className="track-item__info">
        <span className="track-item__title">{track.title}</span>
        <span className="track-item__artist">{track.artist}</span>
      </div>

      {/* ── Duration + optional remove ── */}
      <div className="track-item__right">
        <span className="track-item__duration">
          {formatDuration(track.duration)}
        </span>

        {onRemove && isHovered && (
          <button
            className="track-item__remove-btn"
            onClick={handleRemove}
            aria-label={`Remove ${track.title} from playlist`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}
