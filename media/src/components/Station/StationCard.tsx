"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Heart, MoreHorizontal, ListPlus, ListEnd, Pause } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useStationStore } from "@/store/stationstore";
import type { IStation } from "@/types/station.types";

/* ───────────────── MENU ───────────────── */

const MoreMenu = ({
  onClose,
  anchorRect,
  buttonRef,
}: {
  onClose: () => void;
  anchorRect: DOMRect;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, buttonRef]);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 6,
        left: Math.min(anchorRect.left, window.innerWidth - 180),
        zIndex: 99999,
      }}
      className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-md shadow-xl overflow-hidden min-w-[160px]"
    >
      {[
        { icon: <ListEnd size={13} />, label: "Add to Next Up" },
        { icon: <ListPlus size={13} />, label: "Add to Playlist" },
      ].map((item, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] transition text-left"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
};

/* ───────────────── CARD ───────────────── */

interface IStationCardProps {
  station: IStation;
}

export default function StationCard({ station }: IStationCardProps) {
  const {
    setTrack,
    setQueue,
    currentTrack,
    isPlaying,
    togglePlay,
  } = usePlayerStore();

  const { toggleLike, isLiked } = useStationStore();

  const liked = isLiked(station.id);

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const moreRef = useRef<HTMLButtonElement>(null);

  /* ───────────────── PLAY LOGIC (FIXED) ───────────────── */

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    const isSameTrack = currentTrack?.id === station.seedTrack.id;

    // If same track → toggle play/pause
    if (isSameTrack) {
      togglePlay();
      return;
    }

    // New track → load & play
    setQueue([station.seedTrack]);
    setTrack(station.seedTrack);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(station);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (moreRef.current) {
      setAnchorRect(moreRef.current.getBoundingClientRect());
    }

    setMenuOpen((v) => !v);
  };

  const isActive = currentTrack?.id === station.seedTrack.id;

  return (
    <div className="flex flex-col gap-2 cursor-pointer group">

      {/* COVER */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#1a1a1a]">

        <img
          src={station.coverArt || "/default-track-cover.png"}
          alt={station.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-track-cover.png";
          }}
        />

        {/* gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition" />

        {/* PLAY BUTTON */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">

          <button
            onClick={handlePlay}
            className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer"
          >
            {isActive && isPlaying ? (
              <Pause size={20} color="white" />
            ) : (
              <Play size={20} fill="white" />
            )}
          </button>

        </div>

        {/* ACTIONS */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">

          {/* LIKE */}
          <button
            onClick={handleLike}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            <Heart
              size={14}
              fill={liked ? "#ff5500" : "transparent"}
              color={liked ? "#ff5500" : "#fff"}
            />
          </button>

          {/* MORE */}
          <button
            ref={moreRef}
            onClick={handleMore}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            <MoreHorizontal size={14} color="#fff" />
          </button>

        </div>
      </div>

      {/* INFO */}
      <div className="flex flex-col min-w-0">
        <span className="text-white text-sm font-semibold truncate">
          {station.name}
        </span>
        <span className="text-gray-500 text-xs truncate">
          {station.artistName}
        </span>
      </div>

      {/* MENU */}
      {menuOpen && anchorRect && (
        <MoreMenu
          anchorRect={anchorRect}
          buttonRef={moreRef}
          onClose={() => setMenuOpen(false)}
        />
      )}

    </div>
  );
}