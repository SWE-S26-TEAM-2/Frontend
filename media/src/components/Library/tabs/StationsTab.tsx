"use client";

import { useState, useMemo } from "react";
import { FilterInput } from "@/components/Library/LibraryControls";
import { CoverBox } from "@/components/Library/CoverBox";
import { HeartIcon } from "@/components/Icons/TrackIcons";
import type { ILibraryStation } from "@/types/library.types";

interface IStationsTabProps {
  stations: ILibraryStation[];
}

export function StationsTab({ stations }: IStationsTabProps) {
  const [filter, setFilter] = useState("");

  const filteredStations = useMemo(() =>
    stations.filter(s => s.title.toLowerCase().includes(filter.toLowerCase())),
    [stations, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] font-bold text-white">Hear the stations you&apos;ve liked:</h2>
        <FilterInput value={filter} onChange={setFilter} />
      </div>
      {filteredStations.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No stations match your filter</div>
      ) : (
        <div className="grid grid-cols-6 gap-6">
          {filteredStations.map(st => (
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
      )}
    </div>
  );
}