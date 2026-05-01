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

/* =========================
   MORE MENU (PORTAL)
========================= */
const MoreMenu = ({
  onClose,
  anchorRect,
  buttonRef
}: {
  onClose: () => void;
  anchorRect: DOMRect;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      // ignore click on button itself
      if (buttonRef.current?.contains(target)) return;

      if (ref.current && !ref.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, buttonRef]);

  const items = [
    { icon: <Repeat2 size={12} />, label: "Repost" },
    { icon: <Share2 size={12} />, label: "Share" },
    { icon: <Link2 size={12} />, label: "Link" },
    { icon: <ListMusic size={12} />, label: "Queue" }
  ];

  const leftPos = Math.min(anchorRect.left, window.innerWidth - 140);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 8,
        left: leftPos,
        zIndex: 99999
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

/* =========================
   TRACK CARD
========================= */
export default function TrackCard2({
  track,
  showFollow = true
}: {
  track: ITrack;
  showFollow?: boolean;
}) {


  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { currentTrack, isPlaying, setTrack, togglePlay } =
    usePlayerStore();

    

  const isCurrentTrack = currentTrack?.id === track.id;

  const [liked, setLiked] = useState(track.isLiked || false);
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const btnReset =
    "cursor-pointer outline-none ring-0 border-none focus:outline-none focus:ring-0 active:outline-none active:ring-0";

  /* PLAY */
  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isCurrentTrack) togglePlay();
    else setTrack(track);
  };

  /* MENU */
  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }

    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="group w-full flex flex-col gap-2 relative select-none z-10 transition-transform duration-200 hover:-translate-y-1">

      {/* IMAGE */}
      <div
        onClick={handlePlayToggle}
        className={`relative aspect-square rounded-xl bg-neutral-800 cursor-pointer overflow-hidden ${
          isCurrentTrack ? "ring-2 ring-orange-500" : ""
        }`}
      >
        <Image
          src={track.albumArt || "/test.png"}
          alt={track.title}
          fill
          className="object-cover group-hover:scale-105 transition duration-300 pointer-events-none"
        />

        {/* overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition duration-300 ${
            menuOpen || isCurrentTrack
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* play button */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition duration-300 ${
            menuOpen || isCurrentTrack
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            className={`${btnReset} w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition`}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause size={20} className="fill-black text-black" />
            ) : (
              <Play size={20} className="fill-black text-black ml-1" />
            )}
          </button>
        </div>

        {/* ACTIONS */}
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
            className={`${btnReset} p-1.5 rounded-full bg-black/40 text-white hover:scale-110 transition ${
              liked ? "text-orange-500" : ""
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
              className={`${btnReset} p-1.5 rounded-full bg-black/40 text-white hover:scale-110 transition ${
                following ? "text-orange-500" : ""
              }`}
            >
              <UserPlus size={14} />
            </button>
          )}

          <button
            ref={buttonRef}
            onClick={handleToggleMenu}
            className={`${btnReset} p-1.5 rounded-full bg-black/40 text-white hover:scale-110 transition ${
              menuOpen ? "bg-orange-500 text-white" : ""
            }`}
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
          onClick={() => router.push(`/artist/${track.artist}`)}
          className="text-xs text-neutral-400 hover:text-white cursor-pointer transition"
        >
          {track.artist}
        </span>
      </div>

      {/* MENU */}
      {menuOpen && anchorRect && (
        <MoreMenu
          anchorRect={anchorRect}
          buttonRef={buttonRef}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
