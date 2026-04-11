"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayerStore } from "@/store/playerStore";
import type { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";
import type { ITrack } from "@/types/track.types";
import { resolveTrackUrl } from "@/utils/resolveTrackUrl";
import styles from "./PlaylistHeader.module.css";

interface IPlaylistHeaderProps {
  playlist: IPlaylist;
  tracks: IPlaylistTrack[];
  canEdit?: boolean;
}

function toPlayerTrack(track: IPlaylistTrack): ITrack {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    albumArt: track.albumArt,
    duration: track.duration,
    url: resolveTrackUrl(track.url, track.id),
    likes: 0,
    plays: 0,
    createdAt: "",
    updatedAt: "",
  };
}

export default function PlaylistHeader({
  playlist,
  tracks,
  canEdit = true,
}: IPlaylistHeaderProps) {
  const { id, title, creator, coverArt, description } = playlist;

  const [isLiked, setIsLiked] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const setQueue = usePlayerStore((s) => s.setQueue);
  const setTrack = usePlayerStore((s) => s.setTrack);

  const handlePlayAll = () => {
    if (!tracks.length) return;
    const playerTracks = tracks.map(toPlayerTrack);
    setQueue(playerTracks);
    setTrack(playerTracks[0]);
  };

  const handleLike = () => setIsLiked((prev) => !prev);

  const showShareFeedback = (message: string) => {
    setShareMessage(message);
    setTimeout(() => setShareMessage(""), 2000);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator?.share) {
      try {
        await navigator.share({ title, text: `Listen to "${title}" by ${creator}`, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      showShareFeedback("Link copied to clipboard");
    } catch {
      showShareFeedback("Failed to copy link");
    }
  };

  return (
    <div className={styles.playlistHeader}>
      <div className={styles.playlistHeader__backdrop} aria-hidden="true" />

      <div className={styles.playlistHeader__inner}>
        {/* Cover art */}
        <div className={styles.playlistHeader__coverWrap}>
          <Image
            src={coverArt}
            alt={`${title} cover art`}
            width={220}
            height={220}
            className={styles.playlistHeader__cover}
            priority
          />
          <div className={styles.playlistHeader__coverShine} aria-hidden="true" />
        </div>

        {/* Metadata */}
        <div className={styles.playlistHeader__meta}>
          <span className={styles.playlistHeader__label}>Playlist</span>
          <h1 className={styles.playlistHeader__title}>{title}</h1>

          {description && (
            <p className={styles.playlistHeader__description}>{description}</p>
          )}

          <div className={styles.playlistHeader__sub}>
            <span className={styles.playlistHeader__creator}>{creator}</span>
            <span className={styles.playlistHeader__dot} aria-hidden="true">·</span>
            <span className={styles.playlistHeader__count}>
              {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            </span>
            {playlist.isPublic !== undefined && (
              <>
                <span className={styles.playlistHeader__dot} aria-hidden="true">·</span>
                <span
                  className={[
                    styles.playlistHeader__visibility,
                    !playlist.isPublic ? styles["playlistHeader__visibility--private"] : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {playlist.isPublic ? "Public" : "Private"}
                </span>
              </>
            )}
          </div>

          {(playlist.genre || playlist.mood) && (
            <div className={styles.playlistHeader__tags}>
              {playlist.genre && (
                <span className={`${styles.playlistHeader__tag} ${styles["playlistHeader__tag--genre"]}`}>
                  {playlist.genre}
                </span>
              )}
              {playlist.mood && (
                <span className={`${styles.playlistHeader__tag} ${styles["playlistHeader__tag--mood"]}`}>
                  {playlist.mood}
                </span>
              )}
            </div>
          )}

          <div className={styles.playlistHeader__actions}>
            <button
              className={`${styles.playlistHeader__btn} ${styles["playlistHeader__btn--primary"]}`}
              onClick={handlePlayAll}
              disabled={!tracks.length}
            >
              Play All
            </button>

            <button
              className={[
                styles.playlistHeader__btn,
                styles["playlistHeader__btn--ghost"],
                isLiked ? styles["playlistHeader__btn--liked"] : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={handleLike}
            >
              {isLiked ? "Liked" : "Like"}
            </button>

            <div className={styles.playlistHeader__shareWrap}>
              <button
                className={`${styles.playlistHeader__btn} ${styles["playlistHeader__btn--ghost"]}`}
                onClick={() => { void handleShare(); }}
              >
                Share
              </button>
              {shareMessage && (
                <span className={styles.playlistHeader__shareToast} role="status" aria-live="polite">
                  {shareMessage}
                </span>
              )}
            </div>

            {canEdit && (
              <Link
                href={`/playlist/${id}/edit`}
                className={[
                  styles.playlistHeader__btn,
                  styles["playlistHeader__btn--ghost"],
                  styles["playlistHeader__btn--edit"],
                ].join(" ")}
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
