"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Play, Heart, MoreHorizontal, ListPlus, ListEnd } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useStationStore } from "@/store/stationstore";
import type { IStation } from "@/types/station.types";

// ── MORE MENU (portal) ────────────────────────────────────────────────────────

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, buttonRef]);

  const leftPos = Math.min(anchorRect.left, window.innerWidth - 180);

  const items = [
    { icon: <ListEnd size={13} />,  label: "Add to Next Up"  },
    { icon: <ListPlus size={13} />, label: "Add to Playlist" },
  ];

  return createPortal(
    <div
      ref={ref}
      style={{
        position:     "fixed",
        top:          anchorRect.bottom + 6,
        left:         leftPos,
        zIndex:       99999,
        background:   "#1e1e1e",
        border:       "1px solid #2e2e2e",
        borderRadius: 6,
        boxShadow:    "0 12px 32px rgba(0,0,0,0.6)",
        overflow:     "hidden",
        minWidth:     160,
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        10,
            width:      "100%",
            padding:    "9px 14px",
            background: "transparent",
            border:     "none",
            color:      "#ccc",
            fontSize:   12,
            cursor:     "pointer",
            textAlign:  "left",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
};

// ── STATION CARD ──────────────────────────────────────────────────────────────

interface StationCardProps {
  station: IStation;
}

export default function StationCard({ station }: StationCardProps) {
  const { setTrack, setQueue }  = usePlayerStore();
  const { toggleLike, isLiked } = useStationStore();

  const liked                       = isLiked(station.id);
  const [hovered, setHovered]       = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const moreRef                     = useRef<HTMLButtonElement>(null);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQueue([station.seedTrack]);
    setTrack(station.seedTrack);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(station);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (moreRef.current) setAnchorRect(moreRef.current.getBoundingClientRect());
    setMenuOpen((v) => !v);
  };

  const showActions = hovered || liked || menuOpen;

  return (
    <div
      style={s.wrapper}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div style={s.coverWrapper}>
        <img
          src={station.coverArt || "/default-track-cover.png"}
          alt={station.name}
          style={s.cover}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-track-cover.png";
          }}
        />

        {/* Dark gradient at bottom for readability */}
        <div style={{
          ...s.bottomGradient,
          opacity: showActions ? 1 : 0,
        }} />

        {/* Play overlay — centre */}
        <div style={{ ...s.overlay, opacity: hovered ? 1 : 0 }}>
          <button style={s.playBtn} onClick={handlePlay}>
            <Play size={20} fill="white" color="white" />
          </button>
        </div>

        {/* ── Bottom-right actions: like + dots ── */}
        <div style={{
          ...s.bottomActions,
          opacity: showActions ? 1 : 0,
        }}>
          {/* Like */}
          <button style={s.actionBtn} onClick={handleLike}>
            <Heart
              size={14}
              fill={liked ? "#ff5500" : "transparent"}
              color={liked ? "#ff5500" : "#fff"}
            />
          </button>

          {/* 3 dots */}
          <button
            ref={moreRef}
            style={s.actionBtn}
            onClick={handleMore}
          >
            <MoreHorizontal size={14} color="#fff" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={s.textBlock}>
        <span style={s.name}>{station.name}</span>
        <span style={s.artistLabel}>{station.artistName}</span>
      </div>

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

// ── STYLES ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    display:       "flex",
    flexDirection: "column",
    gap:           8,
    cursor:        "pointer",
    width:         "100%",
  },
  coverWrapper: {
    position:    "relative",
    width:       "100%",
    aspectRatio: "1 / 1",
    borderRadius: 6,
    overflow:    "hidden",
    background:  "#1a1a1a",
    flexShrink:  0,
  },
  cover: {
    position:  "absolute",
    inset:     0,
    width:     "100%",
    height:    "100%",
    objectFit: "cover",
    display:   "block",
  },
  // Dark gradient so buttons are readable over any image
  bottomGradient: {
    position:   "absolute",
    bottom:     0,
    left:       0,
    right:      0,
    height:     "50%",
    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
    transition: "opacity 0.2s ease",
    pointerEvents: "none",
  },
  overlay: {
    position:       "absolute",
    inset:          0,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    transition:     "opacity 0.2s ease",
  },
  playBtn: {
    width:          44,
    height:         44,
    borderRadius:   "50%",
    background:     "#ff5500",
    border:         "none",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    cursor:         "pointer",
    boxShadow:      "0 4px 16px rgba(0,0,0,0.5)",
  },
  // Like + dots row — bottom right of image
  bottomActions: {
    position:   "absolute",
    bottom:     8,
    right:      8,
    display:    "flex",
    alignItems: "center",
    gap:        4,
    transition: "opacity 0.2s ease",
  },
  actionBtn: {
    background:     "rgba(0,0,0,0.4)",
    border:         "none",
    borderRadius:   "50%",
    width:          28,
    height:         28,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    cursor:         "pointer",
  },
  textBlock: {
    display:       "flex",
    flexDirection: "column",
    gap:           2,
    minWidth:      0,
  },
  name: {
    color:        "#fff",
    fontSize:     13,
    fontWeight:   600,
    overflow:     "hidden",
    textOverflow: "ellipsis",
    whiteSpace:   "nowrap",
  },
  artistLabel: {
    color:    "#666",
    fontSize: 11,
  },
};
