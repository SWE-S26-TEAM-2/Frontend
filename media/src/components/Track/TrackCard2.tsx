"use client";

import React, { useState, useRef, useEffect } from "react";
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

import { ITrack } from "../../types/trending.types";

// ─── Dropdown Menu ───────────────────────────────────────

const MoreMenu = ({ onClose }: { onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
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

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-28 bg-neutral-900 rounded-md shadow-xl z-50 overflow-hidden"
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-[10px] text-neutral-300 hover:bg-neutral-800 transition outline-none border-none cursor-pointer"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
};

// ─── Track Card ──────────────────────────────────────────

export default function TrackCard2({ track }: { track: ITrack }) {
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

const btnReset =
  "cursor-pointer outline-none ring-0 border-none focus:outline-none focus:ring-0 active:outline-none active:ring-0";
  return (
    <div className="group w-full flex flex-col gap-2 relative select-none">
      {/* IMAGE */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-800 cursor-pointer">
        <Image
          src={"/test.png"}
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

        {/* Play Button */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlaying(!playing);
            }}
            className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition ${btnReset}`}
          >
            {playing ? (
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
          {/* LIKE */}
          <div className="relative group/btn">
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

            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 bg-neutral-900 text-white rounded-md opacity-0 group-hover/btn:opacity-100 transition pointer-events-none shadow-lg">
              {liked ? "Liked" : "Like"}
            </span>
          </div>

          {/* FOLLOW */}
          <div className="relative group/btn">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFollowing(!following);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md hover:scale-110 transition ${btnReset} ${
                following
                  ? "bg-black/40 text-orange-500"
                  : "bg-black/40 text-white"
              }`}
            >
              <UserPlus size={14} />
            </button>

            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 bg-neutral-900 text-white rounded-md opacity-0 group-hover/btn:opacity-100 transition pointer-events-none shadow-lg">
              {following ? "Following" : "Follow"}
            </span>
          </div>

          {/* MORE */}
          <div className="relative group/btn">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md hover:scale-110 transition ${btnReset} ${
                menuOpen
                  ? "bg-orange-500 text-white"
                  : "bg-black/40 text-white"
              }`}
            >
              <MoreHorizontal size={14} />
            </button>

            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 bg-neutral-900 text-white rounded-md opacity-0 group-hover/btn:opacity-100 transition pointer-events-none shadow-lg">
              More
            </span>
          </div>
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
          onClick={() => router.push(`/artist/${track.id}`)}
          className="text-xs text-neutral-400 hover:text-white cursor-pointer transition"
        >
          {track.artist}
        </span>
      </div>

      {/* MENU */}
      {menuOpen && <MoreMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
}