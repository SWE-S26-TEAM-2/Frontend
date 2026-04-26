"use client";

import { useState, useMemo } from "react";
import { FilterInput, ViewToggle } from "@/components/Library/LibraryControls";
import { TrackListRow, TrackGridCard } from "@/components/Library/LibraryTrackCard";
import type { ILibraryTrack, ViewMode } from "@/types/library.types";

interface ILikesTabProps {
  tracks: ILibraryTrack[];
}

export function LikesTab({ tracks }: ILikesTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filter, setFilter]     = useState("");

  const filteredTracks = useMemo(() =>
    tracks.filter(t =>
      t.title.toLowerCase().includes(filter.toLowerCase()) ||
      t.artist.toLowerCase().includes(filter.toLowerCase())
    ), [tracks, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] font-bold text-white">Hear the tracks you&apos;ve liked:</h2>
        <div className="flex items-center gap-4">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <FilterInput value={filter} onChange={setFilter} />
        </div>
      </div>
      {filteredTracks.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No tracks match your filter</div>
      ) : viewMode === "list" ? (
        <div className="flex flex-col gap-8">
          {filteredTracks.map(track => <TrackListRow key={track.id} track={track} />)}
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-6">
          {filteredTracks.map(track => <TrackGridCard key={track.id} track={track} />)}
        </div>
      )}
    </div>
  );
}