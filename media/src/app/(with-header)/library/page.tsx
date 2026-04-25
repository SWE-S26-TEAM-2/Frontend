"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ENV } from "@/config/env";
import { mockLibraryService } from "@/services/mocks/library.mock";
import { realLibraryService } from "@/services/api/library.api";
import { formatNumber } from "@/utils/formatNumber";
import { Waveform } from "@/components/Track/Waveform";
import type {
  ILibraryOverview,
  ILibraryTrack,
  ILibraryPlaylist,
  ILibraryAlbum,
  ILibraryStation,
  ILibraryFollowing,
  ILibraryRecentItem,
  LibraryTab,
  ViewMode,
} from "@/types/library.types";
import { VerifiedIcon } from "@/components/Icons/ProfileIcons";
import { HeartIcon, RepostIcon, ShareIcon } from "@/components/Icons/TrackIcons";

const libraryService = ENV.USE_MOCK_API ? mockLibraryService : realLibraryService;

// ─── Auth helpers (SSR-safe) ──────────────────────────────────────────────────

const getCurrentUsername = (): string => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("auth_username") ?? "";
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: LibraryTab[] = [
  "Overview", "Likes", "Playlists", "Albums", "Stations", "Following", "History",
];

function CoverBox({
  url, alt, accentColor, size = 160, rounded = false,
  showPlayOverlay = false, children,
}: {
  url: string | null;
  alt: string;
  accentColor?: string;
  size?: number;
  rounded?: boolean;
  showPlayOverlay?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`shrink-0 overflow-hidden flex items-center justify-center relative ${rounded ? "rounded-full" : "rounded-sm"}`}
      style={{ width: size, height: size, minWidth: size, background: accentColor ?? "#1a1a1a" }}
    >
      {url
        ? <img src={url} alt={alt} className="w-full h-full object-cover" />
        : children
      }
      {showPlayOverlay && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <div className="w-10 h-10 rounded-full bg-[#ff5500] flex items-center justify-center">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="white">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Filter input ──────────────────────────────────────────────────────────────

function FilterInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Filter"
      className="bg-transparent border border-[#333] rounded px-3 py-1.5 text-[13px] text-[#aaa] outline-none focus:border-[#555] w-52 placeholder-[#555]"
    />
  );
}

// ─── "All" dropdown ───────────────────────────────────────────────────────────

