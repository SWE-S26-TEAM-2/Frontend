"use client";

import { useState, useMemo } from "react";
import { FilterInput, AllDropdown } from "@/components/Library/LibraryControls";
import { CoverBox } from "@/components/Library/CoverBox";
import { HeartIcon } from "@/components/Icons/TrackIcons";
import type { ILibraryAlbum } from "@/types/library.types";

interface IAlbumsTabProps {
  albums: ILibraryAlbum[];
}

export function AlbumsTab({ albums }: IAlbumsTabProps) {
  const [filter, setFilter] = useState("");

  const filteredAlbums = useMemo(() =>
    albums.filter(a =>
      a.title.toLowerCase().includes(filter.toLowerCase()) ||
      a.artist.toLowerCase().includes(filter.toLowerCase())
    ), [albums, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] font-bold text-white">Hear your own albums and the albums you&apos;ve liked:</h2>
        <div className="flex items-center gap-3">
          <FilterInput value={filter} onChange={setFilter} />
          <AllDropdown />
        </div>
      </div>
      {filteredAlbums.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No albums match your filter</div>
      ) : (
        <div className="grid grid-cols-6 gap-6">
          {filteredAlbums.map(album => (
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