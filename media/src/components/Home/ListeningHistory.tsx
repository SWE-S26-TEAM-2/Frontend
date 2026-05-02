"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Heart, Repeat, Play, MoreHorizontal, Pause,
  Share2, Link2, ListMusic, Repeat2,
} from "lucide-react";
import { ITrack } from "../../types/track.types";
import { usePlayerStore } from "@/store/playerStore";
import { apiPost, apiDelete } from "@/services/api/apiClient";
import { ENV } from "@/config/env";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

/* ── MORE MENU (PORTAL) ─────────────────────────────────────────────────────── */

const MoreMenu = ({
  onClose,
  anchorRect,
  buttonRef,
  itemId,
  onRepost,
  isReposted,
  trackId,
}: {
  onClose: () => void;
  anchorRect: DOMRect;
  buttonRef: React.RefObject<Record<string, HTMLButtonElement | null>>;
  itemId: string;
  onRepost: () => void;
  isReposted: boolean;
  trackId: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.[itemId]?.contains(target)) return;
      if (ref.current && !ref.current.contains(target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, buttonRef, itemId]);

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

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRepost();
    onClose();
  };

  const items = [
    { icon: <Repeat2 size={12} />, label: isReposted ? "Reposted ✓" : "Repost", onClick: handleRepost },
    { icon: <Share2  size={12} />, label: "Share",     onClick: handleShare    },
    { icon: <Link2   size={12} />, label: "Copy Link", onClick: handleCopyLink },
    {
      icon: <ListMusic size={12} />,
      label: "Add to Queue",
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); onClose(); },
    },
  ];

  const leftPos = Math.min(anchorRect.left + 20, window.innerWidth - 160);

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: anchorRect.bottom + 8, left: leftPos, zIndex: 99999 }}
      className="bg-neutral-950 border border-neutral-800 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={item.onClick}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-[11px] text-neutral-300 hover:bg-neutral-800 hover:text-white transition text-left border-none cursor-pointer bg-transparent min-w-[140px]"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
};

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */

