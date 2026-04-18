"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Play,
  Heart,
  UserPlus,
  MoreHorizontal,
  Repeat2,
  Share2,
  Link2,
  ListMusic,
  Pause
} from "lucide-react";

import { ITrack } from "@/types/track.types"; 
import { usePlayerStore } from "@/store/playerStore";

// ─── Dropdown Menu (Portal) ──────────────────────────────

const MoreMenu = ({ 
  onClose, 
  anchorRect 
}: { 
  onClose: () => void; 
  anchorRect: DOMRect 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { icon: <Repeat2 size={12} />, label: "Repost" },
    { icon: <Share2 size={12} />, label: "Share" },
    { icon: <Link2 size={12} />, label: "Link" },
    { icon: <ListMusic size={12} />, label: "Queue" }
  ];

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 8,
        left: anchorRect.left - 100,
        zIndex: 99999,
      }}
      className="w-32 bg-neutral-950 border border-neutral-800 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item, i) => (
        <button
          key={i}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
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

// ─── Track Card Component ──────────────────────────────────

export default function TrackCard2({ track, showFollow = true }: { track: ITrack, showFollow?: boolean }) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Global Player logic
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  
  const isCurrentTrack = currentTrack?.id === track.id;

  const [liked, setLiked] = useState(track.isLiked || false);
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const btnReset =
    "cursor-pointer outline-none ring-0 border-none focus:outline-none focus:ring-0 active:outline-none active:ring-0";

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlay();
    } else {
      setTrack(track);
    }
  };

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="group w-full flex flex-col gap-2 relative select-none z-10">
      <div className="relative aspect-square rounded-xl bg-neutral-800 cursor-pointer overflow-hidden">
        <Image
          src={track.albumArt || "/test.png"}
          alt={track.title}
          fill
          className="object-cover group-hover:scale-105 transition duration-300 pointer-events-none"
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* Play/Pause Button */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            onClick={handlePlayToggle}
            className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition ${btnReset}`}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause size={20} className="fill-black text-black" />
            ) : (
              <Play size={20} className="fill-black text-black ml-1" />
            )}
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div
          className={`absolute bottom-2 right-2 flex gap-1.5 transition duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md hover:scale-110 transition ${btnReset} ${
              liked ? "bg-black/40 text-orange-500" : "bg-black/40 text-white"
            }`}
          >
            <Heart size={14} className={liked ? "fill-orange-500" : ""} />
          </button>

          {showFollow && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFollowing(!following);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md hover:scale-110 transition ${btnReset} ${
                following ? "bg-black/40 text-orange-500" : "bg-black/40 text-white"
              }`}
            >
              <UserPlus size={14} />
            </button>
          )}

          <button
            ref={buttonRef}
            type="button"
            data-testid={`more-btn-${track.id}`}
            onClick={handleToggleMenu}
            className={`p-1.5 rounded-full backdrop-blur-md hover:scale-110 transition relative z-[20] ${btnReset} ${
              menuOpen ? "bg-orange-500 text-white" : "bg-black/40 text-white"
            }`}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <span
          onClick={() => router.push(`/track/${track.id}`)}
          className="text-sm font-medium text-white truncate hover:text-orange-500 cursor-pointer transition"
        >
          {track.title}
        </span>
        <span
          onClick={() => router.push(`/artist/${track.id}`)}
          className="text-xs text-neutral-400 hover:text-white cursor-pointer transition"
        >
          {track.artist}
        </span>
      </div>

      {menuOpen && anchorRect && (
        <MoreMenu 
          anchorRect={anchorRect} 
          onClose={() => setMenuOpen(false)} 
        />
      )}
    </div>
  );
}