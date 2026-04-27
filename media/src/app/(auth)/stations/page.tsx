"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import StationCard from "@/components/Station/StationCard";
import { useStationStore } from "@/store/stationstore";
import { stationService } from "@/services";
import type { IStation } from "@/types/station.types";

// ── FOOTER LINKS ──────────────────────────────────────────────────────────────

const FOOTER_LINKS = [
  { label: "Legal",                href: "https://soundcloud.com/terms-of-use" },
  { label: "Privacy",              href: "https://soundcloud.com/pages/privacy" },
  { label: "Cookie Policy",        href: "https://soundcloud.com/pages/cookies" },
  { label: "Cookie Manager",       href: "#" },
  { label: "Imprint",              href: "https://soundcloud.com/imprint" },
  { label: "Artist Resources",     href: "https://soundcloud.com/getstarted/getheard" },
  { label: "Newsroom",             href: "https://soundcloud.com/company/newsroom" },
  { label: "Charts",               href: "https://soundcloud.com/charts/top" },
  { label: "Transparency Reports", href: "https://soundcloud.com/transparency-reports" },
];

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function StationsPage() {
  const { likedStations, likeStation } = useStationStore();

  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(true);

  // On first load — seed the store with API/mock data for stations
  // that were liked before this session (e.g. from the API).
  // Store already persists across sessions via localStorage, so this
  // only adds stations the user liked on other devices / before store existed.
  useEffect(() => {
    stationService.getLikedStations()
      .then((apiStations) => {
        apiStations.forEach((s) => likeStation(s));
      })
      .catch((e) => console.error("Failed to seed liked stations:", e))
      .finally(() => setLoading(false));
  }, []);                       // run once on mount

  // ── Local filter ───────────────────────────────────────────────────────────
  const filtered: IStation[] = likedStations.filter((s) => {
    if (!query.trim()) return true;
    const kw = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(kw) ||
      s.artistName.toLowerCase().includes(kw) ||
      s.genre?.toLowerCase().includes(kw)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />

      <div style={pg.pageWrapper}>
        <div style={pg.container}>

          {/* Heading */}
          <div style={pg.heading}>
            <h1 style={pg.headingTitle}>Your Stations</h1>
            <p style={pg.headingSubtitle}>
              Stations based on tracks you&apos;ve listened to
            </p>
          </div>

          {/* Search bar */}
          <div style={pg.searchWrapper}>
            <div style={pg.searchBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#555" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Filter stations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={pg.searchInput}
              />
              {query && (
                <button style={pg.clearBtn} onClick={() => setQuery("")}>
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={pg.grid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={pg.skeleton} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={pg.emptyState}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
                stroke="#2a2a2a" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <p style={pg.emptyTitle}>
                {query
                  ? `No stations matching "${query}"`
                  : "No liked stations yet"}
              </p>
              <p style={pg.emptySubtitle}>
                {query
                  ? "Try a different search term"
                  : "Like a station on the home page to see it here"}
              </p>
            </div>
          )}

          {/* Station grid */}
          {!loading && filtered.length > 0 && (
            <div style={pg.grid}>
              {filtered.map((station) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          )}

          {/* Footer links */}
          <div style={pg.footerLinks}>
            {FOOTER_LINKS.map((link, i) => (
              <React.Fragment key={link.label}>
                {i > 0 && <span style={pg.dot}>·</span>}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  style={pg.footerLink}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                >
                  {link.label}
                </a>
              </React.Fragment>
            ))}
            <div style={{ width: "100%", marginTop: 8 }}>
              <span style={{ color: "#555", fontSize: 11 }}>Language: </span>
              <span style={{ color: "#888", fontSize: 11 }}>English (US)</span>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const pg: Record<string, React.CSSProperties> = {
  pageWrapper: {
    backgroundColor: "#0a0a0a",
    minHeight:       "100vh",
    width:           "100%",
    paddingBottom:   80,
  },
  container: {
    maxWidth: 1240,
    margin:   "0 auto",
    padding:  "40px 20px",
  },
  heading: {
    marginBottom:  32,
    paddingBottom: 20,
    borderBottom:  "1px solid #1a1a1a",
  },
  headingTitle: {
    fontSize:     26,
    fontWeight:   800,
    color:        "#fff",
    margin:       0,
    marginBottom: 6,
  },
  headingSubtitle: {
    fontSize: 13,
    color:    "#555",
    margin:   0,
  },
  searchWrapper: { marginBottom: 32 },
  searchBox: {
    display:      "flex",
    alignItems:   "center",
    gap:          8,
    background:   "#141414",
    border:       "1px solid #2a2a2a",
    borderRadius: 6,
    padding:      "0 12px",
    height:       38,
    maxWidth:     360,
  },
  searchInput: {
    flex:       1,
    background: "transparent",
    border:     "none",
    color:      "#fff",
    fontSize:   13,
    outline:    "none",
    fontFamily: "inherit",
  },
  clearBtn: {
    background: "none",
    border:     "none",
    color:      "#555",
    fontSize:   18,
    cursor:     "pointer",
    lineHeight: 1,
    padding:    "0 2px",
  },
  grid: {
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap:                 24,
    marginBottom:        48,
  },
  skeleton: {
    aspectRatio:  "1",
    borderRadius: 6,
    background:   "#141414",
    animation:    "pulse 1.4s ease-in-out infinite",
  },
  emptyState: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           14,
    padding:       "80px 20px",
    textAlign:     "center",
  },
  emptyTitle: {
    fontSize:   16,
    fontWeight: 700,
    color:      "#444",
    margin:     0,
  },
  emptySubtitle: {
    fontSize:   13,
    color:      "#333",
    margin:     0,
    maxWidth:   280,
    lineHeight: 1.6,
  },
  footerLinks: {
    display:    "flex",
    flexWrap:   "wrap",
    alignItems: "center",
    gap:        "4px 0",
    paddingTop: 32,
    borderTop:  "1px solid #1a1a1a",
  },
  footerLink: {
    color:          "#555",
    fontSize:       11,
    textDecoration: "none",
    transition:     "color 0.15s",
  },
  dot: {
    color:    "#333",
    fontSize: 11,
    margin:   "0 6px",
  },
};
