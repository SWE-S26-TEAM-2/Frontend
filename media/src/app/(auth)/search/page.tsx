"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/Search/SearchBar";
import { TrackCard } from "@/components/Track/TrackCard";
import {
  searchService,
  resolveAvatarUrl,
  resolvePlaylistCover,
} from "@/services/api/search.api";
import type { ISearchResults, IRawSearchUser, IRawSearchPlaylist } from "@/types/search.types";
import type { ITrack } from "@/types/track.types";
import { usePlayerStore } from "@/store/playerStore";

// ── TABS ──────────────────────────────────────────────────────────────────────

type ITab = "all" | "tracks" | "people" | "playlists";

const TABS: { id: ITab; label: string }[] = [
  { id: "all",       label: "All"       },
  { id: "tracks",    label: "Tracks"    },
  { id: "people",    label: "People"    },
  { id: "playlists", label: "Playlists" },
];

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam   = searchParams.get("q") ?? "";

  const { setTrack, setQueue } = usePlayerStore();

  // Derive tab from URL or default to "all" — avoids setState-in-effect
  const [tab, setTab]         = useState<ITab>("all");
  const [results, setResults] = useState<ISearchResults>({ tracks: [], users: [], playlists: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ── Fetch — combine tab reset + fetch into one effect ─────────────────────
  useEffect(() => {
    // Reset tab and results synchronously before async work
    setTab("all");

    if (!queryParam.trim()) {
      setResults({ tracks: [], users: [], playlists: [] });
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    searchService.searchAll(queryParam)
      .then((data) => { if (!cancelled) { setResults(data); setLoading(false); } })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message ?? "Something went wrong");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam]);

  const total = results.tracks.length + results.users.length + results.playlists.length;

  const counts: Record<ITab, number> = useMemo(() => ({
    all:       total,
    tracks:    results.tracks.length,
    people:    results.users.length,
    playlists: results.playlists.length,
  }), [results, total]);

  const handlePlay = useCallback((track: ITrack) => {
    setQueue(results.tracks);
    setTrack(track);
  }, [results.tracks, setTrack, setQueue]);

  return (
    <div style={pg.page}>

      {/* Header */}
      <header style={pg.header}>
        <div style={pg.headerInner}>
          <Link href="/" style={pg.logo}>soundcloud</Link>
          <div style={pg.searchWrapper}>
            <SearchBar defaultValue={queryParam} />
          </div>
        </div>
      </header>

      <div style={pg.body}>

        {/* Heading */}
        {queryParam && (
          <div style={pg.heading}>
            <h1 style={pg.headingTitle}>
              {loading ? "Searching…" : `Results for "${queryParam}"`}
            </h1>
            {!loading && !error && (
              <span style={pg.headingCount}>{total} result{total !== 1 ? "s" : ""}</span>
            )}
          </div>
        )}

        {!queryParam && <EmptyState message="Start typing to find tracks, artists and playlists." />}
        {error        && <ErrorState message={error} />}
        {loading      && <LoadingSkeleton />}

        {!loading && !error && queryParam && (
          <>
            {/* Tabs */}
            <div style={pg.tabs}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    ...pg.tab,
                    color:        tab === t.id ? "#fff" : "#666",
                    borderBottom: tab === t.id ? "2px solid #ff5500" : "2px solid transparent",
                  }}
                >
                  {t.label}
                  {counts[t.id] > 0 && <span style={pg.badge}>{counts[t.id]}</span>}
                </button>
              ))}
            </div>

            {total === 0 && (
              <EmptyState message={`No results for "${queryParam}". Try a different keyword.`} />
            )}

            {/* Tracks */}
            {(tab === "all" || tab === "tracks") && results.tracks.length > 0 && (
              <section style={pg.section}>
                {tab === "all" && (
                  <SectionHeader title="Tracks" count={results.tracks.length} onSeeAll={() => setTab("tracks")} />
                )}
                <div>
                  {(tab === "all" ? results.tracks.slice(0, 5) : results.tracks).map((track) => (
                    <TrackCard key={track.id} track={track} onPlay={handlePlay} />
                  ))}
                </div>
              </section>
            )}

            {/* People */}
            {(tab === "all" || tab === "people") && results.users.length > 0 && (
              <section style={pg.section}>
                {tab === "all" && (
                  <SectionHeader title="People" count={results.users.length} onSeeAll={() => setTab("people")} />
                )}
                <div style={pg.userGrid}>
                  {(tab === "all" ? results.users.slice(0, 4) : results.users).map((user) => (
                    <UserCard key={user.user_id} user={user} />
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {(tab === "all" || tab === "playlists") && results.playlists.length > 0 && (
              <section style={pg.section}>
                {tab === "all" && (
                  <SectionHeader title="Playlists" count={results.playlists.length} onSeeAll={() => setTab("playlists")} />
                )}
                <div style={pg.playlistGrid}>
                  {(tab === "all" ? results.playlists.slice(0, 4) : results.playlists).map((pl) => (
                    <PlaylistCard key={pl.playlist_id} playlist={pl} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function SectionHeader({ title, count, onSeeAll }: { title: string; count: number; onSeeAll: () => void }) {
  return (
    <div style={pg.sectionHeader}>
      <h2 style={pg.sectionTitle}>{title}</h2>
      {count > 5 && (
        <button style={pg.seeAll} onClick={onSeeAll}>See all {count} →</button>
      )}
    </div>
  );
}

function UserCard({ user }: { user: IRawSearchUser }) {
  return (
    <div style={pg.userCard}>
      <Image
        src={resolveAvatarUrl(user.profile_picture)}
        alt={user.display_name}
        width={68}
        height={68}
        style={pg.avatar}
        onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png"; }}
      />
      <span style={pg.userName}>{user.display_name}</span>
      <span style={pg.userType}>{user.account_type}</span>
      <div style={pg.userStats}>
        <span style={pg.stat}>{user.follower_count.toLocaleString()} followers</span>
        <span style={pg.stat}>{user.track_count} tracks</span>
      </div>
      <button style={pg.followBtn}>Follow</button>
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: IRawSearchPlaylist }) {
  return (
    <div style={pg.playlistCard}>
      <div style={pg.plCover}>
        <Image
          src={resolvePlaylistCover(playlist.cover_photo)}
          alt={playlist.title}
          fill
          style={{ objectFit: "cover" }}
          onError={(e) => { (e.target as HTMLImageElement).src = "/default-track-cover.png"; }}
        />
      </div>
      <span style={pg.plTitle}>{playlist.title}</span>
      {playlist.description && (
        <span style={pg.plDesc}>
          {playlist.description.slice(0, 64)}{playlist.description.length > 64 ? "…" : ""}
        </span>
      )}
      <span style={pg.plMeta}>{playlist.track_count} track{playlist.track_count !== 1 ? "s" : ""}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={pg.empty}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <p style={pg.emptyText}>{message}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={pg.empty}>
      <p style={{ ...pg.emptyText, color: "#ff5500" }}>Error: {message}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 24 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={pg.skeleton} />
      ))}
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const pg: Record<string, React.CSSProperties> = {
  page:         { backgroundColor: "#0a0a0a", minHeight: "100vh", color: "#fff" },
  header:       { position: "sticky", top: 0, zIndex: 1000, backgroundColor: "#111", borderBottom: "1px solid #1e1e1e", height: 60, display: "flex", alignItems: "center", justifyContent: "center" },
  headerInner:  { width: "100%", maxWidth: 1240, padding: "0 20px", display: "flex", alignItems: "center", gap: 24 },
  logo:         { color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", flexShrink: 0 },
  searchWrapper:{ flex: 1, maxWidth: 560 },
  body:         { maxWidth: 1240, margin: "0 auto", padding: "32px 20px 80px" },
  heading:      { display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 },
  headingTitle: { fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 },
  headingCount: { fontSize: 13, color: "#555" },
  tabs:         { display: "flex", borderBottom: "1px solid #1e1e1e", marginBottom: 32 },
  tab:          { background: "none", border: "none", padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" },
  badge:        { fontSize: 10, background: "#ff5500", color: "#fff", borderRadius: 10, padding: "1px 6px", fontWeight: 700 },
  section:      { marginBottom: 44 },
  sectionHeader:{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 },
  seeAll:       { background: "none", border: "none", color: "#ff5500", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  userGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 16 },
  userCard:     { display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "20px 14px", background: "#111", borderRadius: 8, border: "1px solid #1e1e1e", cursor: "pointer", textAlign: "center" },
  avatar:       { borderRadius: "50%", objectFit: "cover" as const },
  userName:     { color: "#fff", fontSize: 13, fontWeight: 600 },
  userType:     { color: "#ff5500", fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  userStats:    { display: "flex", flexDirection: "column" as const, gap: 2, alignItems: "center" },
  stat:         { color: "#555", fontSize: 11 },
  followBtn:    { marginTop: 4, padding: "4px 16px", borderRadius: 12, border: "1px solid #ff5500", background: "transparent", color: "#ff5500", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  playlistGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 20 },
  playlistCard: { display: "flex", flexDirection: "column" as const, gap: 5, cursor: "pointer" },
  plCover:      { position: "relative" as const, width: "100%", aspectRatio: "1", borderRadius: 6, overflow: "hidden", background: "#1e1e1e", marginBottom: 4 },
  plTitle:      { color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  plDesc:       { color: "#555", fontSize: 12 },
  plMeta:       { color: "#444", fontSize: 11 },
  empty:        { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16, padding: "72px 20px" },
  emptyText:    { color: "#444", fontSize: 14, textAlign: "center" as const, maxWidth: 340, lineHeight: 1.6, margin: 0 },
  skeleton:     { height: 72, borderRadius: 6, background: "#141414" },
};
