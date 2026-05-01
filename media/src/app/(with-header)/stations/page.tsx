"use client";

import React, { useState, useEffect } from "react";

import StationCard from "@/components/Station/StationCard";
import { useStationStore } from "@/store/stationstore";
import { stationService } from "@/services";
import type { IStation } from "@/types/station.types";

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

export default function StationsPage() {
  const { likedStations, likeStation } = useStationStore();

  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stationService.getLikedStations()
      .then((apiStations) => { apiStations.forEach((s) => likeStation(s)); })
      .catch((e) => console.error("Failed to seed liked stations:", e))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered: IStation[] = likedStations.filter((s) => {
    if (!query.trim()) return true;
    const kw = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(kw) ||
      s.artistName.toLowerCase().includes(kw) ||
      s.genre?.toLowerCase().includes(kw)
    );
  });

  return (
    <div className="bg-[#0a0a0a] min-h-screen w-full pb-20">
      <div className="max-w-[1240px] mx-auto px-5 pt-10">

        {/* Heading */}
        <div className="mb-8 pb-5 border-b border-[#1a1a1a]">
          <h1 className="text-[26px] font-extrabold text-white mb-1.5">Your Stations</h1>
          <p className="text-[13px] text-[#555]">
            Stations based on tracks you&apos;ve listened to
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 bg-[#141414] border border-[#2a2a2a] rounded-md px-3 h-[38px] max-w-[360px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#555" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter stations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-white text-[13px] outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="bg-transparent border-none text-[#555] text-lg cursor-pointer leading-none px-0.5 hover:text-white transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 mb-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-md bg-[#141414] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3.5 py-20 px-5 text-center">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
              stroke="#2a2a2a" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <p className="text-base font-bold text-[#444]">
              {query ? `No stations matching "${query}"` : "No liked stations yet"}
            </p>
            <p className="text-[13px] text-[#333] max-w-[280px] leading-relaxed">
              {query
                ? "Try a different search term"
                : "Like a station on the home page to see it here"}
            </p>
          </div>
        )}

        {/* Station grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 mb-12">
            {filtered.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        )}

        {/* Footer links */}
        <div className="flex flex-wrap items-center pt-8 border-t border-[#1a1a1a]">
          {FOOTER_LINKS.map((link, i) => (
            <React.Fragment key={link.label}>
              {i > 0 && <span className="text-[#333] text-[11px] mx-1.5">·</span>}
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[#555] text-[11px] no-underline hover:text-white transition-colors"
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
          <div className="w-full mt-2">
            <span className="text-[#555] text-[11px]">Language: </span>
            <span className="text-[#888] text-[11px]">English (US)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