export default function ListeningHistory({ history }: { history: ITrack[] }) {
  const router = useRouter();
  const safeHistory = Array.isArray(history) ? history : [];
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();

  // Like state — initialise from track data
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>(
    () => Object.fromEntries(safeHistory.map((t) => [t.id, t.isLiked ?? false]))
  );
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(safeHistory.map((t) => [t.id, Number(t.likes ?? 0)]))
  );

  // Repost state
  const [repostedTracks, setRepostedTracks] = useState<Record<string, boolean>>(
    () => Object.fromEntries(safeHistory.map((t) => [t.id, t.isReposted ?? false]))
  );
  const [repostCounts, setRepostCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(safeHistory.map((t) => [t.id, Number((t as ITrack & { reposts?: number }).reposts ?? 0)]))
  );

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* PLAY */
  const handlePlayClick = (item: ITrack) => {
    if (currentTrack?.id === item.id) togglePlay();
    else setTrack(item);
  };

  /* LIKE — real API */
  const toggleLike = async (id: string) => {
    const isLiked = likedTracks[id];
    // Optimistic
    setLikedTracks((prev) => ({ ...prev, [id]: !isLiked }));
    setLikeCounts((prev) => ({ ...prev, [id]: isLiked ? prev[id] - 1 : prev[id] + 1 }));
    try {
      if (isLiked) {
        await apiDelete(`${BASE_URL}/likes/tracks/${id}`);
      } else {
        await apiPost(`${BASE_URL}/likes/tracks/${id}`);
      }
    } catch {
      // Revert
      setLikedTracks((prev) => ({ ...prev, [id]: isLiked }));
      setLikeCounts((prev) => ({ ...prev, [id]: isLiked ? prev[id] + 1 : prev[id] - 1 }));
    }
  };

  /* REPOST — real API */
  const toggleRepost = async (id: string) => {
    const isReposted = repostedTracks[id];
    // Optimistic
    setRepostedTracks((prev) => ({ ...prev, [id]: !isReposted }));
    setRepostCounts((prev) => ({ ...prev, [id]: isReposted ? prev[id] - 1 : prev[id] + 1 }));
    try {
      if (isReposted) {
        await apiDelete(`${BASE_URL}/reposts/tracks/${id}`);
      } else {
        await apiPost(`${BASE_URL}/reposts/tracks/${id}`);
      }
    } catch {
      // Revert
      setRepostedTracks((prev) => ({ ...prev, [id]: isReposted }));
      setRepostCounts((prev) => ({ ...prev, [id]: isReposted ? prev[id] + 1 : prev[id] - 1 }));
    }
  };

  /* MENU */
  const handleToggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const button = buttonRefs.current[id];
    if (button) setAnchorRect(button.getBoundingClientRect());
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.title}>Listening history</span>
        {/* View all → library page, history/likes tab */}
        <button
          className="view-all"
          style={styles.headerBtn}
          onClick={() => router.push("/library?tab=History")}
        >
          View all
        </button>
      </div>

      {safeHistory.map((item, index) => {
        const isCurrent = currentTrack?.id === item.id;
        const showPause = isCurrent && isPlaying;
        const liked    = likedTracks[item.id]    ?? false;
        const reposted = repostedTracks[item.id] ?? false;

        // Resolve artist — may be "Unknown Artist" if the feed didn't return it;
        // display whatever we have, even if it's the fallback.
        const artistDisplay = item.artist && item.artist !== "Unknown Artist"
          ? item.artist
          : "";

        return (
          <div key={`${item.id}-${index}`} className="history-item" style={styles.historyRow}>
            {/* Album art + play overlay */}
            <div
              style={styles.artWrapper}
              className="art-wrapper"
              onClick={() => handlePlayClick(item)}
            >
              <img
                src={item.albumArt || "/test.png"}
                style={styles.albumArt}
                alt={item.title}
                onError={(e) => { (e.target as HTMLImageElement).src = "/test.png"; }}
              />
              <div
                className="play-overlay"
                style={{ ...styles.playOverlay, opacity: isCurrent ? 1 : undefined }}
              >
                {showPause
                  ? <Pause size={16} fill="white" color="white" />
                  : <Play  size={16} fill="white" color="white" />
                }
              </div>
            </div>

            {/* Details */}
            <div style={styles.details}>
              {artistDisplay && (
                <span
                  className="artist-label"
                  style={{ ...styles.artistLabel, cursor: "pointer" }}
                  onClick={() => router.push(`/${encodeURIComponent(item.artist)}`)}
                >
                  {artistDisplay}
                </span>
              )}

              <span
                className="track-name"
                style={{ ...styles.songName, color: isCurrent ? "#f50" : "#ccc", cursor: "pointer" }}
                onClick={() => router.push(`/track/${item.id}`)}
              >
                {item.title}
              </span>

              <div style={styles.statsRow}>
                <span style={styles.stat}>
                  <Play size={10} /> {item.plays ?? 0}
                </span>

                <button
                  onClick={(e) => { e.stopPropagation(); void toggleLike(item.id); }}
                  style={{ ...styles.actionBtn, color: liked ? "#f50" : "#555" }}
                >
                  <Heart size={10} fill={liked ? "#f50" : "transparent"} />
                  {likeCounts[item.id] ?? 0}
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); void toggleRepost(item.id); }}
                  style={{ ...styles.actionBtn, color: reposted ? "#f50" : "#555" }}
                >
                  <Repeat size={10} />
                  {repostCounts[item.id] ?? 0}
                </button>
              </div>
            </div>

            {/* More button */}
            <button
              ref={(el) => { buttonRefs.current[item.id] = el; }}
              className="more-btn"
              style={styles.moreBtn}
              onClick={(e) => handleToggleMenu(e, item.id)}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpenId === item.id && anchorRect && (
              <MoreMenu
                anchorRect={anchorRect}
                buttonRef={buttonRefs}
                itemId={item.id}
                trackId={item.id}
                isReposted={reposted}
                onRepost={() => void toggleRepost(item.id)}
                onClose={() => setMenuOpenId(null)}
              />
            )}
          </div>
        );
      })}

      <style jsx>{`
        .history-item  { position: relative; cursor: default; }
        .art-wrapper   { cursor: pointer; }
        .play-overlay  { cursor: pointer; }
        .art-wrapper:hover .play-overlay  { opacity: 1 !important; }
        .history-item:hover .track-name   { color: white !important; }
        .history-item:hover .more-btn     { opacity: 1; }
        .artist-label:hover               { color: #f50 !important; }
        .view-all:hover                   { text-decoration: underline; color: white !important; }
        .more-btn {
          opacity: 0;
          background: none;
          border: 1px solid #333;
          color: #888;
          border-radius: 4px;
          padding: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section:     { padding: "20px", borderBottom: "1px solid #222" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  title:       { color: "#888", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" },
  headerBtn:   { background: "none", border: "none", color: "#888", fontSize: "11px", cursor: "pointer" },
  historyRow:  { display: "flex", gap: "12px", marginBottom: "12px", alignItems: "flex-start" },
  artWrapper:  { position: "relative", width: "48px", height: "48px", flexShrink: 0, cursor: "pointer" },
  playOverlay: {
    position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    opacity: 0, transition: "opacity 0.2s", borderRadius: "4px", cursor: "pointer",
  },
  albumArt:    { width: "48px", height: "48px", borderRadius: "4px", objectFit: "cover", backgroundColor: "#333" },
  details:     { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 },
  artistLabel: { color: "#777", fontSize: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.2s" },
  songName:    { color: "#ccc", fontSize: "12px", fontWeight: "500", transition: "color 0.2s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  statsRow:    { display: "flex", gap: "8px", marginTop: "4px", alignItems: "center" },
  stat:        { color: "#555", fontSize: "10px", display: "flex", alignItems: "center", gap: "3px" },
  actionBtn:   { background: "transparent", border: "none", fontSize: "10px", display: "flex", alignItems: "center", gap: "3px", cursor: "pointer", transition: "color 0.2s", padding: 0 },
  moreBtn:     { opacity: 0, background: "none", border: "1px solid #333", color: "#888", borderRadius: "4px", padding: "2px", cursor: "pointer", transition: "opacity 0.2s" },
};
