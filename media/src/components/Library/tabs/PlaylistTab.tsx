"use client";

import { useState, useMemo } from "react";
import { FilterInput, AllDropdown } from "@/components/Library/LibraryControls";
import { CoverBox } from "@/components/Library/CoverBox";
import type { ILibraryPlaylist } from "@/types/library.types";

interface IPlaylistsTabProps {
  playlists: ILibraryPlaylist[];
}

export function PlaylistsTab({ playlists }: IPlaylistsTabProps) {
  const [filter, setFilter] = useState("");

  const filteredPlaylists = useMemo(() =>
    playlists.filter(p => p.title.toLowerCase().includes(filter.toLowerCase())),
    [playlists, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] font-bold text-white">Hear your own playlists and the playlists you&apos;ve liked:</h2>
        <div className="flex items-center gap-3">
          <FilterInput value={filter} onChange={setFilter} />
          <AllDropdown />
        </div>
      </div>
      {filteredPlaylists.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No playlists match your filter</div>
      ) : (
        <div className="grid grid-cols-6 gap-6">
          {filteredPlaylists.map(pl => (
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