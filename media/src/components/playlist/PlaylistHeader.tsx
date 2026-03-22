"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayerStore } from "@/store/playerStore";
import { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";
import { resolveTrackUrl } from "@/utils/resolveTrackUrl";

interface IPlaylistHeaderProps {
  playlist: IPlaylist;
  /** Live track list from usePlaylist hook */
  tracks: IPlaylistTrack[];
  /** When true, shows the Edit button in the action row */
  canEdit?: boolean;
}

/** Converts IPlaylistTrack → ITrack shape for usePlayerStore */
function toPlayerTrack(track: IPlaylistTrack) {
  return {
    id:       track.id,
    title:    track.title,
    artist:   track.artist,
    albumArt: track.albumArt,
    duration: track.duration,
    url:      resolveTrackUrl(track.url, track.id),
  };
}

export default function PlaylistHeader({
  playlist,
  tracks,
  canEdit = true,
}: IPlaylistHeaderProps) {
  const { id, title, creator, coverArt, description } = playlist;

  // ── Like state ─────────────────────────────────────────────────────────────
  const [isLiked, setIsLiked]         = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  // ── Player ─────────────────────────────────────────────────────────────────
  const setQueue = usePlayerStore((s) => s.setQueue);
  const setTrack = usePlayerStore((s) => s.setTrack);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
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

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Listen to "${title}" by ${creator}`,
          url,
        });
        return;
      } catch {
        // User cancelled — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showShareFeedback("Link copied to clipboard");
    } catch {
      showShareFeedback("Failed to copy link");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="playlist-header">
      <div className="playlist-header__backdrop" aria-hidden="true" />

      <div className="playlist-header__inner">
        {/* Cover art */}
        <div className="playlist-header__cover-wrap">
          <Image
            src={coverArt}
            alt={`${title} cover art`}
            width={220}
            height={220}
            className="playlist-header__cover"
            priority
          />
          <div className="playlist-header__cover-shine" aria-hidden="true" />
        </div>

        {/* Metadata */}
        <div className="playlist-header__meta">
          <span className="playlist-header__label">Playlist</span>
          <h1 className="playlist-header__title">{title}</h1>

          {description && (
            <p className="playlist-header__description">{description}</p>
          )}

          <div className="playlist-header__sub">
            <span className="playlist-header__creator">{creator}</span>
            <span className="playlist-header__dot" aria-hidden="true">·</span>
            <span className="playlist-header__count">
              {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            </span>
            {playlist.isPublic !== undefined && (
              <>
                <span className="playlist-header__dot" aria-hidden="true">·</span>
                <span className={`playlist-header__visibility${playlist.isPublic ? "" : " playlist-header__visibility--private"}`}>
                  {playlist.isPublic ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      Public
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Private
                    </>
                  )}
                </span>
              </>
            )}
          </div>

          {/* ── Genre / Mood tags ── */}
          {(playlist.genre || playlist.mood) && (
            <div className="playlist-header__tags">
              {playlist.genre && (
                <span className="playlist-header__tag playlist-header__tag--genre">
                  {playlist.genre}
                </span>
              )}
              {playlist.mood && (
                <span className="playlist-header__tag playlist-header__tag--mood">
                  {playlist.mood}
                </span>
              )}
            </div>
          )}

          {/* ── Action row: Play All · Like · Share · Edit ── */}
          <div className="playlist-header__actions">
            {/* Play All */}
            <button
              className="playlist-header__btn playlist-header__btn--primary"
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              aria-label="Play all tracks in this playlist"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play All
            </button>

            {/* Like */}
            <button
              className={`playlist-header__btn playlist-header__btn--ghost${isLiked ? " playlist-header__btn--liked" : ""}`}
              onClick={handleLike}
              aria-label={isLiked ? "Unlike this playlist" : "Like this playlist"}
              aria-pressed={isLiked}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {isLiked ? "Liked" : "Like"}
            </button>

            {/* Share */}
            <div className="playlist-header__share-wrap">
              <button
                className="playlist-header__btn playlist-header__btn--ghost"
                onClick={() => { void handleShare(); }}
                aria-label="Share this playlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5"  r="3" />
                  <circle cx="6"  cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49" />
                </svg>
                Share
              </button>

              {shareMessage && (
                <span
                  className="playlist-header__share-toast"
                  role="status"
                  aria-live="polite"
                >
                  {shareMessage}
                </span>
              )}
            </div>

            {/* Edit — rendered as a Link so it is a proper anchor for accessibility
                Only shown when canEdit is true (default true for the detail page) */}
            {canEdit && (
              <Link
                href={`/playlist/${id}/edit`}
                className="playlist-header__btn playlist-header__btn--ghost playlist-header__btn--edit"
                aria-label={`Edit ${title}`}
              >
                <svg
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