function AllDropdown() {
  return (
    <div className="flex items-center gap-1.5 border border-[#333] rounded px-3 py-1.5 text-[13px] text-[#aaa] cursor-pointer hover:border-[#555] transition-colors select-none">
      All
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

// ─── View toggle ──────────────────────────────────────────────────────────────

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[13px] text-[#aaa] mr-1">View</span>
      <button
        onClick={() => onChange("grid")}
        className={`p-1.5 rounded border-none cursor-pointer transition-colors ${mode === "grid" ? "bg-[#ff5500] text-white" : "bg-transparent text-[#aaa] hover:text-white"}`}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        onClick={() => onChange("list")}
        className={`p-1.5 rounded border-none cursor-pointer transition-colors ${mode === "list" ? "bg-[#ff5500] text-white" : "bg-transparent text-[#aaa] hover:text-white"}`}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── Track list row ───────────────────────────────────────────────────────────

function TrackListRow({ track }: { track: ILibraryTrack }) {
  const [commentText, setCommentText] = useState("");

  const likedAgo = useMemo(() => {
    if (!track.likedAt) return null;
    const diffMs   = Date.now() - new Date(track.likedAt).getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays < 1)   return "today";
    if (diffDays < 7)   return `${diffDays}d ago`;
    if (diffDays < 30)  return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }, [track.likedAt]);

  const userInitial = useMemo(() => {
    const username = getCurrentUsername();
    return username.charAt(0).toUpperCase() || "?";
  }, []);

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    // TODO: wire to commentService.postComment(track.id, commentText, timestamp)
    console.log("[Library] Comment submitted:", { trackId: track.id, text: commentText });
    setCommentText("");
  };

  return (
    <div className="flex gap-4 items-start group">
      <CoverBox
        url={track.coverUrl}
        alt={track.title}
        accentColor={track.accentColor}
        size={140}
        showPlayOverlay
      >
        <span className="text-3xl text-white/30">♪</span>
      </CoverBox>

      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <div className="text-[13px] text-[#aaa]">{track.artist}</div>
            <div className="text-[15px] font-semibold text-white">{track.title}</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {track.genre && (
              <span className="border border-[#333] rounded px-2 py-0.5 text-[12px] text-[#aaa]">
                # {track.genre}
              </span>
            )}
            {likedAgo && (
              <span className="text-[12px] text-[#666]">{likedAgo}</span>
            )}
          </div>
        </div>

        <div className="mb-3">
          {track.waveformData && track.waveformData.length > 0 ? (
            <Waveform
              data={track.waveformData}
              height={52}
              playedPercent={0}
              playedColor="#ff5500"
              unplayedColor="#333"
            />
          ) : (
            <div className="w-full h-14 bg-[#111] rounded flex items-center justify-center">
              <span className="text-[11px] text-[#444]">No waveform available</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
            {userInitial}
          </div>
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleCommentSubmit(); }}
            placeholder="Write a comment"
            className="flex-1 bg-[#1a1a1a] border-none outline-none text-[13px] text-[#aaa] px-3 py-1.5 rounded placeholder-[#444]"
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-transparent border-none text-[#555] cursor-pointer hover:text-[#aaa]"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-[#333] rounded px-3 py-1 text-[12px] text-[#ff5500] cursor-pointer hover:border-[#ff5500] transition-colors bg-transparent">
              <HeartIcon isFilled={true} />
              {track.likes !== undefined && formatNumber(track.likes)}
            </button>
            <button className="flex items-center gap-1.5 border border-[#333] rounded px-3 py-1 text-[12px] text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent">
              <RepostIcon />
              {track.reposts !== undefined && formatNumber(track.reposts)}
            </button>
            <button className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent">
              <ShareIcon />
            </button>
            <button className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent">
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent">
              <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#666]">
            {track.plays !== undefined && <span>▶ {formatNumber(track.plays)}</span>}
            <span>💬 {track.reposts ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Track grid card ───────────────────────────────────────────────────────────

function TrackGridCard({ track }: { track: ILibraryTrack }) {
  return (
    <div className="flex flex-col gap-2 group cursor-pointer">
      <CoverBox
        url={track.coverUrl}
        alt={track.title}
        accentColor={track.accentColor}
        size={160}
        showPlayOverlay
      >
        <span className="text-4xl font-bold text-white/40">♪</span>
      </CoverBox>
      <div className="flex items-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
        <HeartIcon isFilled={true} />
        <span className="truncate">{track.title}</span>
      </div>
      <div className="text-[12px] text-[#666] truncate">{track.artist}</div>
    </div>
  );
}

// ─── LIKES TAB ─────────────────────────────────────────────────────────────────

function LikesTab({ tracks }: { tracks: ILibraryTrack[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filter, setFilter]     = useState("");

  const filtered = useMemo(() =>
    tracks.filter(t =>
      t.title.toLowerCase().includes(filter.toLowerCase()) ||
      t.artist.toLowerCase().includes(filter.toLowerCase())
    ), [tracks, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-white">Hear the tracks you&apos;ve liked:</h2>
        <div className="flex items-center gap-3">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <FilterInput value={filter} onChange={setFilter} />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No tracks match your filter</div>
      ) : viewMode === "list" ? (
        <div className="flex flex-col gap-6">
          {filtered.map(track => <TrackListRow key={track.id} track={track} />)}
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {filtered.map(track => <TrackGridCard key={track.id} track={track} />)}
        </div>
      )}
    </div>
  );
}

// ─── PLAYLISTS TAB ─────────────────────────────────────────────────────────────

function PlaylistsTab({ playlists }: { playlists: ILibraryPlaylist[] }) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() =>
    playlists.filter(p => p.title.toLowerCase().includes(filter.toLowerCase())),
    [playlists, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-white">Hear your own playlists and the playlists you&apos;ve liked:</h2>
        <div className="flex items-center gap-3">
          <FilterInput value={filter} onChange={setFilter} />
          <AllDropdown />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No playlists match your filter</div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {filtered.map(pl => (
            <div key={pl.id} className="flex flex-col gap-2 group cursor-pointer">
              <CoverBox
                url={pl.coverUrl}
                alt={pl.title}
                accentColor={pl.accentColor}
                size={160}
                showPlayOverlay
              >
                <span className="text-4xl font-bold text-white/40">≡</span>
              </CoverBox>
              <div className="flex items-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span className="truncate">{pl.title}</span>
              </div>
              <div className="text-[12px] text-[#666]">{pl.trackCount} tracks</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ALBUMS TAB ────────────────────────────────────────────────────────────────

function AlbumsTab({ albums }: { albums: ILibraryAlbum[] }) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() =>
    albums.filter(a =>
      a.title.toLowerCase().includes(filter.toLowerCase()) ||
      a.artist.toLowerCase().includes(filter.toLowerCase())
    ), [albums, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-white">Hear your own albums and the albums you&apos;ve liked:</h2>
        <div className="flex items-center gap-3">
          <FilterInput value={filter} onChange={setFilter} />
          <AllDropdown />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No albums match your filter</div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {filtered.map(album => (
            <div key={album.id} className="flex flex-col gap-2 group cursor-pointer">
              <CoverBox
                url={album.coverUrl}
                alt={album.title}
                accentColor={album.accentColor}
                size={160}
                showPlayOverlay
              >
                <span className="text-4xl font-bold text-white/40">◉</span>
              </CoverBox>
              <div className="flex items-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
                <HeartIcon isFilled={true} />
                <span className="truncate">{album.title}</span>
              </div>
              <div className="text-[12px] text-[#666] truncate">{album.artist} · {album.year ?? ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STATIONS TAB ──────────────────────────────────────────────────────────────

function StationsTab({ stations }: { stations: ILibraryStation[] }) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() =>
    stations.filter(s => s.title.toLowerCase().includes(filter.toLowerCase())),
    [stations, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-white">Hear the stations you&apos;ve liked:</h2>
        <FilterInput value={filter} onChange={setFilter} />
      </div>
      {filtered.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No stations match your filter</div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {filtered.map(st => (
            <div key={st.id} className="flex flex-col gap-2 group cursor-pointer">
              <CoverBox
                url={st.coverUrl}
                alt={st.title}
                accentColor={st.accentColor}
                size={160}
                showPlayOverlay
              >
                {/* Station label — z-0 so the play button (z-10) renders on top */}
                <div
                  className="absolute inset-0 flex flex-col items-start justify-end p-2 z-0"
                  style={{ background: `linear-gradient(to top, ${st.accentColor ?? "#1a1a1a"}cc, transparent)` }}
                >
                  <span className="text-[9px] font-bold text-white/70 tracking-widest">STATION</span>
                  <span className="text-[13px] font-bold text-white truncate w-full">{st.title}</span>
                </div>
              </CoverBox>
              <div className="flex items-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors truncate">
                <HeartIcon isFilled={true} />
                <span className="truncate">{st.title}</span>
              </div>
              <div className="text-[12px] text-[#666]">{st.subtitle}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FOLLOWING TAB ─────────────────────────────────────────────────────────────

function FollowingTab({ following }: { following: ILibraryFollowing[] }) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() =>
    following.filter(f => f.username.toLowerCase().includes(filter.toLowerCase())),
    [following, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-white">Hear what the people you follow have posted:</h2>
        <FilterInput value={filter} onChange={setFilter} />
      </div>
      {filtered.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No results match your filter</div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {filtered.map(f => (
            <div key={f.id} className="flex flex-col items-center gap-2 group cursor-pointer">
              <CoverBox
                url={f.avatarUrl}
                alt={f.username}
                accentColor="#2a2a2a"
                size={160}
                rounded
              >
                <span className="text-4xl font-bold text-white/40">{f.username.charAt(0).toUpperCase()}</span>
              </CoverBox>
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
                  <span className="truncate max-w-[90%]">{f.username}</span>
                  {f.isVerified && <VerifiedIcon />}
                </div>
                <div className="flex items-center justify-center gap-1 text-[12px] text-[#666]">
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  {formatNumber(f.followers)} followers
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HISTORY TAB ───────────────────────────────────────────────────────────────

function HistoryTab({
  overview,
  onClearHistory,
}: {
  overview: ILibraryOverview;
  onClearHistory: () => Promise<void>;
}) {
  const [filter, setFilter]         = useState("");
  const [isClearing, setIsClearing] = useState(false);

  const filteredRecent = useMemo(() =>
    overview.recentlyPlayed.filter(i => i.label.toLowerCase().includes(filter.toLowerCase())),
    [overview.recentlyPlayed, filter]);

  const filteredTracks = useMemo(() =>
    overview.likes.filter(t =>
      t.title.toLowerCase().includes(filter.toLowerCase()) ||
      t.artist.toLowerCase().includes(filter.toLowerCase())
    ), [overview.likes, filter]);

  const handleClearHistory = async () => {
    try {
      setIsClearing(true);
      await onClearHistory();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-white">Recently played:</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="text-[13px] text-[#aaa] hover:text-white transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear all history"}
          </button>
          <FilterInput value={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-10">
        {filteredRecent.map(item => (
          <Link key={item.id} href={item.href} className="flex flex-col items-center gap-2 group no-underline">
            <CoverBox
              url={item.coverUrl}
              alt={item.label}
              accentColor={item.accentColor}
              size={160}
              rounded={item.type === "user"}
            >
              <span className="text-4xl font-bold text-white/60">{item.label.charAt(0).toUpperCase()}</span>
            </CoverBox>
            <div className="text-center w-full">
              {item.type === "playlist" && (
                <div className="flex items-center justify-center gap-1 text-[12px] text-[#666] mb-0.5">
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <span>playlist</span>
                </div>
              )}
              <span className="text-[13px] text-[#ccc] text-center truncate w-full block group-hover:text-white transition-colors">
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-[15px] font-bold text-white mb-4">Hear the tracks you&apos;ve played:</h2>
      <div className="flex flex-col gap-6">
        {filteredTracks.map(track => <TrackListRow key={track.id} track={track} />)}
      </div>
    </div>
  );
}

// ─── OVERVIEW sections ─────────────────────────────────────────────────────────

function RecentlyPlayedSection({ items }: { items: ILibraryRecentItem[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-[15px] font-bold text-white mb-4">Recently played</h2>
      <div className="grid grid-cols-6 gap-4">
        {items.map(item => (
          <Link key={item.id} href={item.href} className="flex flex-col items-center gap-2 group no-underline">
            <CoverBox
              url={item.coverUrl}
              alt={item.label}
              accentColor={item.accentColor}
              size={160}
              rounded={item.type === "user"}
            >
              <span className="text-4xl font-bold text-white/60">{item.label.charAt(0).toUpperCase()}</span>
            </CoverBox>
            <span className="text-[13px] text-[#ccc] text-center truncate w-full group-hover:text-white transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LikesOverviewSection({ tracks }: { tracks: ILibraryTrack[] }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-white">Likes</h2>
        <span className="text-[13px] text-[#aaa] cursor-pointer hover:text-white transition-colors">Browse trending playlists</span>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {tracks.map(track => <TrackGridCard key={track.id} track={track} />)}
      </div>
    </section>
  );
}

function PlaylistsOverviewSection({ playlists }: { playlists: ILibraryPlaylist[] }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-white">Playlists</h2>
        <AllDropdown />
      </div>
      <div className="grid grid-cols-6 gap-4">
        {playlists.map(pl => (
          <div key={pl.id} className="flex flex-col gap-2 group cursor-pointer">
            <CoverBox
              url={pl.coverUrl}
              alt={pl.title}
              accentColor={pl.accentColor}
              size={160}
              showPlayOverlay
            >
              <span className="text-4xl font-bold text-white/40">≡</span>
            </CoverBox>
            <div className="text-[13px] text-[#ccc] group-hover:text-white transition-colors truncate">{pl.title}</div>
            <div className="text-[12px] text-[#666]">{pl.trackCount} tracks</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AlbumsOverviewSection({ albums }: { albums: ILibraryAlbum[] }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-white">Albums</h2>
        <AllDropdown />
      </div>
      <div className="grid grid-cols-6 gap-4">
        {albums.map(album => (
          <div key={album.id} className="flex flex-col gap-2 group cursor-pointer">
            <CoverBox
              url={album.coverUrl}
              alt={album.title}
              accentColor={album.accentColor}
              size={160}
              showPlayOverlay
            >
              <span className="text-4xl font-bold text-white/40">◉</span>
            </CoverBox>
            <div className="text-[13px] text-[#ccc] group-hover:text-white transition-colors truncate">{album.title}</div>
            <div className="text-[12px] text-[#666] truncate">{album.artist}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StationsOverviewSection({ stations }: { stations: ILibraryStation[] }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-white">Liked Stations</h2>
        <span className="text-[13px] text-[#aaa] cursor-pointer hover:text-white transition-colors">Browse all</span>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {stations.map(st => (
          <div key={st.id} className="flex flex-col gap-2 group cursor-pointer">
            <CoverBox
              url={st.coverUrl}
              alt={st.title}
              accentColor={st.accentColor}
              size={160}
              showPlayOverlay
            >
              <div
                className="absolute inset-0 flex flex-col items-start justify-end p-2 z-0"
                style={{ background: `linear-gradient(to top, ${st.accentColor ?? "#1a1a1a"}cc, transparent)` }}
              >
                <span className="text-[9px] font-bold text-white/70 tracking-widest">STATION</span>
                <span className="text-[13px] font-bold text-white truncate w-full">{st.title}</span>
              </div>
            </CoverBox>
            <div className="flex items-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors truncate">
              <HeartIcon isFilled={true} />
              <span className="truncate">{st.title}</span>
            </div>
            <div className="text-[12px] text-[#666]">{st.subtitle}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FollowingOverviewSection({ following }: { following: ILibraryFollowing[] }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-white">Following</h2>
        <span className="text-[13px] text-[#aaa] cursor-pointer hover:text-white transition-colors">Browse trending playlists</span>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {following.map(f => (
          <div key={f.id} className="flex flex-col items-center gap-2 group cursor-pointer">
            <CoverBox
              url={f.avatarUrl}
              alt={f.username}
              accentColor="#2a2a2a"
              size={160}
              rounded
            >
              <span className="text-4xl font-bold text-white/40">{f.username.charAt(0).toUpperCase()}</span>
            </CoverBox>
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
                <span className="truncate max-w-[90%]">{f.username}</span>
                {f.isVerified && <VerifiedIcon />}
              </div>
              <div className="flex items-center justify-center gap-1 text-[12px] text-[#666]">
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                {formatNumber(f.followers)} followers
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Library Page ─────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("Overview");
  const [overview, setOverview]   = useState<ILibraryOverview | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    async function loadAsync() {
      try {
        setLoading(true);
        const data = await libraryService.getOverview();
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load library");
      } finally {
        setLoading(false);
      }
    }
    loadAsync();
  }, []);

  const handleClearHistory = async () => {
    await libraryService.clearHistory();
    const fresh = await libraryService.getOverview();
    setOverview(fresh);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="text-[#888] text-sm">Loading...</span>
    </div>
  );

  if (error || !overview) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="text-[#ff5500] text-sm">{error ?? "Something went wrong"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-6">

        {/* Tab bar */}
        <div className="flex border-b border-[#1c1c1c] mb-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`bg-transparent border-none px-4 py-3 cursor-pointer text-[15px] transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-white font-bold border-b-2 border-white"
                  : "text-[#777] hover:text-[#ccc] border-b-2 border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && (
          <>
            <RecentlyPlayedSection    items={overview.recentlyPlayed} />
            <LikesOverviewSection     tracks={overview.likes} />
            <PlaylistsOverviewSection playlists={overview.playlists} />
            <AlbumsOverviewSection    albums={overview.albums} />
            <StationsOverviewSection  stations={overview.stations} />
            <FollowingOverviewSection following={overview.following} />
          </>
        )}
        {activeTab === "Likes"     && <LikesTab     tracks={overview.likes} />}
        {activeTab === "Playlists" && <PlaylistsTab playlists={overview.playlists} />}
        {activeTab === "Albums"    && <AlbumsTab    albums={overview.albums} />}
        {activeTab === "Stations"  && <StationsTab  stations={overview.stations} />}
        {activeTab === "Following" && <FollowingTab following={overview.following} />}
        {activeTab === "History"   && (
          <HistoryTab overview={overview} onClearHistory={handleClearHistory} />
        )}

      </div>
    </div>
  );
}