"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterInput } from "@/components/Library/LibraryControls";
import { CoverBox } from "@/components/Library/CoverBox";
import { TrackListRow } from "@/components/Library/LibraryTrackCard";
import type { ILibraryOverview } from "@/types/library.types";

interface IHistoryTabProps {
  overview: ILibraryOverview;
  onClearHistory: () => Promise<void>;
}

export function HistoryTab({ overview, onClearHistory }: IHistoryTabProps) {
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[22px] font-bold text-white">Recently played:</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="text-[14px] text-[#aaa] hover:text-white transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear all history"}
          </button>
          <FilterInput value={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="grid grid-cols-6 gap-6 mb-16">
        {filteredRecent.map(item => (
          <Link key={item.id} href={item.href} className="flex flex-col items-center gap-3 group no-underline">
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
              <span className="text-[14px] text-[#ccc] text-center truncate w-full block group-hover:text-white transition-colors">
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-[22px] font-bold text-white mb-6">Hear the tracks you&apos;ve played:</h2>
      <div className="flex flex-col gap-8">
        {filteredTracks.map(track => <TrackListRow key={track.id} track={track} />)}
      </div>
    </div>
  );
}