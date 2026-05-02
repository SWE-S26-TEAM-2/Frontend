"use client";

import { useState } from "react";
import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";
import type { IPlaylistTrack } from "@/types/playlist.types";
import type { ITrack } from "@/types/track.types";
import { formatDuration } from "@/utils/formatDuration";
import { resolveTrackUrl } from "@/utils/resolveTrackUrl";
import styles from "./TrackList.module.css";

interface IPlaylistTrackItemProps {
  track: IPlaylistTrack;
  index: number;
  allTracks: IPlaylistTrack[];
  onRemove?: (trackId: string) => void;
}

function toPlayerTrack(track: IPlaylistTrack): ITrack {
  return {
    id:        track.id,
    title:     track.title,
    artist:    track.artist,
    albumArt:  track.albumArt,
    duration:  track.duration,
    url:       resolveTrackUrl(track.url, track.id),
    likes:     0,
    plays:     0,
    createdAt: "",
    updatedAt: "",
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
    if (isActiveTrack) { togglePlay(); return; }
    const playerTracks = allTracks.map(toPlayerTrack);
    setQueue(playerTracks);
    setTrack(toPlayerTrack(track));
  };

  return (
    <li
      className={[
        styles.trackItem,
        isActiveTrack ? styles["trackItem--playing"] : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Index / play control */}
      <div className={styles.trackItem__index}>
        {showPlayControl ? (
          <button
            className={styles.trackItem__playBtn}
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

      {/* Cover + equalizer overlay */}
      <div className={styles.trackItem__coverWrap}>
        <Image
          src={track.albumArt}
          alt={`${track.title} artwork`}
          width={48}
          height={48}
          className={styles.trackItem__cover}
        />
        {isCurrentlyPlaying && (
          <div className={styles.trackItem__equalizer} aria-hidden="true">
            <span /><span /><span />
          </div>
        )}
      </div>

      {/* Track info */}
      <div className={styles.trackItem__info}>
        <span className={styles.trackItem__title}>{track.title}</span>
        <span className={styles.trackItem__artist}>{track.artist}</span>
      </div>

      {/* Duration + optional remove */}
      <div className={styles.trackItem__right}>
        <span className={styles.trackItem__duration}>
          {formatDuration(track.duration)}
        </span>
        {onRemove && isHovered && (
          <button
            className={styles.trackItem__removeBtn}
            onClick={() => onRemove(track.id)}
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
