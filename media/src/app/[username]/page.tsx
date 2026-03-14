"use client";

import { useState } from "react";
import {
  mockUser, mockTracks, mockLikes, timeAgo,
  type User, type Track, type LikedTrack,
} from "@/services/mocks/userProfile.mock";

// ─────────────────────────────────────────────────────────────
// CONSTANTS 
// ─────────────────────────────────────────────────────────────
const NAV_LINKS = ["Home", "Feed", "Library"] as const;
const TABS      = ["All", "Popular tracks", "Tracks", "Albums", "Playlists", "Reposts"] as const;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width={14} height={14} viewBox="0 0 24 24"
    fill={filled ? "#ff5500" : "none"} stroke={filled ? "#ff5500" : "currentColor"} strokeWidth={2}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const RepostIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const ShareSvg = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);
const CopyIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const MoreIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// TRACK COVER
// ─────────────────────────────────────────────────────────────
type TrackCoverProps = { url?: string | null; size?: number; accentColor?: string; alt?: string };
function TrackCover({ url = null, size = 130, accentColor = "#1a1a2e", alt = "cover" }: TrackCoverProps) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0, borderRadius: 2,
      background: url ? "transparent" : `linear-gradient(135deg, ${accentColor}, #0a0a0a)`,
      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {url
        ? <img src={url} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        : <svg width={size * 0.28} height={size * 0.28} viewBox="0 0 24 24" fill="#ffffff15">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WAVEFORM
// ─────────────────────────────────────────────────────────────
function Waveform({ data, playedPercent = 0, height = 52 }: {
  data: number[]; playedPercent?: number; height?: number;
}) {
  const played = Math.floor(data.length * playedPercent);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height, cursor: "pointer", flex: 1 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: 2, height: Math.max(2, v * height), borderRadius: 1, flexShrink: 0,
          background: i < played ? "#ff5500" : "#3a3a3a",
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ICON BUTTON
// ─────────────────────────────────────────────────────────────
type IconBtnProps = { icon: React.ReactNode; label?: string; active?: boolean; count?: number; onClick?: () => void };
function IconBtn({ icon, label, active = false, count, onClick }: IconBtnProps) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5,
      background: active ? "#ff550015" : "transparent",
      border: `1px solid ${active ? "#ff5500" : "#2e2e2e"}`,
      color: active ? "#ff5500" : "#888",
      borderRadius: 3, padding: "5px 11px",
      cursor: "pointer", fontSize: 12, fontFamily: "inherit",
    }}>
      {icon}
      {count !== undefined && <span style={{ fontWeight: 600 }}>{fmt(count)}</span>}
      {label && <span>{label}</span>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// TRACK CARD
// ─────────────────────────────────────────────────────────────
function TrackCard({ track, onPlay }: { track: Track; onPlay: (t: Track) => void }) {
  const [liked, setLiked] = useState<boolean>(track.isLiked);
  return (
    <div style={{ display: "flex", padding: "14px 0", borderBottom: "1px solid #161616" }}>
      <TrackCover size={148} url={track.coverUrl} alt={track.title} accentColor="#111822"/>
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 14 }}>

        {/* Top row: artist / repost + time + genre */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ fontSize: 12, color: "#888" }}>
            {track.artist}
            {track.repostedBy && (
              <><span style={{ color: "#555", margin: "0 4px" }}>↻</span><span>{track.repostedBy}</span></>
            )}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: "#555" }}>{timeAgo(track.createdAt)}</span>
            {track.genre && (
              <span style={{ fontSize: 11, background: "#1c1c1c", border: "1px solid #2e2e2e", color: "#999", borderRadius: 2, padding: "2px 8px" }}>
                # {track.genre}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 10 }}>{track.title}</div>

        {/* Play + Waveform + Duration */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            onClick={() => onPlay(track)}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="#111"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <Waveform data={track.waveform} playedPercent={track.playedPercent}/>
          <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>{track.duration}</span>
        </div>

        {/* Action buttons + stats */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <IconBtn
            icon={<HeartIcon filled={liked}/>}
            count={liked ? track.likes + 1 : track.likes}
            active={liked}
            onClick={() => setLiked(l => !l)}
          />
          <IconBtn icon={<RepostIcon/>} count={track.reposts}/>
          <IconBtn icon={<ShareSvg/>}/>
          <IconBtn icon={<CopyIcon/>}/>
          <IconBtn icon={<MoreIcon/>}/>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, color: "#444", fontSize: 12 }}>
            <span>▶ {fmt(track.plays)}</span>
            <span>💬 {track.comments}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────
function Navbar({ user }: { user: User }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#111", borderBottom: "1px solid #1c1c1c",
      display: "flex", alignItems: "center",
      paddingLeft: 16, paddingRight: 16,
      height: 46, gap: 20,
    }}>
      {/* SoundCloud logo */}
      <svg width="56" height="35" viewBox="0 0 512 512" fill="#fff" style={{ flexShrink: 0 }}>
        <path d="M444.339,235.935c-1.128-0.113-2.16-0.226-3.08-0.33c-6.801-59.363-57.082-104.855-117.547-104.855c-21.401,0-54.928,10.237-70.274,19.38l-4.708,2.585v228.032l198.309,0.503c33.902,0,64.961-35.758,64.961-75.022C512,268.804,484.288,239.899,444.339,235.935z"/>
        <path d="M222.081,157.4c-4.91,0-8.883,3.973-8.883,8.883v204.505c0,4.91,3.973,8.883,8.883,8.883s8.883-3.973,8.883-8.883V166.283C230.964,161.373,226.991,157.4,222.081,157.4z"/>
        <path d="M186.548,192.933c-4.91,0-8.883,3.973-8.883,8.883v168.781c0,4.91,3.973,8.883,8.883,8.883s8.883-3.973,8.883-8.883V201.816C195.431,196.906,191.458,192.933,186.548,192.933z"/>
        <path d="M151.015,166.283c-4.91,0-8.883,3.973-8.883,8.883v195.431c0,4.91,3.973,8.883,8.883,8.883s8.883-3.973,8.883-8.883V175.166C159.898,170.256,155.925,166.283,151.015,166.283z"/>
        <path d="M115.482,184.049c-4.91,0-8.883,3.973-8.883,8.883v177.664c0,4.91,3.973,8.883,8.883,8.883s8.883-3.973,8.883-8.883V192.933C124.365,188.023,120.392,184.049,115.482,184.049z"/>
        <path d="M79.949,192.933c-4.91,0-8.883,3.973-8.883,8.883v168.781c0,4.91,3.973,8.883,8.883,8.883s8.883-3.973,8.883-8.883V201.816C88.832,196.906,84.859,192.933,79.949,192.933z"/>
        <path d="M44.416,192.933c-4.91,0-8.883,3.973-8.883,8.883v151.015c0,4.91,3.973,8.883,8.883,8.883s8.883-3.973,8.883-8.883V201.816C53.299,196.906,49.326,192.933,44.416,192.933z"/>
        <path d="M8.883,219.582c-4.91,0-8.883,3.973-8.883,8.883v124.365c0,4.91,3.973,8.883,8.883,8.883s8.883-3.973,8.883-8.883V228.465C17.766,223.555,13.793,219.582,8.883,219.582z"/>
      </svg>

      {/* Nav links from constant */}
      {NAV_LINKS.map(item => (
        <a key={item} href="#" style={{ color: "#ccc", textDecoration: "none", fontSize: 14, fontFamily: "inherit" }}>{item}</a>
      ))}

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 420, display: "flex", alignItems: "center", background: "#1a1a1a", borderRadius: 20, padding: "0 12px", height: 28, border: "1px solid #272727" }}>
        <input placeholder="Search" style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 13, flex: 1, fontFamily: "inherit" }}/>
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>

      {/* Right actions */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <button style={{ background: "transparent", border: "1px solid #ff5500", color: "#ff5500", borderRadius: 3, padding: "4px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
          Try Artist Pro
        </button>
        <a href="#" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>For Artists</a>
        <a href="#" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Upload</a>
        {/* User avatar from user data */}
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#666", overflow: "hidden", flexShrink: 0 }}>
          {user.avatarUrl && <img src={user.avatarUrl} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
        </div>
        <span style={{ color: "#888", fontSize: 11 }}>▾</span>
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth={1.8} style={{ cursor: "pointer" }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth={1.8} style={{ cursor: "pointer" }}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span style={{ color: "#aaa", fontSize: 17, cursor: "pointer", letterSpacing: 1 }}>···</span>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// BANNER
// ─────────────────────────────────────────────────────────────
function Banner({ user }: { user: User }) {
  const AVATAR_SIZE = 180;
  const AVATAR_LEFT = 20;
  return (
    <div style={{
      position: "relative", height: 250, overflow: "hidden",
      background: user.headerUrl
        ? `url(${user.headerUrl}) center/cover`
        : "linear-gradient(160deg, #3d7080 0%, #4d909f 40%, #3d7888 100%)",
    }}>
      {/* Upload header image "just shown for the user" */}
      {user.isOwner && (
        <button style={{
          position: "absolute", top: 14, right: 14, zIndex: 3,
          background: "#111", border: "none", color: "#fff",
          borderRadius: 3, padding: "8px 18px", fontSize: 13,
          cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
        }}>
          Upload header image
        </button>
      )}

      {/* Avatar */}
      <div style={{
        position: "absolute", left: AVATAR_LEFT, top: "50%",
        transform: "translateY(-50%)",
        width: AVATAR_SIZE, height: AVATAR_SIZE,
        borderRadius: "50%", background: "#4a4a4a", overflow: "hidden", zIndex: 2,
      }}>
        {user.avatarUrl && (
          <img src={user.avatarUrl} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        )}
      </div>

      {/* Upload avatar "just shown for user" */}
      {user.isOwner && (
        <button style={{
          position: "absolute",
          left: AVATAR_LEFT + 40,
          top: `calc(50% + ${AVATAR_SIZE * 0.18}px)`,
          zIndex: 4, background: "#000000bb", border: "none",
          color: "#fff", borderRadius: 3, padding: "5px 10px",
          fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>
          Upload image
        </button>
      )}

      {/* Username + location from user data */}
      <div style={{
        position: "absolute",
        left: AVATAR_LEFT + AVATAR_SIZE + 24,
        top: "50%", transform: "translateY(-50%)",
        zIndex: 2, display: "flex", flexDirection: "column", gap: 8,
      }}>
        <span style={{
          background: "#000000cc", borderRadius: 2,
          padding: "5px 14px", fontSize: 25, fontWeight: 700,
          color: "#fff", display: "inline-block",
        }}>
          {user.username}
        </span>
        <span style={{
          background: "#000000cc", borderRadius: 2,
          padding: "4px 12px", fontSize: 14, color: "#ddd",
          display: "inline-block", alignSelf: "flex-start",
        }}>
          {user.location}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PLAYER
// ─────────────────────────────────────────────────────────────
function Player({ track }: { track: Track | null }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "#0a0a0a", borderTop: "1px solid #1c1c1c" }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        height: 50, background: "#111",
        display: "flex", alignItems: "center",
        paddingLeft: 16, paddingRight: 16, gap: 12,
        boxSizing: "border-box",
      }}>
        {/* Transport controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="#888" style={{ cursor: "pointer" }}>
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
          </svg>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="#111"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="#888" style={{ cursor: "pointer" }}>
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
          {/* Shuffle */}
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth={1.8} style={{ cursor: "pointer" }}>
            <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
          </svg>
          {/* Loop */}
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth={1.8} style={{ cursor: "pointer" }}>
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
        </div>

        {/* Progress bar */}
        <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>0:00</span>
        <div style={{ flex: 1, height: 3, background: "#2a2a2a", borderRadius: 2, cursor: "pointer" }}>
          <div style={{ width: `${track ? track.playedPercent * 100 : 0}%`, height: "100%", background: "#ff5500", borderRadius: 2 }}/>
        </div>
        {/* Duration from track data */}
        <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>{track?.duration ?? "--:--"}</span>

        {/* Volume */}
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth={1.8} style={{ cursor: "pointer", flexShrink: 0 }}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>

        {/* Cover + artist + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <TrackCover size={30} url={track?.coverUrl ?? null} alt={track?.title ?? ""}/>
          <div style={{ width: 140 }}>
            <div style={{ fontSize: 11, color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {track?.artist ?? ""}
            </div>
            <div style={{ fontSize: 12, color: "#ddd", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {track?.title ?? ""}
            </div>
          </div>
        </div>

        {/* Like / Follow / Queue */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth={1.8} style={{ cursor: "pointer" }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth={1.8} style={{ cursor: "pointer" }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth={1.8} style={{ cursor: "pointer" }}>
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const [activeTab, setActiveTab]       = useState<string>(TABS[0]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(mockTracks[0] ?? null);

  const user: User = mockUser;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#fff",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 60,
    }}>
      {/* Centered frame */}
      <div style={{ maxWidth: 1280, margin: "0 auto", background: "#111" }}>
        <Navbar user={user}/>
        <Banner user={user}/>
      </div>

      <div style={{ height: 8 }}/>

      {/* Main content */}
      <div style={{ display: "flex", maxWidth: 1280, margin: "0 auto", padding: "0 16px", gap: 24 }}>

        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Tabs row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1c1c1c", marginBottom: 20 }}>
            <div style={{ display: "flex" }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  background: "transparent", border: "none",
                  borderBottom: activeTab === tab ? "2px solid #ff5500" : "2px solid transparent",
                  color: activeTab === tab ? "#fff" : "#777",
                  padding: "12px 14px", cursor: "pointer",
                  fontSize: 14, fontFamily: "inherit",
                  fontWeight: activeTab === tab ? 600 : 400,
                }}>
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #2e2e2e", color: "#ccc", borderRadius: 3, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                <ShareSvg/> Share
              </button>
              {user.isOwner && (
                <button style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #2e2e2e", color: "#ccc", borderRadius: 3, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                  ✏ Edit
                </button>
              )}
            </div>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 10px 0" }}>Recent</h2>
          {mockTracks.map(track => (
            <TrackCard key={track.id} track={track} onPlay={setCurrentTrack}/>
          ))}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 220, flexShrink: 0, paddingTop: 62 }}>

          {/* Followers / Following / Tracks */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 16, marginBottom: 18, borderBottom: "1px solid #1c1c1c" }}>
            {([ 
              { label: "Followers", value: user.followers },
              { label: "Following", value: user.following },
              { label: "Tracks",    value: user.tracks    },
            ] as { label: string; value: number }[]).map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{value}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Likes count + list  */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#999" }}>{user.likes} LIKES</span>
            <a href="#" style={{ fontSize: 12, color: "#ff5500", textDecoration: "none" }}>View all</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mockLikes.map((like: LikedTrack) => (
              <div key={like.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <TrackCover size={44} accentColor={like.accentColor ?? "#1a1a2e"} url={like.coverUrl} alt={like.title}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{like.artist}</div>
                  <div style={{ fontSize: 13, color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{like.title}</div>
                  {like.plays !== undefined && (
                    <div style={{ fontSize: 10, color: "#444", display: "flex", gap: 6, marginTop: 2 }}>
                      <span>▶ {fmt(like.plays)}</span>
                      <span>♥ {fmt(like.likes ?? 0)}</span>
                      <span>↻ {like.reposts ?? 0}</span>
                      {like.comments !== undefined && <span>💬 {like.comments}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player receives the currently playing track from state */}
      <Player track={currentTrack}/>
    </div>
  );
}