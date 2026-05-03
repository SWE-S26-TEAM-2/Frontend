"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Play, Heart, UserPlus, MoreHorizontal,
  Repeat2, Share2, Link2, ListMusic, Pause
} from "lucide-react";

import { ITrack } from "@/types/track.types";
import { usePlayerStore } from "@/store/playerStore";
import { apiPost, apiDelete } from "@/services/api/apiClient";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ── MORE MENU ── */
const MoreMenu = ({
  onClose, anchorRect, buttonRef, trackId, onReposted,
}: {
  onClose: () => void;
  anchorRect: DOMRect;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  trackId: string;
  onReposted?: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [reposted, setReposted] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, buttonRef]);

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (reposted) {
        await apiDelete(`${BASE}/reposts/tracks/${trackId}`).catch(() => {});
        setReposted(false);
      } else {
        await apiPost(`${BASE}/reposts/tracks/${trackId}`).catch(() => {});
        setReposted(true);
        onReposted?.();
      }
    } catch { /* silent */ }
    onClose();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      void navigator.share({ title: "Track", url: window.location.href });
    } else {
      void navigator.clipboard.writeText(window.location.href);
    }
    onClose();
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(`${window.location.origin}/track/${trackId}`);
    onClose();
  };

  const handleQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const items = [
    { icon: <Repeat2   size={12} />, label: reposted ? "Reposted ✓" : "Repost", onClick: handleRepost   },
    { icon: <Share2    size={12} />, label: "Share",     onClick: handleShare    },
    { icon: <Link2     size={12} />, label: "Copy Link", onClick: handleCopyLink },
    { icon: <ListMusic size={12} />, label: "Queue",     onClick: handleQueue    },
  ];

  const leftPos = Math.min(anchorRect.left, window.innerWidth - 140);

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: anchorRect.bottom + 8, left: leftPos, zIndex: 99999 }}
      className="w-32 bg-neutral-950 border border-neutral-800 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item, i) => (
        <button
          key={i}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={item.onClick}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-[11px] text-neutral-300 hover:bg-neutral-800 hover:text-white transition text-left outline-none border-none cursor-pointer bg-transparent"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
};

/* ── TRACK CARD ── */
export default function TrackCard2({
  track,
  showFollow = true,
  onPlay,
}: {
  track: ITrack;
  showFollow?: boolean;
  onPlay?: (track: ITrack) => void;
}) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();

  const isCurrentTrack = currentTrack?.id === track.id;

  const [liked,      setLiked]      = useState(track.isLiked || false);
  const [following,  setFollowing]  = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [imgFailed,  setImgFailed]  = useState(false);

  const btnReset = "cursor-pointer outline-none ring-0 border-none focus:outline-none focus:ring-0 active:outline-none active:ring-0";

  // Resolve the correct username for profile navigation.
  // home.api.ts attaches `artistUsername` to tracks; fall back to `artist` field.
  const artistRoute = (() => {
    const t = track as ITrack & { artistUsername?: string };
    const slug = t.artistUsername?.trim() || track.artist?.trim() || "";
    return slug ? `/${slug}` : null;
  })();

  /* PLAY */
  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      const currentTrackState = usePlayerStore.getState().currentTrack;
      if (currentTrackState?.id === track.id) {
        togglePlay();
        return;
      }
      onPlay(track);
      return;
    }
    if (isCurrentTrack) togglePlay();
    else {
      setTrack(track);
      void apiPost(`${BASE}/tracks/${track.id}/plays`).catch(() => {});
    }
  };

  /* LIKE */
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nowLiked = !liked;
    setLiked(nowLiked);
    try {
      if (nowLiked) {
        await apiPost(`${BASE}/likes/tracks/${track.id}`);
      } else {
        await apiDelete(`${BASE}/likes/tracks/${track.id}`);
      }
    } catch {
      setLiked(!nowLiked);
    }
  };

  /* FOLLOW */
  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nowFollowing = !following;
    setFollowing(nowFollowing);
    try {
      // Follow API uses username, not display name
      const t = track as ITrack & { artistUsername?: string };
      const usernameOrSlug = t.artistUsername?.trim() || track.artist?.trim() || "";
      if (!usernameOrSlug) return;
      if (nowFollowing) {
        await apiPost(`${BASE}/users/${usernameOrSlug}/follow`);
      } else {
        await apiDelete(`${BASE}/users/${usernameOrSlug}/follow`);
      }
    } catch {
      setFollowing(!nowFollowing);
    }
  };

  /* MENU */
  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) setAnchorRect(buttonRef.current.getBoundingClientRect());
    setMenuOpen((prev) => !prev);
  };

  /* ARTIST CLICK */
  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (artistRoute) router.push(artistRoute);
  };

  return (
    <div className="group flex flex-col gap-2 relative select-none z-10 transition-transform duration-200 hover:-translate-y-1">

      {/* IMAGE */}
      <div
        onClick={handlePlayToggle}
        className={`relative aspect-square rounded-xl bg-neutral-800 cursor-pointer overflow-hidden ${
          isCurrentTrack ? "ring-2 ring-orange-500" : ""
        }`}
      >
        {track.albumArt && !imgFailed ? (
          <Image
            src={track.albumArt}
            alt={track.title}
            fill
            sizes="180px"
            className="object-cover group-hover:scale-105 transition duration-300 pointer-events-none"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#2d1b4e] flex items-center justify-center pointer-events-none">
            <svg width="40%" height="40%" viewBox="0 0 24 24" fill="#ffffff15">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition duration-300 ${
          menuOpen || isCurrentTrack ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`} />

        <div className={`absolute inset-0 flex items-center justify-center transition duration-300 ${
          menuOpen || isCurrentTrack ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          <button className={`${btnReset} w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition`}>
            {isCurrentTrack && isPlaying
              ? <Pause size={20} className="fill-black text-black" />
              : <Play  size={20} className="fill-black text-black ml-1" />
            }
          </button>
        </div>

        {/* ACTIONS */}
        <div className={`absolute bottom-2 right-2 flex gap-1.5 transition duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          <button
            onClick={handleLike}
            className={`${btnReset} p-1.5 rounded-full bg-black/40 text-white hover:scale-110 transition ${liked ? "text-orange-500" : ""}`}
          >
            <Heart size={14} className={liked ? "fill-orange-500" : ""} />
          </button>

          {showFollow && (
            <button
              onClick={handleFollow}
              className={`${btnReset} p-1.5 rounded-full bg-black/40 text-white hover:scale-110 transition ${following ? "text-orange-500" : ""}`}
            >
              <UserPlus size={14} />
            </button>
          )}

          <button
            ref={buttonRef}
            onClick={handleToggleMenu}
            className={`${btnReset} p-1.5 rounded-full bg-black/40 text-white hover:scale-110 transition ${menuOpen ? "bg-orange-500 text-white" : ""}`}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* TEXT */}
      <div className="flex flex-col">
        <span
          onClick={() => router.push(`/track/${track.id}`)}
          className="text-sm font-medium text-white truncate hover:text-orange-500 cursor-pointer transition"
        >
          {track.title}
        </span>
        <span
          onClick={handleArtistClick}
          className={`text-xs text-neutral-400 transition truncate ${artistRoute ? "hover:text-white cursor-pointer" : "cursor-default"}`}
        >
          {track.artist}
        </span>
      </div>

      {/* MENU */}
      {menuOpen && anchorRect && (
        <MoreMenu
          anchorRect={anchorRect}
          buttonRef={buttonRef}
          trackId={track.id}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
