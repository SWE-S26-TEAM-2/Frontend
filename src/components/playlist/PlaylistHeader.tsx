"use client";

import { useState } from "react";
import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";
import { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";

interface IPlaylistHeaderProps {
  playlist: IPlaylist;
  /** Live track list from usePlaylist hook (may differ from playlist.tracks after add/remove) */
  tracks: IPlaylistTrack[];
}

/** Converts IPlaylistTrack to the shape usePlayerStore.setTrack / setQueue expect */
function toPlayerTrack(track: IPlaylistTrack) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    albumArt: track.albumArt,
    duration: track.duration,
    url: "", // populated by backend streaming endpoint
  };
}

export default function PlaylistHeader({ playlist, tracks }: IPlaylistHeaderProps) {
  const { title, creator, coverArt, description } = playlist;

  // ── Like state ─────────────────────────────────────────────────────────────
  const [isLiked, setIsLiked] = useState(false);

  // ── Share feedback state ───────────────────────────────────────────────────
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

  const handleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const showShareFeedback = (message: string) => {
    setShareMessage(message);
    setTimeout(() => setShareMessage(""), 2000);
  };

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";

    // Primary: Web Share API (native OS dialog on supported browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Listen to "${title}" by ${creator}`,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: Copy URL to clipboard
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
        {/* ── Cover art ── */}
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

        {/* ── Metadata ── */}
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
          </div>

          {/* ── Actions ── */}
          <div className="playlist-header__actions">
            {/* Play All */}
            <button
              className="playlist-header__btn playlist-header__btn--primary"
              onClick={handlePlayAll}
              aria-label="Play all tracks in this playlist"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play All
            </button>

            {/* Like — toggles filled/outline heart */}
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

            {/* Share — Web Share API with clipboard fallback */}
            <div className="playlist-header__share-wrap">
              <button
                className="playlist-header__btn playlist-header__btn--ghost"
                onClick={() => { void handleShare(); }}
                aria-label="Share this playlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>

              {/* Feedback toast — appears for 2s after copy */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
